
export type CropShape = 'circle' | 'square' | 'rectangle';

export type Dimensions = {
  width: number;
  height: number;
};

export interface ImageCropperProps {
  shape?: CropShape;
  dimensions?: Dimensions;
  radius?: number;
  sizeLimit?: number; // in bytes
  onCropComplete?: (dataUrl: string, file: File) => void;
}
