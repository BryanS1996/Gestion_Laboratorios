const Reporte = require('../models/Reporte');

// GET /api/admin/reportes
exports.getReportesAdmin = async (req, res) => {
  try {
    const reportes = await Reporte.find()
      .sort({ fechaCreacion: -1 });

    res.json({ reportes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/admin/reportes/:id/estado
exports.updateEstadoReporte = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const reporte = await Reporte.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    res.json({ reporte });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
