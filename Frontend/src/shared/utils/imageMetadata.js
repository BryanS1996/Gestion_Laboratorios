import imageCompression from 'browser-image-compression';

/**
 * Compress image file before upload
 * @param {File} file - Original image file
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file) => {
    const options = {
        maxSizeMB: 2,              // Máximo 2MB
        maxWidthOrHeight: 1920,    // Máximo 1920px (Full HD)
        useWebWorker: true,        // Usar Web Worker para no bloquear UI
        fileType: 'image/jpeg'     // Convertir todo a JPEG para mejor compresión
    };

    try {
        console.log(`📸 Comprimiendo imagen: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        const compressedFile = await imageCompression(file, options);
        console.log(`✅ Imagen comprimida: ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`);
        return compressedFile;
    } catch (error) {
        console.error('❌ Error comprimiendo imagen:', error);
        // Si falla la compresión, devolver el archivo original
        return file;
    }
};

/**
 * Extract technical metadata from an image file
 * @param {File} file - Image file object
 * @returns {Promise<Object>} Image metadata including dimensions, size, and format
 */
export const extractImageMetadata = (file) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Invalid image file'));
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const metadata = {
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                width: img.width,
                height: img.height,
                uploadedAt: new Date().toISOString()
            };

            URL.revokeObjectURL(url);
            resolve(metadata);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
};

/**
 * Detect browser name from user agent
 * @param {string} ua - User agent string
 * @returns {string} Browser name
 */
const getBrowserName = (ua) => {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
};

/**
 * Detect OS name from user agent
 * @param {string} ua - User agent string
 * @returns {string} OS name
 */
const getOSName = (ua) => {
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
};

/**
 * Get device information from browser
 * @returns {Object} Device information including browser, OS, and screen resolution
 */
export const getDeviceInfo = () => {
    const ua = navigator.userAgent;

    return {
        browser: getBrowserName(ua),
        os: getOSName(ua),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        userAgent: ua
    };
};

/**
 * Compress image and capture metadata
 * @param {File} file - Original image file
 * @returns {Promise<{compressedFile: File, metadata: Object}>}
 */
export const compressAndCaptureMetadata = async (file) => {
    try {
        // Primero comprimir la imagen
        const compressedFile = await compressImage(file);

        // Luego capturar metadata de la imagen comprimida
        const imageMetadata = await extractImageMetadata(compressedFile);
        const deviceInfo = getDeviceInfo();

        const metadata = {
            ...imageMetadata,
            ...deviceInfo,
            // Guardar info del archivo original
            originalSize: file.size,
            originalFileName: file.name,
            compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(2) + '%'
        };

        return {
            compressedFile,
            metadata
        };
    } catch (error) {
        console.error('Error processing image:', error);
        // Si falla, devolver archivo original con metadata básica
        return {
            compressedFile: file,
            metadata: {
                ...getDeviceInfo(),
                fileName: file?.name || 'unknown',
                fileSize: file?.size || 0,
                mimeType: file?.type || 'unknown',
                uploadedAt: new Date().toISOString()
            }
        };
    }
};

/**
 * Legacy function - mantener compatibilidad
 * @param {File} file - Image file object
 * @returns {Promise<Object>} Combined metadata
 */
export const captureImageMetadata = async (file) => {
    try {
        const imageMetadata = await extractImageMetadata(file);
        const deviceInfo = getDeviceInfo();

        return {
            ...imageMetadata,
            ...deviceInfo
        };
    } catch (error) {
        console.error('Error capturing image metadata:', error);
        // Return device info even if image metadata fails
        return {
            ...getDeviceInfo(),
            fileName: file?.name || 'unknown',
            fileSize: file?.size || 0,
            mimeType: file?.type || 'unknown',
            uploadedAt: new Date().toISOString()
        };
    }
};
