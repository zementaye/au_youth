"use client";

import { useRef, type CSSProperties, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";

// A handful of geometric accent shapes — triangles and diamonds, echoing
// the diagram's own vocabulary and common motifs in African textile
// patterns (chevrons, diamonds) rather than literal photography. Kept to
// five, fairly large, and slow-moving on purpose: many small shapes
// scattered and falling reads as confetti, which the brief explicitly
// ruled out. These just drift.
//
// They also nudge slightly with the cursor (the page's one parallax
// effect). Wraps the hero's real content so mousemove bubbles up to this
// component's handler no matter which child is hovered — content and
// shapes share this element as their common ancestor.
const SHAPES = [
  { kind: "triangle", color: "var(--marigold)", top: "10%", left: "5%", size: 22, depth: 1, duration: "7s", delay: "0s", rot: -8 },
  { kind: "diamond", color: "var(--indigo)", top: "74%", left: "9%", size: 16, depth: 0.6, duration: "9s", delay: "0.6s", rot: 4 },
  { kind: "triangle", color: "var(--brick)", top: "16%", left: "93%", size: 18, depth: 0.8, duration: "8s", delay: "1.2s", rot: 12 },
  { kind: "diamond", color: "var(--forest)", top: "86%", left: "90%", size: 14, depth: 0.5, duration: "10s", delay: "0.3s", rot: -6 },
  { kind: "triangle", color: "var(--indigo)", top: "48%", left: "2%", size: 12, depth: 0.4, duration: "6.5s", delay: "0.9s", rot: 20 },
] as const;

export default function HeroFloatingShapes({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: ReactMouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current?.style.setProperty("--px", px.toFixed(3));
    ref.current?.style.setProperty("--py", py.toFixed(3));
  }

  function handleLeave() {
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative"
      style={{ "--px": 0, "--py": 0 } as CSSProperties}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {SHAPES.map((s, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              transform: `translate(calc(var(--px) * ${s.depth * 26}px), calc(var(--py) * ${s.depth * 26}px))`,
              transition: "transform 0.2s ease-out",
            }}
          >
            <span
              className="block h-full w-full opacity-70"
              style={
                {
                  background: s.color,
                  clipPath:
                    s.kind === "triangle"
                      ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                      : "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  "--float-rot": `${s.rot}deg`,
                  animation: `float-shape ${s.duration} ease-in-out ${s.delay} infinite`,
                } as CSSProperties
              }
            />
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}
