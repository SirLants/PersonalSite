import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

import { CompressedDimensions, FileMetadata } from '../types';
import { Orientation, FileError } from '../enums';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  public MaxWidth = 900;
  public MaxHeight = 1200;
  public MaxUploadSize = 20950000;

  public readySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private domSanitizer: DomSanitizer) { }

  public processFile(file: File, totalFileSize: number, fileSizeExceeded: boolean): Observable<FileMetadata> {
    return new Observable<FileMetadata>((observer) => {
      if (fileSizeExceeded) {
        observer.error(FileError.FileSize);
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerLoadResult: ProgressEvent) => {
        // make sure there is file data there, handle a weird scenario
        if (!readerLoadResult.target) {
          observer.error(FileError.NoFile);
          return;
        }

        // set basic file information variables
        const fileRead = readerLoadResult.target as FileReader;
        const view = new DataView(fileRead.result as ArrayBuffer);
        const fileUrl = URL.createObjectURL(file);
        const orientation = this.extractOrientation(view);

        if (orientation === Orientation.NotJPEG) {
          window.URL.revokeObjectURL(fileUrl);
          observer.error(FileError.FileFormat);
          return;
        }

        const needsCompression = file.size > (500 * 1024);

        // check if processing the image is necessary
        if (needsCompression || this.validOrientation(orientation)) {
          this.processImage(fileUrl, file.name, orientation, needsCompression).subscribe(
            (processedFile: Blob) => {
              window.URL.revokeObjectURL(fileUrl);

              if ((processedFile.size + totalFileSize) >= this.MaxUploadSize) {
                observer.error(FileError.FileSize);
                return;
              } else {
                const newFileUrl = URL.createObjectURL(processedFile);
                observer.next({
                  name: file.name, size: processedFile.size, originalSize: file.size, lastModified: (file as any).lastModified, file: processedFile, originalFile: file, preview: {
                    title: file.name || 'image.jpg',
                    source: this.domSanitizer.bypassSecurityTrustUrl(newFileUrl)
                  }
                });
                observer.complete();
                return;
              }
            },
            (error: FileError) => {
              window.URL.revokeObjectURL(fileUrl);
              observer.error(error);
              return;
            });
        } else { // rare scenario where the image is good to go on arrival
          this.horizontalOrientationCheck(fileUrl).subscribe(result => {
            if (result) {
              window.URL.revokeObjectURL(fileUrl);
              const newFileUrl = URL.createObjectURL(file);
              observer.next({
                name: file.name, size: file.size, lastModified: (file as any).lastModified, file: file, preview: {
                  title: file.name || 'image.jpg',
                  source: this.domSanitizer.bypassSecurityTrustUrl(newFileUrl)
                }
              });
              observer.complete();
              return;
            } else {
              observer.error(FileError.Orientation);
              return;
            }
          });

        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // if image processing is required this code needs to be run asynchronously with an Observable as the return statement
  public processImage(fileUrl: string, fileName: string, orientation: Orientation, needsCompression: boolean): Observable<Blob> {
    return new Observable<Blob>((observer) => {
      const image = new Image();
      image.onload = (imageLoadResult: any) => {
        let width = imageLoadResult.target.width;
        let height = imageLoadResult.target.height;

        if (needsCompression) {
          const calculatedDimensions: CompressedDimensions = this.calculateCompressionDimensions(imageLoadResult.target, orientation);

          width = calculatedDimensions.width;
          height = calculatedDimensions.height;
        }

        const canvas = this.compressAndCorrectOrientation(imageLoadResult.target, orientation, width, height);

        if (canvas.width > canvas.height) {
          observer.error(FileError.Orientation);
          return;
        }

        if (canvas.toBlob) {
          canvas.toBlob(blob => {
            observer.next(blob);
            observer.complete();
          }, 'image/jpeg', 0.9);
        } else {
          // polyfill.io was misbehaving, so we'll do it ourselves
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          const data = atob(dataUrl.split(',')[1]);

          const array = new Uint8Array(data.length);

          for (let i = 0; i < data.length; i++) {
            array[i] = data.charCodeAt(i);
          }

          const blob = new Blob([array], { type: 'image/jpeg' });
          observer.next(blob);
          observer.complete();
        }
      };

      image.src = fileUrl;
    });
  }

  // if an image is larger than 500mb this will calculate its new compressed dimensions
  public calculateCompressionDimensions(image: any, orientation: Orientation): CompressedDimensions {
    const validOrientation = orientation !== Orientation.Undefined && orientation !== Orientation.NotJPEG;
    let width = image.width;
    let height = image.height;

    // if orientations are valid we need to constrain image resolution by the correct max values since the image is currently horizontal
    const localMaxWidth = validOrientation ? this.MaxHeight : this.MaxWidth;
    const localMaxHeight = validOrientation ? this.MaxWidth : this.MaxHeight;

    if (width > height) {
      if (width > localMaxWidth) {
        height = Math.round(height * localMaxWidth / width);
        width = localMaxWidth;
      }
    } else {
      if (height > localMaxHeight) {
        width = Math.round(width * localMaxHeight / height);
        height = localMaxHeight;
      }
    }

    return { width, height };
  }

  // orientation data is a part of a JPEG image's EXIF metadata, this extracts that data
  public extractOrientation(view: DataView): Orientation {
    if (view.getUint16(0, false) != 0xFFD8) {
      return Orientation.NotJPEG;
    }

    const length = view.byteLength;
    let offset = 2;

    while (offset < length) {
      if (view.getUint16(offset + 2, false) <= 8) {
        return Orientation.Undefined;
      }
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) {
          return Orientation.Undefined;
        }

        const little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        let tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++) {
          if (view.getUint16(offset + (i * 12), little) == 0x0112) {
            // return valid orientation
            return view.getUint16(offset + (i * 12) + 8, little);
          }
        }
      } else if ((marker & 0xFF00) != 0xFF00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }
    return Orientation.Undefined;
  }

  // compress if necessary and/or when an image has EXIF orientation metadata correctly rotate accordingly
  public compressAndCorrectOrientation(image: HTMLImageElement, orientation: Orientation, rawWidth: number, rawHeight: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // all orientation values greater than 4 (enum value irrelevant) require flipping
    // transform only necessary on older images, if image is upright already leave as is
    if (orientation > 4 && rawHeight < rawWidth) {
      canvas.width = rawHeight;
      canvas.height = rawWidth;

      switch (orientation) {
        case Orientation.TopRight: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
        case Orientation.BottomRight: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
        case Orientation.BottomLeft: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
        case Orientation.LeftTop: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case Orientation.RightTop: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
        case Orientation.RightBottom: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
        case Orientation.LeftBottom: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
        default: break;
      }
    } else {
      canvas.width = rawWidth;
      canvas.height = rawHeight;
    }

    ctx.drawImage(image, 0, 0, rawWidth, rawHeight);
    return canvas;
  }

  private horizontalOrientationCheck(fileUrl: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const image = new Image();
      image.onload = (imageLoadResult: any) => {
        const width = imageLoadResult.target.width;
        const height = imageLoadResult.target.height;

        if (width > height) {
          observer.next(false);
          observer.complete();
        } else {
          observer.next(true);
          observer.complete();
        }
      };

      image.src = fileUrl;
    });
  }

  public typeExists(types: Array<any>) {
    return types && types.length;
  }

  public typeExistsAndHasSelection(types: Array<any>) {
    return this.typeExists(types) && types.some(x => x.selected);
  }

  private validOrientation(orientation: Orientation) {
    return orientation !== Orientation.Undefined && orientation !== Orientation.NotJPEG;
  }
}
