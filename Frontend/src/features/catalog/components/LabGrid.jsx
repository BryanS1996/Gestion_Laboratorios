import LabCard from './LabCard';
import { getLabIcon } from '../utils/labIcon';
import { isPremiumLab } from '../utils/labStatus';
import { Card } from '../../../shared/components';

export default function LabGrid({ labs, getStatus, canReserve, onOpen }) {
  if (!labs?.length) {
    return (
      <Card className="p-8 text-center text-slate-500">No hay laboratorios para mostrar.</Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {labs.map((lab) => {
        const Icon = getLabIcon(lab);
        const status = getStatus(lab);
        const premium = isPremiumLab(lab);
        return (
          <LabCard
            key={lab?.id || lab?._id}
            lab={lab}
            Icon={Icon}
            status={status}
            isPremium={premium}
            canReserve={canReserve}
            onOpen={() => onOpen(lab)}
          />
        );
      })}
    </div>
  );
}
