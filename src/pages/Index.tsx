
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageCropper } from "@/components/ImageCropper/ImageCropper";
import { ImageCropperConfig } from "@/components/ImageCropper/ImageCropperConfig";
import { CropShape, Dimensions } from "@/types/ImageCropper";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Index = () => {
  // Configuration state
  const [shape, setShape] = useState<CropShape>("square");
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 200, height: 200 });
  const [radius, setRadius] = useState<number>(0);
  const [sizeLimit, setSizeLimit] = useState<number>(2 * 1024 * 1024); // 2MB default
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  // Define preset dimensions for easy selection
  const presetDimensions = [
    { name: "Square (50×50)", width: 50, height: 50 },
    { name: "Rectangle (50×75)", width: 50, height: 75 },
    { name: "Profile (200×200)", width: 200, height: 200 },
    { name: "Banner (1200×400)", width: 1200, height: 400 },
  ];

  // Handle crop complete
  const handleCropComplete = (dataUrl: string, file: File) => {
    setCroppedImage(dataUrl);
    toast.success(`Image cropped successfully! File size: ${(file.size / 1024).toFixed(1)} KB`);
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    console.log("Image uploaded:", file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-center dark:text-white">
            Image Upload & Crop Components
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            Upload, preview, crop, and resize images with custom shapes and dimensions
          </p>
        </div>
      </header>
      
      <main className="container py-8">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold dark:text-white">Beautiful Image Upload</h2>
            <Card>
              <CardContent className="pt-6">
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  maxSize={5 * 1024 * 1024}
                  label="Upload your image"
                  description="Drag and drop or click to select a file"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold dark:text-white">Image Cropper</h2>
            <ImageCropper
              shape={shape}
              dimensions={dimensions}
              radius={radius}
              sizeLimit={sizeLimit}
              onCropComplete={handleCropComplete}
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold dark:text-white">Configuration</h2>
            <ImageCropperConfig
              shape={shape}
              setShape={setShape}
              dimensions={dimensions}
              setDimensions={setDimensions}
              radius={radius}
              setRadius={setRadius}
              sizeLimit={sizeLimit}
              setSizeLimit={setSizeLimit}
              presetDimensions={presetDimensions}
            />
          </div>
          
          {croppedImage && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold dark:text-white">Cropped Result</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center">
                    <img 
                      src={croppedImage} 
                      alt="Cropped" 
                      className="max-w-full max-h-64 object-contain" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Usage instructions section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">Usage Instructions</h2>
          
          <Tabs defaultValue="usage">
            <TabsList>
              <TabsTrigger value="usage">How to Use</TabsTrigger>
              <TabsTrigger value="props">Component Props</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="p-4 bg-white dark:bg-gray-800 rounded-md mt-4 shadow-sm">
              <h3 className="text-xl font-medium mb-4 dark:text-white">Using the Image Components</h3>
              <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
                <li>Use the <strong>Image Upload</strong> component to select and preview images</li>
                <li>Configure the desired crop shape, dimensions, corner radius, and file size limit.</li>
                <li>Upload an image by dragging and dropping or clicking the upload area.</li>
                <li>Adjust the cropping area by dragging and resizing the highlighted region.</li>
                <li>Click the "Crop" button to generate the cropped image.</li>
                <li>Download the resulting image or start over with the "Re-crop" button.</li>
              </ol>
            </TabsContent>
            
            <TabsContent value="props" className="p-4 bg-white dark:bg-gray-800 rounded-md mt-4 shadow-sm">
              <h3 className="text-xl font-medium mb-4 dark:text-white">Component Properties</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2 dark:text-white">Property</th>
                      <th className="text-left py-2 dark:text-white">Type</th>
                      <th className="text-left py-2 dark:text-white">Default</th>
                      <th className="text-left py-2 dark:text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody className="dark:text-gray-300">
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 font-medium">onImageUpload</td>
                      <td className="py-2 text-sm font-mono">(file: File) => void</td>
                      <td className="py-2">-</td>
                      <td className="py-2">Callback when an image is uploaded</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 font-medium">maxSize</td>
                      <td className="py-2 text-sm font-mono">number</td>
                      <td className="py-2">5MB</td>
                      <td className="py-2">Maximum allowed file size in bytes</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 font-medium">accept</td>
                      <td className="py-2 text-sm font-mono">string[]</td>
                      <td className="py-2">['image/jpeg', 'image/png', ...]</td>
                      <td className="py-2">Accepted file types</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 font-medium">label</td>
                      <td className="py-2 text-sm font-mono">string</td>
                      <td className="py-2">'Upload an image'</td>
                      <td className="py-2">Main upload label</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">description</td>
                      <td className="py-2 text-sm font-mono">string</td>
                      <td className="py-2">'Drag and drop or click to upload'</td>
                      <td className="py-2">Description text for the upload area</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="p-4 bg-white dark:bg-gray-800 rounded-md mt-4 shadow-sm">
              <h3 className="text-xl font-medium mb-4 dark:text-white">Example Code</h3>
              <pre className="bg-gray-100 dark:bg-gray-950 p-4 rounded-md overflow-x-auto text-sm dark:text-gray-300">
                {`import { ImageUpload } from "@/components/ImageUpload";

// Basic usage
<ImageUpload onImageUpload={(file) => console.log(file)} />

// Custom configuration
<ImageUpload
  onImageUpload={(file) => handleFile(file)}
  maxSize={1024 * 1024} // 1MB
  label="Upload profile picture"
  description="JPG or PNG, max 1MB"
  accept={['image/jpeg', 'image/png']}
/>
`}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
        <div className="container py-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Image Components - Built with React, Tailwind CSS, and Framer Motion
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
