package com.vitalos.app.focus

// ENTWURF — Fokus-Sperre Stufe 1: Nutzungsmessung per UsageStatsManager.
// Skizze, NICHT gebaut und NICHT kompiliert; gehört der Android-Linie zur
// Endintegration. Siehe prod/docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md.
//
// Endintegration (offen, von der Android-Linie auszuführen):
//   1. Datei verschieben nach
//      prod/android/app/src/main/java/com/vitalos/app/focus/UsageStatsPlugin.kt
//      (Package-Name entspricht MainActivity: com.vitalos.app).
//   2. AndroidManifest.xml:
//        <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
//          tools:ignore="ProtectedPermissions" />
//   3. Registrierung in MainActivity.java (BridgeActivity):
//      in onCreate() vor super: register(UsageStatsPlugin.class) bzw.
//      bridge.registerPlugin(UsageStatsPlugin.class).
//   4. Web-Seite: Typ-Deklaration (declare module) + Aufrufrufer:
//      hasPermission -> requestPermission -> getTodayUsage.
//
// Berechtigungsfluss (Stufe 1, PACKAGE_USAGE_STATS ist eine besondere
// App-Ops-Berechtigung, KEIN Runtime-Dialog):
//   - hasPermission(): Prüft per AppOpsManager.unsafeCheckOpNoThrow, ob der Nutzer
//     „Nutzungszugriff" erteilt hat. Liefert nie einen Crash, nur true/false.
//   - requestPermission(): Startet settings.ACTION_USAGE_ACCESS_SETTINGS; der Nutzer
//     erteilt die Berechtigung selbst in den Systemeinstellungen; die App führt
//     dorthin, erklärt vorher, wofür der Zugriff gebraucht wird.
//   - Zurück in der App (onActivityResult) wird hasPermission erneut geprüft und das
//     gespeicherte PluginCall aufgelöst (UserDenied, falls immer noch nicht erlaubt).
//     Ablehnung MUSS absturzfrei bleiben (Prüfkriterium des Auftrags).
//   - Daten bleiben lokal auf dem Gerät; kein Upload, kein Backend-Deploy.

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.Calendar

@CapacitorPlugin(name = "UsageStats")
class UsageStatsPlugin : Plugin() {

    companion object {
        private const val REQUEST_CODE_USAGE_ACCESS = 7001
    }

    /** Offener call von requestPermission(), wird nach Rückkehr aus den Einstellungen aufgelöst. */
    private var pendingPermissionCall: PluginCall? = null

    private fun hasUsageAccess(): Boolean {
        val context: Context = this.context ?: return false
        val appOps = context.getSystemService(AppOpsManager::class.java) ?: return false
        val mode = appOps.unsafeCheckOpNoThrow(
            AppOpsManager.OPSTR_PACKAGE_USAGE_STATS,
            Process.myUid(),
            context.packageName,
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    @PluginMethod
    fun hasPermission(call: PluginCall) {
        val ret = JSObject()
        ret.put("granted", hasUsageAccess())
        call.resolve(ret)
    }

    /** Öffnet die Systemeinstellungen „Nutzungszugriff"; Auflösung in onActivityResult. */
    @PluginMethod
    fun requestPermission(call: PluginCall) {
        val context: Context = this.context ?: run { call.reject("Context nicht verfügbar"); return }
        pendingPermissionCall = call
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        startActivityForResult(call, intent, REQUEST_CODE_USAGE_ACCESS)
        // Auflösung folgt in onActivityResult; kein resolve hier (Nutzer entscheidet in den Einstellungen).
    }

    override fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.handleOnActivityResult(requestCode, resultCode, data)
        if (requestCode != REQUEST_CODE_USAGE_ACCESS) return
        val call = pendingPermissionCall
        pendingPermissionCall = null
        if (call == null) return
        val ret = JSObject()
        val granted = hasUsageAccess()
        ret.put("granted", granted)
        if (granted) call.resolve(ret) else call.reject("USER_DENIED") // Ablehnung: kontrolliert, kein Crash
    }

    /**
     * Bildschirmzeit des heutigen Kalendertags (lokal), aggregiert je App.
     * Liefert: { totalMinutes: number, apps: [{ packageName, minutes }] } — Top 5 je
     * Vordergrundzeit, absteigend; die eigene App wird ausgeschlossen.
     *
     * Messweg: UsageEvents-Stitching (Vor-/Zurueck-Events je Paket zusammensetzen),
     * weil UsageStats.totalTimeInForeground System-UI-Zeiten und gesperrte
     * Bildschirmaus-Zeitraeume mitschleicht und erfahrungsgemaess gegenueber
     * Digital Wellbeing ueberzeichnet. Offene/abgebrochene Intervalle werden am
     * Tagesrand [start, now] geklemmt; Events liefert das System chronologisch.
     * Fallback, falls heute gar keine Events vorliegen (selten, z. B. gerade
     * gebootet): queryAndAggregateUsageStats als Naeherung mit Kennzeichnung
     * `approximate: true`.
     */
    @PluginMethod
    fun getTodayUsage(call: PluginCall) {
        if (!hasUsageAccess()) { call.reject("PERMISSION_DENIED"); return }
        val context: Context = this.context ?: run { call.reject("Context nicht verfügbar"); return }
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: run { call.reject("UsageStatsManager nicht verfügbar"); return }

        val start = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        val end = System.currentTimeMillis().coerceAtLeast(start)
        val ownPackage = context.packageName

        // 1) Ereignis-Stitching: RESUME/FOREGROUND oeffnet ein Intervall,
        //    PAUSE/STOP/BACKGROUND schliesst es. ACTIVITY_RESUMED/PAUSED/STOPPED sind
        //    nur neuere Alias-Namen derselben Konstanten wie MOVE_TO_*.
        val moveToBack = setOf(
            UsageEvents.Event.MOVE_TO_BACKGROUND,
            UsageEvents.Event.ACTIVITY_STOPPED,
        )
        val open = mutableMapOf<String, Long>() // packageName -> Resume-Zeitpunkt
        val totals = HashMap<String, Long>()

        var events = usm.queryEvents(start, end)
        var event = UsageEvents.Event()
        var sawEvents = false
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.packageName == ownPackage) continue
            when (event.eventType) {
                UsageEvents.Event.MOVE_TO_FOREGROUND -> {
                    // Bereits offenes Intervall desselben Pakets ersetzen: ohne
                    // zugehoeriges Ende-Event wuerde die Zeit ab Resume doppelt zaehlen.
                    open[event.packageName] = event.timeStamp
                }
                in moveToBack -> {
                    val from = open.remove(event.packageName) ?: continue
                    val until = event.timeStamp.coerceAtMost(end).coerceAtLeast(from)
                    totals.merge(event.packageName, until - from, Long::plus)
                }
                else -> {
                    // CONFIGURATION_CHANGE, USER_PRESENT etc.: kein Vordergrund-Nachweis;
                    // bewusst ignorieren statt mitzaehlen.
                }
            }
            sawEvents = true
        }
        // Noch offene Intervalle (App im Vordergrund WAEHREND des Aufrufs) bis `end` zaehlen.
        for ((pkg, from) in open) {
            totals.merge(pkg, end - from.coerceAtMost(end), Long::plus)
        }

        // 2) Fallback, falls das System heute noch keine Events geliefert hat.
        var approximate = false
        if (!sawEvents) {
            approximate = true
            for (stat in usm.queryAndAggregateUsageStats(start, end).values) {
                if (stat.packageName != ownPackage && stat.totalTimeInForeground > 0) {
                    totals[stat.packageName] = stat.totalTimeInForeground
                }
            }
        }

        val apps = totals.entries
            .filter { it.value > 0 }
            .sortedByDescending { it.value }
            .take(5)
            .map { JSObject().put("packageName", it.key).put("minutes", Math.round(it.value / 60000.0)) }

        val ret = JSObject()
        ret.put("totalMinutes", Math.round(totals.values.sum() / 60000.0))
        ret.put("approximate", approximate)
        ret.put("apps", JSArray(apps))
        call.resolve(ret)
        // Vergleich mit Digital Wellbeing (Prüfkriterium) nur auf echtem Gerät möglich — offen.
    }
}
