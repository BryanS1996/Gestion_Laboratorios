import LabCard from './LabCard';
import SkeletonLab from './SkeletonLab';
import EmptyState from './EmptyState';

export default function LabsGrid({ labs, showSkeleton, emptyLabel }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-auto pr-2">
      {showSkeleton ? (
        <>
          <SkeletonLab />
          <SkeletonLab />
          <SkeletonLab />
          <SkeletonLab />
          <SkeletonLab />
          <SkeletonLab />
        </>
      ) : labs.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        labs.map((lab) => <LabCard key={lab.id} lab={lab} />)
      )}
    </div>
  );
}
