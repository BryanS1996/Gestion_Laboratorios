import ReporteCard from "./ReporteCard";

export default function ReportesList({
  reportes,
  signedUrls,
  loadingImg,
  onToggleImage,
  onDelete,
}) {
  if (reportes.length === 0) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500">
        Aún no has creado reportes.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reportes.map((r) => (
        <ReporteCard
          key={r._id}
          reporte={r}
          imageUrl={signedUrls[r._id]}
          loadingImage={!!loadingImg[r._id]}
          onToggleImage={onToggleImage}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
