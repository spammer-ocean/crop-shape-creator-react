
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Index = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Handle image upload
  const handleImageUpload = (file: File) => {
    console.log("Image uploaded:", file);
    // In a real application, you might want to do something with the file here
    toast.success(`Image "${file.name}" uploaded successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-center dark:text-white">
            Simple Image Upload Component
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            Upload and preview images with easy to use component
          </p>
        </div>
      </header>
      
      <main className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold dark:text-white">Standard Upload</h2>
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
            <h2 className="text-2xl font-semibold dark:text-white">Save to Public Folder</h2>
            <Card>
              <CardContent className="pt-6">
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  maxSize={2 * 1024 * 1024}
                  label="Upload to public folder"
                  description="Images will be saved to project's public folder"
                  saveToPublic={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">Usage Instructions</h2>
          
          <Tabs defaultValue="usage">
            <TabsList>
              <TabsTrigger value="usage">How to Use</TabsTrigger>
              <TabsTrigger value="props">Component Props</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="p-4 bg-white dark:bg-gray-800 rounded-md mt-4 shadow-sm">
              <h3 className="text-xl font-medium mb-4 dark:text-white">Using the Image Upload Component</h3>
              <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
                <li>Drag and drop an image onto the upload area or click to select a file</li>
                <li>Once uploaded, a preview will be shown with file information</li>
                <li>You can download the image or remove it</li>
                <li>When the saveToPublic option is enabled, images will be saved to the project&apos;s public folder</li>
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
                      <td className="py-2 text-sm font-mono">(file: File) =&gt; void</td>
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
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 font-medium">description</td>
                      <td className="py-2 text-sm font-mono">string</td>
                      <td className="py-2">'Drag and drop or click to upload'</td>
                      <td className="py-2">Description text for the upload area</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">saveToPublic</td>
                      <td className="py-2 text-sm font-mono">boolean</td>
                      <td className="py-2">false</td>
                      <td className="py-2">Save the image to public folder</td>
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

// With public folder saving
<ImageUpload
  onImageUpload={(file) => handleFile(file)}
  maxSize={1024 * 1024} // 1MB
  label="Upload profile picture"
  description="JPG or PNG, max 1MB"
  saveToPublic={true}
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
            Simple Image Upload Component - Built with React and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
