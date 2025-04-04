
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatBytes, validateImageFile } from '@/utils/fileUtils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ImageIcon, UploadCloud, FolderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImagePreview } from './ImagePreview';

export interface ImageUploadProps {
  onImageUpload?: (file: File) => void;
  maxSize?: number;
  accept?: string[];
  className?: string;
  label?: string;
  description?: string;
  saveToPublic?: boolean;
}

export const ImageUpload = ({
  onImageUpload,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className,
  label = 'Upload an image',
  description = 'Drag and drop or click to upload',
  saveToPublic = false
}: ImageUploadProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [savedToPublic, setSavedToPublic] = useState<string | null>(null);

  const saveImageToPublicFolder = async (file: File) => {
    try {
      setIsLoading(true);
      // In a real app, you would use an API endpoint to save the file
      // Since we can't directly write to the file system from the browser,
      // we simulate saving to public by creating a unique name
      const timestamp = new Date().getTime();
      const uniqueFileName = `${timestamp}-${file.name}`;
      const publicUrl = `/images/${uniqueFileName}`;
      
      // Simulate network delay for a more realistic experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Image saved to public folder: ${uniqueFileName}`);
      setSavedToPublic(publicUrl);
      setIsLoading(false);
      return publicUrl;
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save the image to public folder');
      setIsLoading(false);
      return null;
    }
  };

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      
      try {
        // Validate file
        const validation = validateImageFile(file, maxSize);
        if (!validation.valid) {
          toast.error(validation.message);
          return;
        }

        // Create preview
        const fileUrl = URL.createObjectURL(file);
        setPreviewImage(fileUrl);
        setUploadedFile(file);
        
        // Save to public folder if requested
        if (saveToPublic) {
          const publicUrl = await saveImageToPublicFolder(file);
          if (publicUrl && onImageUpload) {
            // If we have a public URL, we would pass this info to the parent component
            onImageUpload(file);
          }
        } else if (onImageUpload) {
          onImageUpload(file);
        }

        toast.success(`Image uploaded: ${file.name}`);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    },
    [maxSize, onImageUpload, saveToPublic]
  );

  const removeImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setUploadedFile(null);
    setSavedToPublic(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: accept.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div className={cn('w-full', className)}>
      {!previewImage ? (
        <motion.div
          initial={{ opacity: 0.8, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            {...getRootProps()}
            className={cn(
              'flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200',
              isDragActive ? 
                'border-primary bg-primary/5 dark:bg-primary/10' : 
                'border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-gray-900/50',
              isLoading && 'opacity-70 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                {isDragActive ? (
                  <UploadCloud className="w-8 h-8 text-primary" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-primary" />
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isDragActive ? 'Drop the file here' : description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {accept.join(', ')} (Max: {formatBytes(maxSize)})
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                className="mt-2"
                disabled={isLoading}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Select Image
              </Button>
            </div>
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <ImagePreview 
          imageUrl={previewImage} 
          fileName={uploadedFile?.name || 'Uploaded image'} 
          fileSize={uploadedFile?.size || 0}
          onRemove={removeImage}
          savedToPublic={savedToPublic}
        />
      )}
    </div>
  );
};
