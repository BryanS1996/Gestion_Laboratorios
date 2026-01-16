<<<<<<< HEAD
// Backend/middleware/multerUpload.js
const multer = require('multer');

// Memoria: no guarda en disco
const storage = multer.memoryStorage();

// ✅ Filtro de tipos de archivo permitidos
=======
const multer = require('multer');

// Memoria: no guarda archivos en disco
const storage = multer.memoryStorage();

// Filtro para aceptar solo ciertos tipos de archivo (opcional pero recomendado)
>>>>>>> rescue-avances
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
<<<<<<< HEAD
    cb(null, true); // ✅ Aceptado
=======
    cb(null, true); // Aceptar archivo
>>>>>>> rescue-avances
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'), false);
  }
};

<<<<<<< HEAD
=======
// Configuración de Multer
>>>>>>> rescue-avances
const upload = multer({
  storage,
  fileFilter,
  limits: {
<<<<<<< HEAD
    fileSize: 10 * 1024 * 1024, // 10 MB
=======
    fileSize: 10 * 1024 * 1024 // Máximo 10 MB
>>>>>>> rescue-avances
  }
});

module.exports = upload;
