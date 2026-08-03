export { BLOCK_COLORS, ACTIVITY_LABELS, ACTIVITY_ICONS, getBlockColor as blockColor } from '@constants/ActivityConstants';

export function getRolling10Days(baseDate = null) {
  const dates = [];
  const today = baseDate ? new Date(`${baseDate}T12:00:00`) : new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
