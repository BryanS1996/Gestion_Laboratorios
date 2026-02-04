export default function ReportesShell({ children }) {
  return (
    <div
      className="min-h-screen p-6 relative z-10"
      style={{
        backgroundColor: "#d3b11d",
        // Keeping a simple solid background here to avoid chart/render bugs
        // If you want the SVG pattern back, we can move the full data-URI here.
      }}
    >
      {children}
    </div>
  );
}
