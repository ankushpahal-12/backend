import React, { useRef, useState } from 'react';
import { CloudUpload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useScreenshotUpload } from '../hooks/useScreenshotUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenShotUploadProps {
  /** Called with the Cloudinary URL and publicId after successful upload */
  onUploadSuccess: (url: string, publicId?: string) => void;
}

export const ScreenShotUpload: React.FC<ScreenShotUploadProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    previewUrl,
    isUploading,
    uploadProgress,
    error,
    handleFileSelect,
    uploadFile,
    removeFile,
  } = useScreenshotUpload();

  const processFile = async (file: File) => {
    const valid = handleFileSelect(file);
    if (!valid) return;
    const url = await uploadFile();
    if (url) {
      // uploadFile sets attachment internally; we read it via the hook return
      onUploadSuccess(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        Screenshot <span className="font-normal text-slate-400">(optional)</span>
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-indigo-400 bg-indigo-50'
                : error
                ? 'border-rose-300 bg-rose-50 hover:bg-rose-100'
                : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300'
            }`}
          >
            <CloudUpload
              className={`w-9 h-9 mb-2 ${
                dragOver ? 'text-indigo-500' : error ? 'text-rose-400' : 'text-indigo-400'
              }`}
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold text-slate-700 mb-0.5">
              {dragOver ? 'Drop to upload' : 'Upload Screenshot'}
            </p>
            <p className="text-xs text-slate-400">PNG, JPG, WEBP · max 5MB</p>
            {error && <p className="text-xs font-bold text-rose-600 mt-2">{error}</p>}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50"
          >
            {/* Preview image */}
            <div className="relative h-36 w-full flex items-center justify-center bg-slate-100">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-full max-w-full object-contain"
              />

              {/* Remove button */}
              {!isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                    onUploadSuccess('');
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 gap-2">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                <div className="w-full max-w-[180px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <p className="text-xs font-bold text-indigo-700">{uploadProgress}%</p>
              </div>
            )}

            {/* Success footer */}
            {!isUploading && !error && (
              <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2">
                <ImageIcon size={14} className="text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">
                  Uploaded to Cloudinary ✓
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
