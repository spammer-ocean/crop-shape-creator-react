import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { toast } from "sonner";

export const useImageCropper = (shape = "square", dimensions = {
    width: 200,
    height: 200
}, radius = 0, sizeLimit = 2 * 1024 * 1024 // 2MB default
) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [cropObject, setCropObject] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [croppedDataUrl, setCroppedDataUrl] = useState(null);
    
    // Initialize the canvas
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const fabricCanvas = new fabric.Canvas(canvasRef.current);
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
            cropObj = new fabric.Circle({
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
            
            cropObj = new fabric.Rect({
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

    const loadImage = async (file) => {
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
            fabric.Image.fromURL(url, (img) => {
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

    const cropImage = () => {
        if (!canvas || !originalImage || !cropObject) return;
        
        setIsLoading(true);
        try {
            // Get the cropping area
            const cropArea = cropObject.getBoundingRect();
            
            // Create a temporary canvas to draw the cropped image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = dimensions.width;
            tempCanvas.height = dimensions.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) {
                toast.error("Could not create canvas context.");
                setIsLoading(false);
                return;
            }
            
            // Draw the cropped image on the temporary canvas
            tempCtx.drawImage(
                originalImage.getElement(),
                cropArea.left,
                cropArea.top,
                cropArea.width,
                cropArea.height,
                0,
                0,
                dimensions.width,
                dimensions.height
            );
            
            // Get the data URL of the cropped image
            const dataURL = tempCanvas.toDataURL('image/png');
            setCroppedDataUrl(dataURL);
            toast.success("Image cropped successfully!");
        } catch (error) {
            console.error("Error cropping image:", error);
            toast.error("Failed to crop the image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetCrop = () => {
        if (!canvas || !originalImage) return;
        
        setIsLoading(true);
        try {
            // Remove the crop object
            if (cropObject) {
                canvas.remove(cropObject);
                setCropObject(null);
            }
            
            // Reset the image position and scale
            originalImage.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                scaleX: 1,
                scaleY: 1
            });
            
            canvas.setActiveObject(originalImage);
            canvas.renderAll();
            setCroppedDataUrl(null);
            setIsCropping(false);
            toast.success("Crop reset successfully!");
        } catch (error) {
            console.error("Error resetting crop:", error);
            toast.error("Failed to reset the crop. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCroppedImage = () => {
        if (!croppedDataUrl) {
            toast.error("No cropped image to download.");
            return;
        }
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = croppedDataUrl;
        link.download = 'cropped_image.png'; // You can customize the file name
        document.body.appendChild(link);
        
        // Programmatically click the link to trigger the download
        link.click();
        
        // Remove the link from the document
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
