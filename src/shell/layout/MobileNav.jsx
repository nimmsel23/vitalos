import { useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronRight, ExternalLink, Home, Keyboard, LayoutGrid, MoreHorizontal, NotebookPen, X } from 'lucide-react'
import { NAV_ITEMS, SUB_NAV, buildFitnessGateItems } from '@shell/NavigationItems'
import { useSwipeToDismiss } from '@fitness/hooks/useSwipeToDismiss.js'
import { handleSheetKeys } from '../keyboard.js'
import { useSheetFocus } from '../useSheetFocus.js'

// iOS-artige Tab-Bar: fünf feste Slots, immer an derselben Stelle.
// Erneutes Tippen auf den aktiven Tab öffnet ein Sheet mit dessen
// Unterbereichen (statt der früheren, horizontal scrollenden Pill-Leiste
// in der Bar selbst — die Sub-Tabs leben jetzt im ShellHeader).
const PRIMARY_IDS = ['home', 'fitness', 'fuel', 'relax']
const MORE_IDS = ['sixpack', 'habits', 'door', 'game', 'settings']

function flattenSubNav(subNav = []) {
  return subNav.flatMap((item) => {
    const base = item.hideInFlatNav
      ? []
      : [{ id: item.id, label: item.label, Icon: item.Icon }]
    const nested = (item.sub || []).map((child) => ({ id: child.id, label: child.label, Icon: child.Icon }))
    return [...base, ...nested]
  })
}

function getPanelGroups(panelId) {
  if (panelId === 'fitness') return buildFitnessGateItems()
  if (panelId === 'fuel') return [{ group: 'Fuel', items: flattenSubNav(SUB_NAV.fuel) }]
  if (panelId === 'relax') return [{ group: 'Relax', items: flattenSubNav(SUB_NAV.relax) }]
  return []
}

function findApp(id) {
  return NAV_ITEMS.find((item) => item.id === id)
}

function SheetRow({ Icon, label, active, onClick, hint, href }) {
  const ResolvedIcon = Icon || NotebookPen
  const Row = href ? 'a' : 'button'
  return (
    <Row
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { type: 'button' })}
      onClick={onClick}
      className={`vos-press flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${active ? 'bg-fit-accent/15' : 'active:bg-white/5'}`}
      style={active ? { background: 'color-mix(in srgb, var(--accent) 14%, transparent)' } : undefined}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: active ? 'var(--accent)' : 'color-mix(in srgb, var(--ink) 7%, transparent)',
          color: active ? '#0b0e14' : 'var(--ink)',
        }}
      >
        <ResolvedIcon size={17} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-fit-ink">{label}</span>
        {hint ? <span className="block truncate text-[12px] text-fit-dim">{hint}</span> : null}
      </span>
      {href ? <ExternalLink size={16} className="shrink-0 text-fit-dim/60" /> : active ? <Check size={16} className="shrink-0 text-fit-accent" /> : <ChevronRight size={16} className="shrink-0 text-fit-dim/60" />}
    </Row>
  )
}

export default function MobileNav({ tab, navigate, subTab = null, homeGate = null, expanded = true, onExpandedChange, onKeyboardHelp }) {
  const [panelId, setPanelId] = useState(null)
  const [dragY, setDragY] = useState(null)
  const tabsId = useId()
  const tabsRef = useRef(null)
  const gripRef = useRef(null)
  const gestureRef = useRef(null)
  const suppressClickRef = useRef(false)
  const panelGroups = useMemo(() => getPanelGroups(panelId), [panelId])
  const activeSlot = PRIMARY_IDS.includes(tab) ? tab : (tab === 'journal' ? 'home' : 'more')
  const hubOpen = tab === 'home' && homeGate === 'hub'

  function close() { setPanelId(null) }

  const backdropRef = useRef(null)
  const sheetRef = useSwipeToDismiss(close, { enabled: Boolean(panelId), backdropRef })
  useSheetFocus(sheetRef, Boolean(panelId))

  function setExpanded(next) {
    if (!next) {
      close()
      if (tabsRef.current?.contains(document.activeElement) || sheetRef.current?.contains(document.activeElement)) gripRef.current?.focus({ preventScroll: true })
    }
    onExpandedChange?.(next)
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0) return
    suppressClickRef.current = false
    gestureRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, dragging: false }
  }

  function moveDrag(event) {
    const gesture = gestureRef.current
    if (!gesture || gesture.id !== event.pointerId) return
    const dy = event.clientY - gesture.y
    const dx = event.clientX - gesture.x
    if (!gesture.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return
      if (Math.abs(dx) > Math.abs(dy)) {
        suppressClickRef.current = true
        gestureRef.current = null
        return
      }
      gesture.dragging = true
      suppressClickRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      close()
    }
    const distance = tabsRef.current.offsetHeight
    setDragY(Math.max(0, Math.min(distance, (expanded ? 0 : distance) + dy)))
  }

  function endDrag(event, cancelled = false) {
    const gesture = gestureRef.current
    if (!gesture || gesture.id !== event.pointerId) return
    gestureRef.current = null
    setDragY(null)
    if (!gesture.dragging || cancelled) return
    const delta = (event.clientY - gesture.y) * (expanded ? 1 : -1)
    const velocity = delta / Math.max(1, event.timeStamp - gesture.time)
    if (delta > tabsRef.current.offsetHeight / 2 || (delta > 10 && velocity > 0.5)) setExpanded(!expanded)
  }

  function handleSlot(id) {
    if (id === 'more') {
      setPanelId((current) => (current === 'overflow' ? null : 'overflow'))
      return
    }
    setPanelId(null)
    if (id === 'home') {
      // Home = Journal; nochmal tippen schaltet den Hub (Übersicht) an/aus
      navigate(activeSlot === 'home' && !hubOpen ? 'hub' : 'home')
      return
    }
    if (activeSlot === id) {
      setPanelId(id)
      return
    }
    navigate(id)
  }

  const slots = [
    { id: 'home', label: 'Home', Icon: Home },
    ...PRIMARY_IDS.slice(1).map((id) => findApp(id)).filter(Boolean),
    { id: 'more', label: 'Mehr', Icon: MoreHorizontal },
  ]

  const panelApp = findApp(panelId)
  const panelTitle = panelId === 'overflow' ? 'Mehr' : (panelApp?.label || '')

  return (
    <>
      {panelId ? (
        <>
          <button
            ref={backdropRef}
            aria-label="Menü schließen"
            className="vos-fade-in fixed inset-0 z-[55] bg-black/40 lg:hidden"
            onClick={close}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-label={panelTitle}
            data-shell-nav-dialog=""
            onKeyDown={(event) => handleSheetKeys(event, close)}
            className="vos-sheet vos-sheet-in fixed inset-x-2 z-[56] max-h-[70dvh] overflow-y-auto overscroll-contain rounded-[28px] px-3 pb-3 pt-2 shadow-2xl lg:hidden"
            style={{
              bottom: 'calc(var(--mobile-nav-height) + 8px)',
              border: '1px solid color-mix(in srgb, var(--ink) 8%, transparent)',
            }}
          >
            <div className="mx-auto mb-1 h-[5px] w-9 rounded-full" style={{ background: 'color-mix(in srgb, var(--ink) 20%, transparent)' }} />
            <div className="mb-1 flex items-center justify-between px-2 pb-1">
              <div className="text-[17px] font-semibold text-fit-ink">{panelTitle}</div>
              <button
                onClick={close}
                aria-label="Schließen"
                className="vos-press flex h-8 w-8 items-center justify-center rounded-full text-fit-dim vos-fill"
              >
                <X size={16} />
              </button>
            </div>

            {panelId === 'overflow' ? (
              <div data-shell-nav="vertical" className="space-y-0.5">
                <SheetRow Icon={LayoutGrid} label="Übersicht" hint="Alle Bereiche auf einen Blick" active={hubOpen} onClick={() => { close(); navigate('hub') }} />
                {MORE_IDS.map((id) => findApp(id)).filter(Boolean).map(({ id, label, Icon }) => (
                  <SheetRow key={id} Icon={Icon} label={label} active={tab === id} onClick={() => { close(); navigate(id) }} />
                ))}
                <SheetRow Icon={Keyboard} label="Tastaturkurzbefehle" hint="?" onClick={() => { close(); onKeyboardHelp?.() }} />
              </div>
            ) : (
              <div data-shell-nav="vertical" className="space-y-3">
                {panelGroups.map(({ group, items }) => (
                  <div key={group}>
                    {panelGroups.length > 1 ? <div className="vos-eyebrow px-3 pb-1 pt-2">{group}</div> : null}
                    <div className="space-y-0.5">
                      {items.map(({ id, label, Icon }) => (
                        <SheetRow
                          key={id}
                          Icon={Icon}
                          label={label}
                          active={subTab === id}
                          onClick={() => { close(); navigate(panelId, id) }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {panelApp?.standaloneUrl ? (
                  <div className="border-t pt-2" style={{ borderColor: 'color-mix(in srgb, var(--ink) 8%, transparent)' }}>
                    <SheetRow
                      Icon={panelApp.Icon}
                      label={`${panelTitle} separat öffnen`}
                      hint={`${new URL(panelApp.standaloneUrl).hostname} · Neuer Tab`}
                      href={panelApp.standaloneUrl}
                      onClick={close}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </>
      ) : null}

      <nav
        aria-label="Hauptnavigation"
        className="vos-nav-sheet vos-bar vos-hairline-t fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl lg:hidden"
        style={{
          paddingBottom: 'var(--safe-bottom)',
          transform: dragY === null ? (expanded ? 'translateY(0)' : 'translateY(var(--tabbar-h))') : `translateY(${dragY}px)`,
          transition: dragY === null ? undefined : 'none',
          touchAction: 'none',
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={(event) => endDrag(event, true)}
        onLostPointerCapture={(event) => {
          if (event.target === event.currentTarget) endDrag(event, true)
        }}
        onClickCapture={(event) => {
          if (suppressClickRef.current && event.detail !== 0) {
            event.preventDefault()
            event.stopPropagation()
            suppressClickRef.current = false
          }
        }}
      >
        <button
          ref={gripRef}
          type="button"
          aria-label={expanded ? 'Navigation ausblenden' : 'Navigation einblenden'}
          aria-expanded={expanded}
          aria-controls={tabsId}
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center"
          style={{ height: 'var(--nav-grip-h)' }}
        >
          <span className="h-[5px] w-9 rounded-full" style={{ background: 'color-mix(in srgb, var(--ink) 25%, transparent)' }} />
        </button>
        <div
          id={tabsId}
          ref={tabsRef}
          data-shell-nav="horizontal"
          aria-hidden={!expanded}
          {...(!expanded ? { inert: '' } : {})}
          className="mx-auto grid max-w-xl grid-cols-5"
          style={{ height: 'var(--tabbar-h)', visibility: expanded || dragY !== null ? 'visible' : 'hidden' }}
        >
          {slots.map(({ id, label, Icon }) => {
            const active = id === 'more' ? (activeSlot === 'more' || panelId === 'overflow') : activeSlot === id
            return (
              <button
                key={id}
                onClick={() => handleSlot(id)}
                aria-haspopup={id === 'home' ? undefined : 'dialog'}
                aria-expanded={id === 'home' ? undefined : (panelId === (id === 'more' ? 'overflow' : id))}
                aria-current={active ? 'page' : undefined}
                className="vos-press group flex flex-col items-center justify-center gap-1"
              >
                <span
                  className="flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200"
                  style={{ background: active ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'transparent' }}
                >
                  <Icon size={21} strokeWidth={active ? 2.3 : 1.8} style={{ color: active ? 'var(--accent)' : 'var(--dim)' }} />
                </span>
                <span
                  className="text-[10.5px] font-medium leading-none"
                  style={{ color: active ? 'var(--ink)' : 'var(--dim)' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
