import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Helper to upload a base64 or file buffer to Cloudinary
 */
export async function uploadToCloudinary(fileUri: string, folder = 'svt_cashews') {
  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      folder,
      resource_type: 'auto',
    });
    return {
      success: true,
      url: res.secure_url,
      public_id: res.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    };
  }
}
