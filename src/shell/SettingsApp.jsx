import Settings from '@view/settings/index.jsx'

export default function SettingsApp({ user, signOut, compact = false }) {
  return (
    <div className={`${compact ? 'p-4' : 'p-4 sm:p-8 lg:p-12'} max-w-[1600px] mx-auto`}>
      <Settings user={user} signOut={signOut} />
    </div>
  )
}
