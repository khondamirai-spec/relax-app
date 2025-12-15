// Cloudinary configuration
// Get these from: https://cloudinary.com/console

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '', // Server-side only
};

/**
 * Get Cloudinary URL for a file
 * @param publicId - The public ID of the file in Cloudinary
 * @param resourceType - 'video' for audio files, 'image' for images
 */
export function getCloudinaryUrl(publicId: string, resourceType: 'video' | 'image' = 'video'): string {
  if (!cloudinaryConfig.cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }
  
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/${resourceType}/upload/${publicId}`;
}

/**
 * Upload file to Cloudinary (server-side only)
 * This would be used in an API route
 */
export async function uploadToCloudinary(file: File, folder: string = 'music'): Promise<string> {
  // This would be implemented in an API route for security
  // For now, users should upload via Cloudinary dashboard
  throw new Error('Use Cloudinary dashboard or API route to upload files');
}












