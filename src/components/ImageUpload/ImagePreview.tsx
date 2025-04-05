
import React from 'react';
import { motion } from 'framer-motion';
import { formatBytes } from '@/utils/fileUtils';
import { Button } from '@/components/ui/button';
import { Trash, Download, FolderCheck } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  onRemove: () => void;
  savedToPublic?: string | null;
}

export const ImagePreview = ({ imageUrl, fileName, fileSize, onRemove, savedToPublic }: ImagePreviewProps) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
    >
      <div className="relative aspect-video sm:aspect-square md:aspect-video lg:aspect-auto">
        <img
          src={imageUrl}
          alt={fileName}
          className="object-contain w-full h-full"
        />
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="max-w-[70%]">
              <p className="font-medium text-sm truncate" title={fileName}>
                {fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatBytes(fileSize)}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
                className="text-xs h-8"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Save
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemove}
                className="text-xs h-8"
              >
                <Trash className="w-3.5 h-3.5 mr-1" />
                Remove
              </Button>
            </div>
          </div>
          
          {savedToPublic && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-900/30 flex items-center gap-2">
              <FolderCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs text-green-700 dark:text-green-400 flex-1 truncate">
                Saved to project: {savedToPublic}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
