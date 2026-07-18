import FitnessDashboard from '../fitness/Dashboard.jsx'
import FuelDashboardWidget from './FuelDashboardWidget.jsx'

/**
 * Shell-Dashboard — bündelt die Tempel-Dashboards, analog zum Settings-Tab
 * (src/shell/Settings/index.jsx): Shell komponiert, Sub-Repos liefern die
 * fertigen Sektionen via Alias, kein Doppel-Code.
 */
export default function Dashboard({ navigate, ...fitnessProps }) {
  return (
    <div className="pb-32">
      <FitnessDashboard navigate={navigate} {...fitnessProps} />

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-black uppercase tracking-wider text-fit-muted">
          Fuel — Heute
        </h2>
        <FuelDashboardWidget navigate={navigate} />
      </section>
    </div>
  )
}
