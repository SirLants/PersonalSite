import { ImagePreview } from './image-preview.type';

export interface FileMetadata {
  name: string;
  size: number;
  originalSize?: number;
  lastModified: number;
  preview?: ImagePreview;
  file: Blob;
  originalFile?: Blob;
}
