import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reportesService } from "../../../services/reportes.service";

export function useReportesActions(jwtToken) {
  const qc = useQueryClient();
  const [signedUrls, setSignedUrls] = useState({});
  const [loadingImg, setLoadingImg] = useState({});

  const createMutation = useMutation({
    mutationFn: async (formData) => reportesService.create(jwtToken, formData),
    onSuccess: async () => {
      toast.success("✅ Reporte enviado correctamente");
      await qc.invalidateQueries({ queryKey: ["mis-reportes"] });
    },
    onError: (e) => toast.error(e.message || "No se pudo enviar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => reportesService.remove(jwtToken, id),
    onSuccess: async (_data, reporteId) => {
      toast.success("Reporte eliminado");
      setSignedUrls((p) => {
        const c = { ...p };
        delete c[reporteId];
        return c;
      });
      await qc.invalidateQueries({ queryKey: ["mis-reportes"] });
    },
    onError: (e) => toast.error(e.message || "No se pudo eliminar"),
  });

  const getSignedUrl = useCallback(
    async (reporteId) => {
      if (signedUrls[reporteId]) return signedUrls[reporteId];
      try {
        setLoadingImg((p) => ({ ...p, [reporteId]: true }));
        const data = await reportesService.imagenUrl(jwtToken, reporteId);
        if (data?.url) {
          setSignedUrls((p) => ({ ...p, [reporteId]: data.url }));
          return data.url;
        }
        toast.error("No se pudo obtener la imagen");
        return null;
      } catch (e) {
        toast.error(e.message || "No se pudo obtener la imagen");
        return null;
      } finally {
        setLoadingImg((p) => ({ ...p, [reporteId]: false }));
      }
    },
    [jwtToken, signedUrls]
  );

  const toggleImage = useCallback(
    async (reporteId) => {
      if (signedUrls[reporteId]) {
        setSignedUrls((p) => {
          const c = { ...p };
          delete c[reporteId];
          return c;
        });
        return;
      }
      await getSignedUrl(reporteId);
    },
    [getSignedUrl, signedUrls]
  );

  return {
    signedUrls,
    loadingImg,
    createReporte: (fd) => createMutation.mutateAsync(fd),
    deleting: deleteMutation.isPending,
    submitting: createMutation.isPending,
    deleteReporte: (id) => deleteMutation.mutateAsync(id),
    toggleImage,
  };
}
