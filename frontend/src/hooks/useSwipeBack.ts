import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SWIPE_MIN_DISTANCE = 80;
const REQUIRED_TOUCH_COUNT = 2;

export function useSwipeBack(elementRef: React.RefObject<HTMLElement | null>) {
  const navigate = useNavigate();
  const startXRef = useRef<number | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== REQUIRED_TOUCH_COUNT) return;
      startXRef.current = e.touches[0].clientX;
    }

    function onTouchEnd(e: TouchEvent) {
      if (startXRef.current === null) return;
      if (e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - startXRef.current;
      startXRef.current = null;

      if (deltaX > SWIPE_MIN_DISTANCE) {
        navigate(-1);
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [elementRef, navigate]);
}
