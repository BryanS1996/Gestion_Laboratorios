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
 * Combine image and device metadata
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
