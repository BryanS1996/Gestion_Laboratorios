import { MapPin, Users as UsersIcon, Clock, CreditCard } from 'lucide-react';
import { Badge, Button, Card } from '../../../shared/components';

export default function LabCard({ lab, Icon, status, isPremium, canReserve, onOpen }) {
  const disabled = status?.ocupado;

  const statusVariant = status?.color === 'red' ? 'red' : status?.color === 'green' ? 'green' : 'gray';

  return (
    <Card className="p-4 flex flex-col">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
          {Icon ? <Icon size={20} className="text-slate-700" /> : null}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900">{lab?.nombre}</h3>
            {isPremium && (
              <Badge variant="blue" className="inline-flex items-center gap-1">
                <CreditCard size={14} /> Premium
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{lab?.descripcion || '—'}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2"><MapPin size={14} /> {lab?.ubicacion || '—'}</div>
        <div className="flex items-center gap-2"><UsersIcon size={14} /> Cap: {lab?.capacidad ?? '—'}</div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Badge variant={statusVariant}>{status?.label || '—'}</Badge>

        <Button
          type="button"
          onClick={onOpen}
          variant={canReserve ? 'primary' : 'secondary'}
          className="text-sm px-3 py-2 rounded-xl flex items-center gap-2"
          disabled={disabled && canReserve}
          title={disabled && canReserve ? 'No disponible para reservar' : 'Abrir'}
        >
          <Clock size={16} /> {canReserve ? 'Reservar' : 'Ver horario'}
        </Button>
      </div>
    </Card>
  );
}
