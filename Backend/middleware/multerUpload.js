const multer = require('multer');

// In-memory: does not save files to disk
const storage = multer.memoryStorage();

// Filter to accept only certain file types (optional but recommended)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Máxim 10 MB
  }
});

module.exports = upload;
