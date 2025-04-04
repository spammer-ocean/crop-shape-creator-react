
import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-center">
            Image Upload & Crop Component
          </h1>
          <p className="text-center text-gray-500 mt-2">
            Upload, crop, and resize images with custom shapes and dimensions
          </p>
        </div>
      </header>
      
      <main className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Configuration</h2>
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
          
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Image Cropper</h2>
            <ImageCropper
              shape={shape}
              dimensions={dimensions}
              radius={radius}
              sizeLimit={sizeLimit}
              onCropComplete={handleCropComplete}
            />
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Usage Instructions</h2>
          
          <Tabs defaultValue="usage">
            <TabsList>
              <TabsTrigger value="usage">How to Use</TabsTrigger>
              <TabsTrigger value="props">Component Props</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="p-4 bg-white rounded-md mt-4 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Using the Image Cropper</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Configure the desired crop shape, dimensions, corner radius, and file size limit.</li>
                <li>Upload an image by dragging and dropping or clicking the upload area.</li>
                <li>Adjust the cropping area by dragging and resizing the highlighted region.</li>
                <li>Click the "Crop" button to generate the cropped image.</li>
                <li>Download the resulting image or start over with the "Re-crop" button.</li>
              </ol>
            </TabsContent>
            
            <TabsContent value="props" className="p-4 bg-white rounded-md mt-4 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Component Properties</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Property</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Default</th>
                      <th className="text-left py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">shape</td>
                      <td className="py-2 text-sm font-mono">'circle' | 'square' | 'rectangle'</td>
                      <td className="py-2">'square'</td>
                      <td className="py-2">The shape of the cropped image</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">dimensions</td>
                      <td className="py-2 text-sm font-mono">
                        {`{ width: number, height: number }`}
                      </td>
                      <td className="py-2">{`{ width: 200, height: 200 }`}</td>
                      <td className="py-2">The dimensions of the output image in pixels</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">radius</td>
                      <td className="py-2 text-sm font-mono">number</td>
                      <td className="py-2">0</td>
                      <td className="py-2">Corner radius for square/rectangle shapes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">sizeLimit</td>
                      <td className="py-2 text-sm font-mono">number</td>
                      <td className="py-2">2097152 (2MB)</td>
                      <td className="py-2">Maximum allowed file size in bytes</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">onCropComplete</td>
                      <td className="py-2 text-sm font-mono">
                        {`(dataUrl: string, file: File) => void`}
                      </td>
                      <td className="py-2">-</td>
                      <td className="py-2">Callback when cropping is complete</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="p-4 bg-white rounded-md mt-4 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Example Code</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {`import { ImageCropper } from "@/components/ImageCropper/ImageCropper";

// Basic usage
<ImageCropper />

// Custom configuration
<ImageCropper
  shape="circle"
  dimensions={{ width: 200, height: 200 }}
  sizeLimit={1024 * 1024} // 1MB
  onCropComplete={(dataUrl, file) => {
    console.log("Cropped image:", dataUrl);
    console.log("File size:", file.size);
  }}
/>

// Rectangle with rounded corners
<ImageCropper
  shape="rectangle"
  dimensions={{ width: 300, height: 150 }}
  radius={20}
/>
`}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="container py-6">
          <p className="text-center text-gray-500">
            Image Upload & Crop Component - Built with React, Fabric.js, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
