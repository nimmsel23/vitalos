import { focusableItems } from '@vos-shell-ui/navigation.js'
export { isEditing, focusableItems, handleNavigationKeys } from '@vos-shell-ui/navigation.js'

export function handleSheetKeys(event, onClose) {
  if (event.key === 'Escape' && !event.isComposing && !event.nativeEvent?.isComposing) {
    event.preventDefault()
    event.stopPropagation()
    onClose()
  } else if (event.key === 'Tab') {
    const items = focusableItems(event.currentTarget)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if ((event.shiftKey && event.target === first) || (!event.shiftKey && event.target === last)) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
    }
  }
}
