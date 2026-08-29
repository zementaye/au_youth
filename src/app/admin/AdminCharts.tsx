"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const INK = "#10221f";
const GOLD = "#c99a3c";
const CORAL = "#b95738";
const SAGE = "#6f8f74";
const LINE = "#ddd3bd";

export function MembersByDeptChart({ data }: { data: { name: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-ink-soft">No members yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: INK }} axisLine={{ stroke: LINE }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 12, fill: INK }}
          axisLine={{ stroke: LINE }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: LINE, background: "#fbf9f2" }}
          cursor={{ fill: "rgba(201,154,60,0.08)" }}
        />
        <Bar dataKey="count" fill={GOLD} radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopSkillsChart({ data }: { data: { name: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-ink-soft">No skills listed yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: INK }} axisLine={{ stroke: LINE }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 12, fill: INK }}
          axisLine={{ stroke: LINE }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: LINE, background: "#fbf9f2" }}
          cursor={{ fill: "rgba(111,143,116,0.1)" }}
        />
        <Bar dataKey="count" fill={SAGE} radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HelpRequestStatusChart({ open, resolved }: { open: number; resolved: number }) {
  const data = [
    { name: "Open", value: open, color: CORAL },
    { name: "Resolved", value: resolved, color: SAGE },
  ];
  if (open + resolved === 0) return <p className="text-sm text-ink-soft">No help requests yet.</p>;
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={32} outerRadius={55} paddingAngle={2}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5 text-sm">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-ink-soft">
              {d.name}: <span className="text-ink">{d.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
