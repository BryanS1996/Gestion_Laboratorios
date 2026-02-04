export default function StatusBadge({ ocupado }) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${
        ocupado ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
      }`}
    >
      {ocupado ? 'Ocupado' : 'Disponible'}
    </span>
  );
}
