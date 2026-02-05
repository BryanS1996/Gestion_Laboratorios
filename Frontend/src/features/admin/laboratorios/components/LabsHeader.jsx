import { Input } from "../../../../shared/components";

export default function LabsHeader({ fecha, onFechaChange, search, onSearchChange }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-white">Laboratorios</h1>
        <p className="text-sm text-slate-300">Horarios reservados – {fecha}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre o ID (espera 3s)..."
          inputClassName="w-full sm:w-80 text-sm"
        />

        <Input
          type="date"
          value={fecha}
          onChange={(e) => onFechaChange(e.target.value)}
          inputClassName="w-auto text-sm"
        />
      </div>
    </div>
  );
}
