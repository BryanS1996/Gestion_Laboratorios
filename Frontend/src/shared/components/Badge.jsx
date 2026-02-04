export default function Badge({ variant = 'gray', className = '', children, ...props }) {
  const variants = {
    gray: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  };
  const base = variants[variant] || variants.gray;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${base} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
