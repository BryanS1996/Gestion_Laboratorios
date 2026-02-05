export default function Card({ className = '', children, ...props }) {
  // Card is slightly translucent so the global gradient background remains visible
  return (
    <div
      className={`bg-white/75 backdrop-blur border border-white/60 rounded-2xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
