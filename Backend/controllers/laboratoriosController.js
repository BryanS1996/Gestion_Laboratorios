const admin = require('../firebaseAdmin');
const db = admin.firestore();

// GET /api/laboratorios
const getAllLaboratorios = async (req, res) => {
  try {
    const snap = await db.collection('laboratorios').orderBy('nombre', 'asc').get();
    const laboratorios = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ laboratorios });
  } catch (e) {
    console.error('Error listando laboratorios:', e);
    return res.status(500).json({ error: 'Error al obtener laboratorios' });
  }
};

// POST /api/laboratorios (admin/professor)
const createLaboratorio = async (req, res) => {
  try {
    const { nombre, capacidad, ubicacion, descripcion, tipo } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });

    const doc = {
      nombre,
      capacidad: capacidad != null ? Number(capacidad) : null,
      ubicacion: ubicacion || null,
      descripcion: descripcion || null,
      tipo: tipo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ref = await db.collection('laboratorios').add(doc);
    return res.status(201).json({ id: ref.id, ...doc });
  } catch (e) {
    console.error('Error creando laboratorio:', e);
    return res.status(500).json({ error: 'Error al crear laboratorio' });
  }
};

module.exports = { getAllLaboratorios, createLaboratorio };
