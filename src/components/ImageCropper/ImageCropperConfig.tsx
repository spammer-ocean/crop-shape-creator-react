
import { useState } from "react";
import { CropShape, Dimensions } from "@/types/ImageCropper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/utils/fileUtils";

interface ImageCropperConfigProps {
  shape: CropShape;
  setShape: (shape: CropShape) => void;
  dimensions: Dimensions;
  setDimensions: (dimensions: Dimensions) => void;
  radius: number;
  setRadius: (radius: number) => void;
  sizeLimit: number;
  setSizeLimit: (sizeLimit: number) => void;
  presetDimensions: { name: string; width: number; height: number }[];
}

export function ImageCropperConfig({
  shape,
  setShape,
  dimensions,
  setDimensions,
  radius,
  setRadius,
  sizeLimit,
  setSizeLimit,
  presetDimensions = [
    { name: "Square (50×50)", width: 50, height: 50 },
    { name: "Rectangle (50×75)", width: 50, height: 75 },
    { name: "Profile (200×200)", width: 200, height: 200 },
    { name: "Banner (1200×400)", width: 1200, height: 400 },
  ],
}: ImageCropperConfigProps) {
  const [customWidth, setCustomWidth] = useState(dimensions.width.toString());
  const [customHeight, setCustomHeight] = useState(dimensions.height.toString());

  const handleShapeChange = (value: string) => {
    setShape(value as CropShape);
    
    // Reset radius when changing shapes
    if (value === 'circle') {
      setRadius(0);
    }
  };

  const handleSizeLimitChange = (value: string) => {
    const sizeInMB = parseFloat(value);
    if (!isNaN(sizeInMB)) {
      setSizeLimit(sizeInMB * 1024 * 1024);
    }
  };

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      // Do nothing, let the user input custom dimensions
      return;
    }
    
    const preset = presetDimensions.find(p => p.name === value);
    if (preset) {
      setDimensions({ width: preset.width, height: preset.height });
      setCustomWidth(preset.width.toString());
      setCustomHeight(preset.height.toString());
    }
  };

  const applyCustomDimensions = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return;
    }
    
    setDimensions({ width, height });
  };

  // Calculate max radius based on the smallest dimension
  const maxRadius = Math.min(dimensions.width, dimensions.height) / 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Cropper Configuration</CardTitle>
        <CardDescription>
          Configure the shape, dimensions, and size constraints
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Shape Selection */}
        <div className="space-y-1">
          <Label htmlFor="shape">Crop Shape</Label>
          <Select value={shape} onValueChange={handleShapeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="rectangle">Rectangle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Dimensions */}
        <div className="space-y-1">
          <Label htmlFor="dimensions">Preset Dimensions</Label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select dimensions or custom" />
            </SelectTrigger>
            <SelectContent>
              {presetDimensions.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Custom Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              type="number"
              min="1"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              min="1"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
            />
          </div>
        </div>
        
        <Button onClick={applyCustomDimensions} variant="outline" className="w-full">
          Apply Custom Dimensions
        </Button>
        
        {/* Radius (for square and rectangle) */}
        {shape !== 'circle' && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label htmlFor="radius">Corner Radius</Label>
              <span className="text-sm text-gray-500">{Math.round(radius)}px</span>
            </div>
            <Slider
              id="radius"
              min={0}
              max={maxRadius}
              step={1}
              value={[radius]}
              onValueChange={(values) => setRadius(values[0])}
            />
          </div>
        )}
        
        {/* Size Limit */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="sizeLimit">Size Limit</Label>
            <span className="text-sm text-gray-500">{formatBytes(sizeLimit)}</span>
          </div>
          <Select 
            value={(sizeLimit / (1024 * 1024)).toString()} 
            onValueChange={handleSizeLimitChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select file size limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.05">50 KB</SelectItem>
              <SelectItem value="0.1">100 KB</SelectItem>
              <SelectItem value="0.5">500 KB</SelectItem>
              <SelectItem value="1">1 MB</SelectItem>
              <SelectItem value="2">2 MB</SelectItem>
              <SelectItem value="5">5 MB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Current Configuration Summary */}
        <div className="p-3 bg-gray-50 rounded-md text-sm space-y-1">
          <p><strong>Current Configuration:</strong></p>
          <p>Shape: {shape}</p>
          <p>Dimensions: {dimensions.width}×{dimensions.height}px</p>
          {shape !== 'circle' && <p>Corner Radius: {Math.round(radius)}px</p>}
          <p>Size Limit: {formatBytes(sizeLimit)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
