import { DateTime } from 'luxon';
import { Filter, CalendarDays } from 'lucide-react';
import { ZONE } from '../../../config/env';
import { Button, Input, Select } from '../../../shared/components';

export default function CatalogFilters({
  search,
  onSearch,
  tipos,
  typeFilter,
  onTypeFilter,
  fecha,
  onFecha,
  total,
  filtered,
}) {
  const setToday = () => {
    onFecha(DateTime.now().setZone(ZONE).toISODate());
  };

  return (
    <div className="bg-white border rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <Input
            label="Buscar"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Nombre, descripción o ubicación..."
            inputClassName="w-full text-sm"
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            label={
              <span className="inline-flex items-center gap-2">
                <Filter size={16} /> Tipo
              </span>
            }
            value={typeFilter}
            onChange={(e) => onTypeFilter(e.target.value)}
            selectClassName="w-full text-sm"
          >
            {(tipos || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full md:w-56">
          <label className="label block mb-1">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} /> Fecha
            </span>
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={fecha}
              onChange={(e) => onFecha(e.target.value)}
              inputClassName="w-full text-sm"
            />
            <Button type="button" variant="secondary" onClick={setToday} className="text-sm">
              Hoy
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-500">
        Mostrando <span className="font-medium text-slate-700">{filtered}</span> de {total} laboratorios
      </div>
    </div>
  );
}
