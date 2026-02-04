export default function Input({ label, error, className = '', inputClassName = '', ...props }) {
  return (
    <div className={className}>
      {label ? <label className="label block mb-1">{label}</label> : null}
      <input className={`input ${inputClassName}`} {...props} />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
