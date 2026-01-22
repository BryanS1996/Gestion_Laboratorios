const Reporte = require('../models/Reporte');

exports.getReportesAdmin = async (req, res) => {
  try {
    const { estado } = req.query;

    const filtro = estado ? { estado } : {};

    const reportes = await Reporte.find(filtro)
      .sort({ fechaCreacion: -1 });

    const stats = {
      total: await Reporte.countDocuments(),
      pendientes: await Reporte.countDocuments({ estado: 'pendiente' }),
      revisados: await Reporte.countDocuments({ estado: 'revisado' }),
      resueltos: await Reporte.countDocuments({ estado: 'resuelto' }),
    };

    res.json({ reportes, stats });
  } catch (error) {
    console.error('getReportesAdmin error:', error);
    res.status(500).json({ error: 'Error obteniendo reportes' });
  }
};

exports.getReporteById = async (req, res) => {
  try {
    const reporte = await Reporte.findById(req.params.id);

    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json({ reporte });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEstadoReporte = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const reporte = await Reporte.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json({ reporte });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByIdAndDelete(req.params.id);

    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json({ message: 'Reporte eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
