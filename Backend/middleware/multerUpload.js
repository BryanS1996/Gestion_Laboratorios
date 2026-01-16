const multer = require('multer');

// Memoria: no guarda archivos en disco
const storage = multer.memoryStorage();

// Filtro para aceptar solo ciertos tipos de archivo (opcional pero recomendado)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'), false);
  }
};

// Configuración de Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Máximo 10 MB
  }
});

module.exports = upload;
