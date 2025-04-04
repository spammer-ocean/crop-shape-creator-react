
import { useImageCropper } from "@/hooks/useImageCropper";
import { ImageCropperProps } from "@/types/ImageCropper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { validateImageFile, formatBytes } from "@/utils/fileUtils";
import { Upload, Crop, Download, RotateCw, X, Image } from "lucide-react";

export function ImageCropper({
  shape = "square",
  dimensions = { width: 200, height: 200 },
  radius = 0,
  sizeLimit = 2 * 1024 * 1024, // 2MB default
  onCropComplete
}: ImageCropperProps) {
  const {
    canvasRef,
    isLoading,
    isCropping,
    croppedDataUrl,
    loadImage,
    cropImage,
    resetCrop,
    downloadCroppedImage
  } = useImageCropper(shape, dimensions, radius, sizeLimit);
  
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  // Set up react-dropzone
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      const validation = validateImageFile(file, sizeLimit);
      
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }
      
      await loadImage(file);
      setActiveTab("crop");
    },
    [loadImage, sizeLimit]
  );
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 1
  });

  const handleCropComplete = async () => {
    await cropImage();
    setActiveTab("preview");
    
    if (croppedDataUrl && onCropComplete) {
      // Convert data URL to File
      const byteString = atob(croppedDataUrl.split(',')[1]);
      const mimeString = croppedDataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const croppedFile = new File([blob], "cropped-image.png", { 
        type: mimeString 
      });
      
      onCropComplete(croppedDataUrl, croppedFile);
    }
  };

  // Update active tab based on state changes
  useEffect(() => {
    if (croppedDataUrl) {
      setActiveTab("preview");
    } else if (isCropping) {
      setActiveTab("crop");
    } else {
      setActiveTab("upload");
    }
  }, [croppedDataUrl, isCropping]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" disabled={isLoading || isCropping}>
            Upload
          </TabsTrigger>
          <TabsTrigger value="crop" disabled={!isCropping || isLoading}>
            Crop
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!croppedDataUrl}>
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-brand-purple bg-brand-light-purple/20' : 'border-gray-300 hover:border-brand-purple'}
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="rounded-full bg-brand-light-purple p-3">
                    <Upload className="h-6 w-6 text-brand-purple" />
                  </div>
                  <p className="text-lg font-medium">Drag & drop image here, or click to select</p>
                  <p className="text-sm text-gray-500">
                    Supports PNG, JPG (max {formatBytes(sizeLimit)})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="crop" className="mt-4">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-500">
                  Drag the image and adjust the crop area
                </p>
              </div>
              
              <div className="relative border rounded-lg overflow-hidden w-full aspect-square">
                <canvas ref={canvasRef} className="w-full h-full" />
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
                  </div>
                )}
              </div>
              
              <div className="w-full flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Output: {dimensions.width}×{dimensions.height}px
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button onClick={handleCropComplete}>
                    <Crop className="mr-2 h-4 w-4" /> Crop
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="mb-4 text-center">
                <p className="font-medium">Cropped Image</p>
                <p className="text-sm text-gray-500">
                  {dimensions.width}×{dimensions.height}px
                </p>
              </div>
              
              {croppedDataUrl && (
                <div className={`relative border rounded-lg overflow-hidden
                  ${shape === 'circle' ? 'rounded-full' : radius > 0 ? 'rounded-xl' : ''}
                  bg-gray-100
                `}>
                  <img 
                    src={croppedDataUrl} 
                    alt="Cropped"
                    className="w-full h-full object-contain"
                    style={{
                      maxWidth: dimensions.width * 2,
                      maxHeight: dimensions.height * 2
                    }}
                  />
                </div>
              )}
              
              <div className="w-full flex justify-between items-center mt-4">
                <Button variant="outline" onClick={resetCrop}>
                  <RotateCw className="mr-2 h-4 w-4" /> Re-crop
                </Button>
                <Button onClick={downloadCroppedImage}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
