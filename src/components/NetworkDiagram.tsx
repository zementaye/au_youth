// A hub-and-spoke diagram of the actual network: one node per department,
// sized by its real member count, connected to a central "AU Youth" hub.
// This replaces a stock hero illustration with something that reads the
// platform's own data — the diagram IS the content, not decoration.

type DeptNode = {
  name: string;
  count: number;
};

const WIDTH = 460;
const HEIGHT = 460;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
const ORBIT_RADIUS = 168;

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
      {/* connection lines, drawn first so nodes sit on top */}
      {positioned.map((n) => (
        <line
          key={`line-${n.name}`}
          x1={CENTER.x}
          y1={CENTER.y}
          x2={n.x}
          y2={n.y}
          stroke="var(--indigo)"
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
      ))}

      {/* department nodes */}
      {positioned.map((n) => (
        <g key={n.name}>
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
      ))}

      {/* the hub */}
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
    </svg>
  );
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
