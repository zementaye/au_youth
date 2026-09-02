// A hub-and-spoke diagram of the actual network: one node per department,
// sized by its real member count, connected to a central "AU Youth" hub.
// This replaces a stock hero illustration with something that reads the
// platform's own data — the diagram IS the content, not decoration.
//
// On load, the diagram plays a single orchestrated sequence — lines draw
// outward from the hub, nodes settle into place behind them, and the hub
// itself resolves last — instead of just appearing. Once that settles,
// each spoke keeps a subtle marigold "flow" looping outward continuously,
// so the diagram stays alive rather than going static. Both are pure CSS
// (@keyframes in globals.css), so it needs no client-side state and still
// respects prefers-reduced-motion via the global override there — the
// infinite loop collapses to a single frame for that preference. This is
// the platform's signature motion; nothing else should copy the "infinite
// loop" trick to avoid diluting it.

type DeptNode = {
  name: string;
  count: number;
};

const WIDTH = 460;
const HEIGHT = 460;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
const ORBIT_RADIUS = 168;

// Timing constants for the load-in sequence, in ms.
const BASE_DELAY = 150;
const LINE_STAGGER = 70;
const LINE_DURATION = 650;
const NODE_LEAD = 300; // nodes start settling before their line finishes drawing
const NODE_DURATION = 520;
const SETTLE_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function NetworkDiagram({ departments }: { departments: DeptNode[] }) {
  const nodes = departments.slice(0, 9);
  const maxCount = Math.max(1, ...nodes.map((n) => n.count));

  const positioned = nodes.map((n, i) => {
    // Start at the top and go clockwise, so the layout reads deliberately
    // rather than looking randomly scattered.
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    const x = CENTER.x + ORBIT_RADIUS * Math.cos(angle);
    const y = CENTER.y + ORBIT_RADIUS * Math.sin(angle);
    const r = 14 + (n.count / maxCount) * 20;
    return { ...n, x, y, r };
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="Diagram of departments connected to the AU Youth Network, each sized by member count"
    >
      {/* connection lines, drawn first so nodes sit on top. pathLength
          normalizes each line's dash units to 0–1 regardless of its actual
          on-screen length, so one keyframe animates every spoke evenly. */}
      {positioned.map((n, i) => (
        <line
          key={`line-${n.name}`}
          x1={CENTER.x}
          y1={CENTER.y}
          x2={n.x}
          y2={n.y}
          stroke="var(--indigo)"
          strokeOpacity={0.35}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          style={{
            animation: `draw-line ${LINE_DURATION}ms ease-out ${BASE_DELAY + i * LINE_STAGGER}ms both`,
          }}
        />
      ))}

      {/* a second, continuous overlay per spoke — once the line above has
          finished drawing in, a marigold dash pattern starts flowing
          outward on a loop, reading as data/energy moving through the
          network rather than a static diagram. */}
      {positioned.map((n, i) => {
        const flowDelay = BASE_DELAY + i * LINE_STAGGER + LINE_DURATION;
        return (
          <line
            key={`flow-${n.name}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={n.x}
            y2={n.y}
            stroke="var(--marigold)"
            strokeOpacity={0.6}
            strokeWidth={2}
            pathLength={1}
            strokeDasharray="0.05 0.16"
            style={{
              animation: `flow-dash 2.4s linear ${flowDelay}ms infinite`,
            }}
          />
        );
      })}

      {/* department nodes — each settles in shortly after its own line
          starts drawing. transform-origin is set in the SVG's own user
          units (not the default 50%/50%) so the scale animates from each
          node's true center rather than the viewport's. */}
      {positioned.map((n, i) => {
        const delay = BASE_DELAY + i * LINE_STAGGER + NODE_LEAD;
        return (
          <g
            key={n.name}
            style={{
              transformOrigin: `${n.x}px ${n.y}px`,
              animation: `settle-in ${NODE_DURATION}ms ${SETTLE_EASE} ${delay}ms both`,
            }}
          >
            <circle cx={n.x} cy={n.y} r={n.r} fill="var(--paper-raised)" stroke="var(--indigo)" strokeWidth={1.5} />
            <circle cx={n.x} cy={n.y} r={3} fill="var(--indigo)" />
            <text
              x={n.x}
              y={n.y + n.r + 16}
              textAnchor="middle"
              className="font-body"
              style={{ fontSize: 11, fill: "var(--ink-soft)" }}
            >
              {truncate(n.name, 16)}
            </text>
            <text
              x={n.x}
              y={n.y + n.r + 29}
              textAnchor="middle"
              className="font-mono"
              style={{ fontSize: 10, fill: "var(--ink)" }}
            >
              {n.count}
            </text>
          </g>
        );
      })}

      {/* the hub — resolves last, after every spoke and node has settled,
          so the sequence reads as radiating outward and then anchoring. */}
      <g
        style={{
          transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
          animation: `hub-settle 560ms ${SETTLE_EASE} ${
            BASE_DELAY + nodes.length * LINE_STAGGER + NODE_LEAD + 200
          }ms both`,
        }}
      >
        <circle cx={CENTER.x} cy={CENTER.y} r={40} fill="var(--ink)" />
        <text
          x={CENTER.x}
          y={CENTER.y - 3}
          textAnchor="middle"
          className="font-display"
          style={{ fontSize: 12, fontWeight: 600, fill: "var(--paper)" }}
        >
          AU Youth
        </text>
        <text
          x={CENTER.x}
          y={CENTER.y + 12}
          textAnchor="middle"
          className="font-mono"
          style={{ fontSize: 9, fill: "var(--marigold)" }}
        >
          {nodes.reduce((sum, n) => sum + n.count, 0)} members
        </text>
      </g>
    </svg>
  );
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
