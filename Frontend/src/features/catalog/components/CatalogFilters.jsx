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
    // Card container with white background
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end gap-3">

        {/* Search Input */}
        <div className="flex-1">
          <Input
            // FIXED: Using a span with text-slate-900 to ensure the label is black
            label={<span className="text-slate-900 font-semibold">Buscar</span>}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Nombre, descripción o ubicación..."
            // Ensuring the input itself looks good on light background
            inputClassName="w-full text-sm bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500"
          />
        </div>

        {/* Type Filter */}
        <div className="w-full md:w-56">
          <Select
            // FIXED: Added text-slate-900 to make "Tipo" black
            label={
              <span className="inline-flex items-center gap-2 text-slate-900 font-semibold">
                <Filter size={16} className="text-slate-500" /> Tipo
              </span>
            }
            value={typeFilter}
            onChange={(e) => onTypeFilter(e.target.value)}
            // Ensuring select looks good on light background
            selectClassName="w-full text-sm bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500"
          >
            {(tipos || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        {/* Date Filter */}
        <div className="w-full md:w-56">
          {/* FIXED: Added text-slate-900 to make "Fecha" black */}
          <label className="label block mb-1 text-slate-900 font-semibold">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} className="text-slate-500" /> Fecha
            </span>
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={fecha}
              onChange={(e) => onFecha(e.target.value)}
              // Ensuring date input looks good on light background
              inputClassName="w-full text-sm bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={setToday}
              className="text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
            >
              Hoy
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      {/* FIXED: Changed text-slate-300 (invisible) to text-slate-500 (visible gray) */}
      <div className="mt-3 text-sm text-slate-500">
        Mostrando <span className="font-bold text-slate-900">{filtered}</span> de {total} laboratorios
      </div>
    </div>
  );
}