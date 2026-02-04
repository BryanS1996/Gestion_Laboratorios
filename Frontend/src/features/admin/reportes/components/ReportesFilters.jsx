import { Input, Select } from "../../../../shared/components";

export default function ReportesFilters({
  filtroEstado,
  onFiltroEstado,
  filtroTexto,
  onFiltroTexto,
}) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select
        value={filtroEstado}
        onChange={(e) => onFiltroEstado(e.target.value)}
        selectClassName="w-auto text-sm"
      >
        <option value="todos">Todos</option>
        <option value="pendiente">Pendiente</option>
        <option value="revisado">Revisado</option>
        <option value="resuelto">Resuelto</option>
      </Select>

      <Input
        type="text"
        placeholder="Buscar por título o usuario"
        value={filtroTexto}
        onChange={(e) => onFiltroTexto(e.target.value)}
        inputClassName="w-64 text-sm"
      />
    </div>
  );
}
