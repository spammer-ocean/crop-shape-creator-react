
/**
 * Validates a file to ensure it's an acceptable image type and within size limits
 * @param file The file to validate
 * @param sizeLimit Maximum file size in bytes
 * @returns An object with validation result and error message if any
 */
export const validateImageFile = (file: File, sizeLimit: number): { 
  valid: boolean; 
  message?: string 
} => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      message: 'Only image files are supported.'
    };
  }
  
  // Check file size
  if (file.size > sizeLimit) {
    return {
      valid: false,
      message: `File size exceeds the limit of ${formatBytes(sizeLimit)}.`
    };
  }
  
  return { valid: true };
};

/**
 * Converts bytes to a human readable string
 * @param bytes Number of bytes
 * @returns Human readable string (e.g. "2.5 MB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
