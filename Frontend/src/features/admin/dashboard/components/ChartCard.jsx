export default function ChartCard({ title, children, heightClass = 'h-72', className = '' }) {
  return (
    <div className={`bg-white border rounded-2xl p-4 ${className}`.trim()}>
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className={heightClass}>{children}</div>
    </div>
  );
}
