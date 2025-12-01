// Cloudinary configuration
// We are using signed uploads via Server Actions, so we don't need to expose an upload preset here.

export const cloudinaryConfig = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
};
