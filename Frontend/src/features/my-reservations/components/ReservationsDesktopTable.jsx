import { AlertCircle, CreditCard, MapPin, XCircle } from "lucide-react";
import { Badge, Button, Card } from "../../../shared/components";

export default function ReservationsDesktopTable({
  reservations,
  onCancel,
  onPay,
  onReport,
}) {
  return (
    <Card className="hidden lg:block rounded-2xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-sm font-semibold text-slate-600">Laboratorio</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Fecha</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Hora</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Estado</th>
            <th className="p-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {reservations.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-medium text-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  {r.labName}
                </div>
              </td>

              <td className="p-4 text-slate-600 text-sm">{r.date}</td>
              <td className="p-4 text-slate-600 text-sm">{r.time}</td>

              <td className="p-4">
                <Badge className={r.statusClass}>{r.statusText}</Badge>
              </td>

              <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => onCancel(r)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    title="Cancelar Reserva"
                  >
                    <XCircle size={20} />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => onReport(r)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full"
                    title="Reportar problema"
                  >
                    <AlertCircle size={20} />
                  </Button>

                  {r.statusText === "Pendiente" && (
                    <Button
                      variant="primary"
                      onClick={() => onPay(r)}
                      className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5"
                    >
                      <CreditCard size={14} /> Pagar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {reservations.length === 0 && (
            <tr>
              <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                No tienes reservas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
