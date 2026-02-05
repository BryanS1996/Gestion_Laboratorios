import { usePagoExitosoPage } from '../hooks/usePagoExitosoPage';
import { Card, Spinner } from '../../../shared/components';

export default function PagoExitosoPage() {
  usePagoExitosoPage();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <Card className="p-6 max-w-md w-full text-center">
        <div className="text-2xl font-bold text-slate-900 inline-flex items-center justify-center gap-2">
          <Spinner />
          <span>Procesando pago…</span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Estamos verificando tu transacción con Stripe y confirmando la reserva.
        </p>
        <div className="mt-6 text-sm text-slate-400">No cierres esta ventana.</div>
      </Card>
    </div>
  );
}
