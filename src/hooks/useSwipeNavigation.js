import { useEffect, useRef, useState } from 'react';
import { NAV_ITEMS } from '../constants/NavigationItems';

export function useSwipeNavigation({ navMode, tab, swipeEnabled, setTab }) {
  const mainRef = useRef(null);
  const [swipeHint, setSwipeHint] = useState(null);
  const [slideDirection, setSlideDirection] = useState('bottom');
  // ... (Hier kommt exakt dein Touch-Code rein: touchStartRef, onTouchMove, etc.)
  // Der Hook ruft am Ende einfach setTab(neuerTab) auf und ändert setSlideDirection.

  return { mainRef, swipeHint, slideDirection, setSlideDirection };
}
