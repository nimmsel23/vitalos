import UIKit
import Capacitor
import HealthKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = HealthBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

// Registered in the existing compiled source so Capacitor sync cannot lose the bridge.
class HealthBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(VitalOSHealthProfilePlugin())
    }
}

@objc(VitalOSHealthProfilePlugin)
class VitalOSHealthProfilePlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "VitalOSHealthProfilePlugin"
    let jsName = "VitalOSHealthProfile"
    let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "readProfile", returnType: CAPPluginReturnPromise)]
    private let store = HKHealthStore()

    @objc func readProfile(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(),
              let height = HKObjectType.quantityType(forIdentifier: .height),
              let weight = HKObjectType.quantityType(forIdentifier: .bodyMass) else {
            call.reject("Apple Health ist auf diesem Gerät nicht verfügbar.")
            return
        }
        let includeBirthDate = call.getBool("includeBirthDate") ?? false
        var types: Set<HKObjectType> = [height, weight]
        if includeBirthDate, let birthDate = HKObjectType.characteristicType(forIdentifier: .dateOfBirth) {
            types.insert(birthDate)
        }
        store.requestAuthorization(toShare: [], read: types) { success, error in
            guard success, error == nil else {
                call.reject("Die Health-Freigabe konnte nicht abgeschlossen werden.")
                return
            }
            // Read authorization is intentionally opaque on iOS. Missing/denied fields stay absent.
            self.latest(height, unit: HKUnit.meterUnit(with: .centi), unitName: "centimeter") { heightSample in
                self.latest(weight, unit: .gramUnit(with: .kilo), unitName: "kilogram") { weightSample in
                    var result: [String: Any] = [:]
                    if let sample = heightSample { result["heightCm"] = sample }
                    if let sample = weightSample { result["weightKg"] = sample }
                    if includeBirthDate, let components = try? self.store.dateOfBirthComponents(),
                       let y = components.year, let m = components.month, let d = components.day {
                        result["birthDate"] = String(format: "%04d-%02d-%02d", y, m, d)
                    }
                    call.resolve(result)
                }
            }
        }
    }

    private func latest(_ type: HKQuantityType, unit: HKUnit, unitName: String,
                        completion: @escaping ([String: Any]?) -> Void) {
        let query = HKSampleQuery(sampleType: type,
            predicate: HKQuery.predicateForSamples(withStart: nil, end: Date(), options: .strictEndDate),
            limit: 1, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]) { _, samples, _ in
            guard let sample = samples?.first as? HKQuantitySample else { completion(nil); return }
            completion(["value": sample.quantity.doubleValue(for: unit), "unit": unitName,
                        "startDate": ISO8601DateFormatter().string(from: sample.startDate)])
        }
        store.execute(query)
    }
}
