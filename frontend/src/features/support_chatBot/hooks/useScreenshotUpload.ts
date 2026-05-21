import { useState, useCallback, useRef } from 'react';
import { uploadScreenshot, validateScreenshotFile } from '../services/upload.service';
import type { Attachment } from '../../../pages/admin/types/supportAdmin.types';

/**
 * Manages single-file screenshot upload flow:
 * 1. Validate file client-side (instant feedback)
 * 2. Create local blob URL for immediate preview
 * 3. Upload to Cloudinary via backend
 * 4. Return the Cloudinary URL + publicId to caller
 *
 * Fix: fileRef is used instead of state to avoid async timing
 * issues when uploadFile is called immediately after handleFileSelect.
 */
export const useScreenshotUpload = () => {
  // Use a ref to hold the selected file — avoids stale closure in uploadFile
  const fileRef = useRef<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File): boolean => {
    setError(null);
    setAttachment(null);

    const validationError = validateScreenshotFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return false;
    }

    fileRef.current = selectedFile;

    // Revoke any previous blob URL to prevent memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const blobUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(blobUrl);
    setUploadProgress(0);
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Uploads the currently selected file to Cloudinary via backend.
   * Accepts an optional file override to handle cases where the ref
   * hasn't settled yet in the same event loop tick.
   */
  const uploadFile = useCallback(async (fileOverride?: File): Promise<string | null> => {
    const target = fileOverride ?? fileRef.current;
    if (!target) return null;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    // Simulate granular progress while the network request is in-flight
    const timer = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 85) { clearInterval(timer); return p; }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 220);

    try {
      const result = await uploadScreenshot(target);
      clearInterval(timer);
      setUploadProgress(100);
      setAttachment(result);
      return result.url;
    } catch (err: any) {
      clearInterval(timer);
      setUploadProgress(0);
      const message = err?.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    fileRef.current = null;
    setPreviewUrl(null);
    setAttachment(null);
    setUploadProgress(0);
    setError(null);
  }, [previewUrl]);

  return {
    // Expose file count (0 or 1) for UI state decisions
    hasFile: fileRef.current !== null,
    previewUrl,
    attachment,
    uploadedUrl: attachment?.url ?? null,
    isUploading,
    uploadProgress,
    error,
    handleFileSelect,
    uploadFile,
    removeFile,
  };
};
