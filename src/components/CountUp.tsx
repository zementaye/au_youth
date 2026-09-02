"use client";

import { useEffect, useRef, useState } from "react";

// Animates a number counting up from 0 to `value` once, on mount. Used for
// the hero stats so they arrive with a bit of momentum instead of sitting
// there as static digits. A different *kind* of motion than the CSS
// keyframes elsewhere on this page — this one is JS-driven, since a
// numeric tween isn't expressible as a fixed keyframe. Jumps straight to
// the final value under prefers-reduced-motion.
export default function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{display}</>;
}
