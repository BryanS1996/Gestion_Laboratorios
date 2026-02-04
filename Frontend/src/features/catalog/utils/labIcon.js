import {
  Monitor,
  Network,
  FlaskConical,
} from 'lucide-react';

export function getLabIcon(lab) {
  const t = String(lab?.tipo || '').toLowerCase();
  const n = String(lab?.nombre || '').toLowerCase();
  if (t.includes('red') || n.includes('red')) return Network;
  if (t.includes('quim') || n.includes('quim')) return FlaskConical;
  return Monitor;
}
