import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../hooks/useAuth';
import { updateAdminReporteEstado } from '../services/adminReportes.service';

export const useUpdateReporteEstado = (estadoFiltro) => {
  const { jwtToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }) => updateAdminReporteEstado({ jwtToken, id, estado }),
    onMutate: async ({ id, estado }) => {
      await qc.cancelQueries({ queryKey: ['admin-reportes', estadoFiltro] });
      const prev = qc.getQueryData(['admin-reportes', estadoFiltro]);
      if (prev?.reportes) {
        qc.setQueryData(['admin-reportes', estadoFiltro], {
          ...prev,
          reportes: prev.reportes.map((r) => (r._id === id ? { ...r, estado } : r)),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['admin-reportes', estadoFiltro], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin-reportes'] });
    },
  });
};
