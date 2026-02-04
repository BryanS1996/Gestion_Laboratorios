function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1 break-words">{value}</div>
    </div>
  );
}

export default function StatCards({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
      {cards.map((c) => (
        <StatCard key={c.label} label={c.label} value={c.value} />
      ))}
    </div>
  );
}
