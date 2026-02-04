export default function Spinner({ className = '' }) {
  return (
    <div
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 ${className}`}
      aria-label="Cargando"
    />
  );
}
