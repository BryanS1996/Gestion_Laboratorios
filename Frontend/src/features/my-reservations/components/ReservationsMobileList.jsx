import { Calendar, Clock } from "lucide-react";
import { Badge, Button, Card } from "../../../shared/components";

export default function ReservationsMobileList({
  reservations,
  onCancel,
  onPay,
  onReport,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:hidden">
      {reservations.map((r) => (
        <Card key={r.id} className="p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-800">{r.labName}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Calendar size={14} /> {r.date}
                <span className="text-slate-300">|</span>
                <Clock size={14} /> {r.time}
              </div>
            </div>

            <Badge className={r.statusClass}>{r.statusText}</Badge>
          </div>

          <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => onCancel(r)}
              className="flex-1 text-sm justify-center"
            >
              Cancelar
            </Button>

            <Button
              variant="secondary"
              onClick={() => onReport(r)}
              className="flex-1 text-sm justify-center text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              Reportar
            </Button>

            {r.statusText === "Pendiente" && (
              <Button
                variant="blue"
                onClick={() => onPay(r)}
                className="flex-1 text-sm justify-center"
              >
                Pagar
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
