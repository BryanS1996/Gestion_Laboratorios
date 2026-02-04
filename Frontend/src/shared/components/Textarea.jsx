export default function Textarea({
  label,
  error,
  className = "",
  textareaClassName = "",
  rows = 4,
  ...props
}) {
  return (
    <div className={className}>
      {label ? <label className="label block mb-1">{label}</label> : null}
      <textarea className={`input ${textareaClassName}`} rows={rows} {...props} />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
