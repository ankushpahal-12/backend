import api from '../../../utils/api';
import type { Attachment } from '../../../pages/admin/types/supportAdmin.types';;

/**
 * Uploads a screenshot to Cloudinary via the backend.
 * Uses multipart/form-data — the backend handles the Cloudinary upload.
 *
 * @param file     - The File object from an input or drag-drop
 * @param ticketId - Optional: if attaching to an existing ticket (for the 3-screenshot cap check)
 * @returns        - The uploaded file info including Cloudinary URL
 */
export const uploadScreenshot = async (file: File, ticketId?: string): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('screenshot', file);
  if (ticketId) {
    formData.append('ticketId', ticketId);
  }

  const response = await api.post('/support/upload/screenshot', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data as Attachment;
};

/**
 * Validates a file before upload.
 * Returns an error string or null if valid.
 */
export const validateScreenshotFile = (file: File): string | null => {
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload PNG, JPG, JPEG, or WEBP.';
  }

  if (file.size > MAX_SIZE) {
    return 'File too large. Maximum size is 5MB.';
  }

  return null;
};
