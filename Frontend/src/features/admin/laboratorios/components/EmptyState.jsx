export default function EmptyState({ label = 'No hay laboratorios para mostrar' }) {
  return (
    <div className="col-span-full flex items-center justify-center">
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
