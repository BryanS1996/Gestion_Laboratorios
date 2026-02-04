export default function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary:
      'px-4 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition active:scale-95',
    danger:
      'px-4 py-2 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition active:scale-95',
    blue:
      'px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition active:scale-95',
    ghost:
      'px-3 py-2 rounded-2xl text-slate-700 hover:bg-slate-100 transition active:scale-95',
  };

  const base = variants[variant] || variants.primary;

  return (
    <button type={type} disabled={disabled} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
