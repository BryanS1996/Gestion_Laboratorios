import { Button } from "../../../../shared/components";

export default function ReportesHeader({ refreshing, onRefetch, onExport }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Reportes de Incidencias</h1>
        <p className="text-slate-300">Gestión administrativa de reportes</p>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`inline-block h-2 w-2 rounded-full ${refreshing ? "bg-blue-500" : "bg-green-500"
              }`}
          />
          {refreshing ? "Actualizando..." : "En vivo (polling 1s)"}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onRefetch} className="text-sm">
          Refrescar
        </Button>

        <Button variant="blue" onClick={onExport} className="text-sm px-4 py-2">
          Exportar PDF semanal
        </Button>
      </div>
    </div>
  );
}
