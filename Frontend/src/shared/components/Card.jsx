export default function Card({ className = '', children, ...props }) {
  // Light theme card with white background
  const defaultClasses = 'bg-white border border-slate-200 rounded-2xl shadow-lg';

  return (
    <div
      className={`${defaultClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
