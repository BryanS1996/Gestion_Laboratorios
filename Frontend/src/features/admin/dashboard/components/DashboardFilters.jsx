import { Input, Select } from "../../../../shared/components";

const PERIODS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export default function DashboardFilters({
  fecha,
  periodo,
  onFechaChange,
  onPeriodoChange,
}) {
  return (
    <div className="flex gap-2">
      <Select
        value={periodo}
        onChange={(e) => onPeriodoChange(e.target.value)}
        selectClassName="w-auto text-sm"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </Select>

      <Input
        type="date"
        value={fecha}
        onChange={(e) => onFechaChange(e.target.value)}
        inputClassName="w-auto text-sm"
      />
    </div>
  );
}
