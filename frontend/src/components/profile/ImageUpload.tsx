import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange }) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageChange(result);
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Preview */}
        <div className="relative">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-1 bg-error-600 text-white rounded-full hover:bg-error-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {preview ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      </div>

      {/* Alternative: URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Or paste image URL
        </label>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={preview}
          onChange={(e) => {
            setPreview(e.target.value);
            onImageChange(e.target.value);
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
