// FileUploader.tsx
import { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      setFileName(file.name);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      onFileSelect(file);
    } else {
      setFileName('');
      setPreviewUrl(null);
      onFileSelect(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      onFileSelect(file);
      
      // Update file input
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleRemoveFile = () => {
    setFileName('');
    setPreviewUrl(null);
    onFileSelect(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clean up object URLs
  const cleanup = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Cleanup on unmount
  useState(() => {
    return cleanup;
  });

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="file-upload"
      />
      
      {previewUrl ? (
        // Show preview when file is selected
        <div className="border-2 border-dashed border-green-500 rounded-lg p-4 bg-green-50">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 max-w-full object-contain rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{fileName}</p>
            <label
              htmlFor="file-upload"
              className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium"
            >
              Choose different file
            </label>
          </div>
        </div>
      ) : (
        // Show upload area when no file is selected
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">Upload your UI design</p>
              <p className="text-sm text-gray-500 mt-1">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports PNG, JPG, JPEG, WEBP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;