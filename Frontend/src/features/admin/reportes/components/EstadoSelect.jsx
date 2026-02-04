import { Select } from "../../../../shared/components";

export default function EstadoSelect({ value, onChange }) {
  return (
    <Select
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      selectClassName="w-auto !px-2 !py-1 text-xs"
    >
      <option value="pendiente">Pendiente</option>
      <option value="revisado">Revisado</option>
      <option value="resuelto">Resuelto</option>
    </Select>
  );
}
