export default function SkeletonLab() {
  return (
    <div className="bg-white border rounded-xl p-4 animate-pulse space-y-4">
      <div className="h-5 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
