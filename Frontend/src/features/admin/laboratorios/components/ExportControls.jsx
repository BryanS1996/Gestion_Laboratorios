import { Button, Select } from "../../../../shared/components";

export default function ExportControls({
  exportMode,
  onExportModeChange,
  onExport,
  disabled,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white border rounded-xl p-3">
      <div className="text-sm text-gray-600">Exportar reservas a PDF:</div>

      <div className="flex items-center gap-2">
        <Select
          value={exportMode}
          onChange={(e) => onExportModeChange(e.target.value)}
          selectClassName="w-auto text-sm"
        >
          <option value="day">Por día</option>
          <option value="week">Por semana</option>
          <option value="month">Por mes</option>
        </Select>

        <Button
          onClick={onExport}
          disabled={disabled}
          variant="blue"
          className="text-sm px-4 py-2"
        >
          Exportar PDF
        </Button>
      </div>

      <div className="md:ml-auto text-xs text-gray-500">
        Usa la fecha seleccionada como base del rango
      </div>
    </div>
  );
}
