
import { useEffect, useRef, useState } from "react";
import { Canvas, Circle, Rect, Image as FabricImage, loadSVGFromURL } from "fabric";
import { CropShape, Dimensions } from "@/types/ImageCropper";
import { toast } from "sonner";

export const useImageCropper = (
  shape: CropShape = "square",
  dimensions: Dimensions = { width: 200, height: 200 },
  radius: number = 0,
  sizeLimit: number = 2 * 1024 * 1024 // 2MB default
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);
  const [cropObject, setCropObject] = useState<Circle | Rect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);

  // Initialize the canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current);
    fabricCanvas.setWidth(400);
    fabricCanvas.setHeight(400);
    fabricCanvas.selection = false;
    
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Handle crop shape changes
  useEffect(() => {
    if (!canvas || !originalImage) return;

    // Remove existing crop object if any
    if (cropObject) {
      canvas.remove(cropObject);
      setCropObject(null);
    }

    const imgWidth = originalImage.width ?? 0;
    const imgHeight = originalImage.height ?? 0;
    
    // Calculate sizes for the crop shape
    const cropSize = Math.min(imgWidth, imgHeight) * 0.8;
    
    let cropObj;
    
    if (shape === 'circle') {
      cropObj = new Circle({
        left: imgWidth / 2,
        top: imgHeight / 2,
        radius: cropSize / 2,
        fill: 'transparent',
        stroke: '#9b87f5',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        originX: 'center',
        originY: 'center',
        hasControls: true,
        hasBorders: false
      });
    } else {
      // For square and rectangle
      let width = shape === 'square' ? cropSize : cropSize * (dimensions.width / dimensions.height);
      let height = shape === 'square' ? cropSize : cropSize * (dimensions.height / dimensions.width);
      
      cropObj = new Rect({
        left: imgWidth / 2,
        top: imgHeight / 2,
        width: width,
        height: height,
        fill: 'transparent',
        stroke: '#9b87f5',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        originX: 'center',
        originY: 'center',
        rx: radius,
        ry: radius,
        hasControls: true,
        hasBorders: false
      });
    }
    
    canvas.add(cropObj);
    cropObj.setCoords();
    setCropObject(cropObj);
    canvas.renderAll();
  }, [canvas, originalImage, shape, dimensions, radius]);

  const loadImage = async (file: File): Promise<void> => {
    if (!canvas) return;
    
    setIsLoading(true);
    
    try {
      // Check file size
      if (file.size > sizeLimit) {
        toast.error(`Image size exceeds the limit of ${Math.round(sizeLimit / 1024)} KB`);
        setIsLoading(false);
        return;
      }
      
      // Create URL for the file
      const url = URL.createObjectURL(file);
      
      // Clear existing objects
      canvas.clear();
      
      // Create a fabric image object
      FabricImage.fromURL(url, (img) => {
        // Scale the image to fit the canvas
        const canvasWidth = canvas.width ?? 400;
        const canvasHeight = canvas.height ?? 400;
        
        const scaleX = canvasWidth / (img.width ?? 1);
        const scaleY = canvasHeight / (img.height ?? 1);
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        img.scale(scale);
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        setOriginalImage(img);
        setIsCropping(true);
        
        // Center the view
        canvas.renderAll();
        
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error loading image:", error);
      toast.error("Failed to load the image. Please try again.");
      setIsLoading(false);
    }
  };

  const cropImage = async (): Promise<void> => {
    if (!canvas || !originalImage || !cropObject) {
      toast.error("Please upload an image and adjust the crop area");
      return;
    }
    
    try {
      // Temporarily disable selection and controls
      canvas.discardActiveObject();
      canvas.renderAll();
      
      // Get crop object dimensions and position
      const cropLeft = cropObject.left ?? 0;
      const cropTop = cropObject.top ?? 0;
      const cropWidth = shape === 'circle' 
        ? (cropObject as Circle).radius! * 2 
        : (cropObject as Rect).width!;
      const cropHeight = shape === 'circle'
        ? (cropObject as Circle).radius! * 2
        : (cropObject as Rect).height!;
      
      // Calculate the crop position in the image coordinate
      const imgLeft = originalImage.left ?? 0;
      const imgTop = originalImage.top ?? 0;
      const imgScale = originalImage.scaleX ?? 1;
      
      // Calculate the crop area in the original image coordinates
      const cropX = (cropLeft - imgLeft) / imgScale + (originalImage.width ?? 0) / 2;
      const cropY = (cropTop - imgTop) / imgScale + (originalImage.height ?? 0) / 2;
      const cropScaledWidth = cropWidth / imgScale;
      const cropScaledHeight = cropHeight / imgScale;
      
      // Create a temporary canvas for cropping
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = dimensions.width;
      tempCanvas.height = dimensions.height;
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Create a temporary image for the original image data
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = originalImage.getSrc();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Draw the cropped portion into the temporary canvas
      ctx.drawImage(
        img,
        cropX - cropScaledWidth / 2,
        cropY - cropScaledHeight / 2,
        cropScaledWidth,
        cropScaledHeight,
        0,
        0,
        dimensions.width,
        dimensions.height
      );
      
      // For circle shape, apply a circular clip
      if (shape === 'circle') {
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const radius = Math.min(centerX, centerY);
        
        // Save the context state
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
      
      // For rounded rectangles
      if (shape !== 'circle' && radius > 0) {
        const r = radius;
        const w = dimensions.width;
        const h = dimensions.height;
        
        // Save current data to a temp canvas
        const tempCanvas2 = document.createElement('canvas');
        tempCanvas2.width = w;
        tempCanvas2.height = h;
        const tempCtx = tempCanvas2.getContext('2d');
        
        if (!tempCtx) {
          throw new Error("Could not get temporary canvas context");
        }
        
        tempCtx.drawImage(tempCanvas, 0, 0);
        
        // Clear and draw rounded rectangle path
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        
        // Draw original image back
        ctx.drawImage(tempCanvas2, 0, 0);
      }
      
      // Get the data URL
      const dataUrl = tempCanvas.toDataURL('image/png');
      
      // Convert the data URL to a file
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const croppedFile = new File([blob], "cropped-image.png", { 
        type: mimeString 
      });
      
      // Check if the cropped file size is within the limit
      if (croppedFile.size > sizeLimit) {
        toast.error(`Cropped image size exceeds the limit of ${Math.round(sizeLimit / 1024)} KB`);
        return;
      }
      
      setCroppedDataUrl(dataUrl);
      setIsCropping(false);
      
      return;
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Failed to crop the image. Please try again.");
    }
  };

  const resetCrop = (): void => {
    setCroppedDataUrl(null);
    setIsCropping(true);
  };

  const downloadCroppedImage = (): void => {
    if (!croppedDataUrl) return;
    
    const link = document.createElement('a');
    link.href = croppedDataUrl;
    link.download = 'cropped-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    canvasRef,
    isLoading,
    isCropping,
    croppedDataUrl,
    loadImage,
    cropImage,
    resetCrop,
    downloadCroppedImage
  };
};
