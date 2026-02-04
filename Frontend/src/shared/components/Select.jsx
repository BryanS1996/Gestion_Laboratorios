export default function Select({
  label,
  error,
  className = '',
  selectClassName = '',
  children,
  ...props
}) {
  return (
    <div className={className}>
      {label ? <label className="label block mb-1">{label}</label> : null}
      <select className={`input ${selectClassName}`} {...props}>
        {children}
      </select>
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
