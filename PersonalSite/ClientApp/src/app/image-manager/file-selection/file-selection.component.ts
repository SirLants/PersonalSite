import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Observable, from, of, EMPTY } from 'rxjs';
import { concatMap, catchError, finalize } from 'rxjs/operators';

import { DocumentService } from '../services';
import { FileMetadata } from '../types';
import { FileError } from '../enums';

@Component({
  selector: 'file-selection',
  templateUrl: './file-selection.component.html',
  styleUrls: ['../tax-document.css', './file-selection.css']
})
export class FileSelectionComponent implements OnInit {
  @ViewChild('pdfInput') pdfInput: any;
  @ViewChild('imageInput') imageInput: any;

  public previewIndex = 0;
  public readyToUpload = false;
  public fileError = FileError;
  public pdfError: FileError;
  public pdfErrorName = '';
  public imageErrors: Array<FileError> = [];
  public fileSizeExceeded = false;

  @Input() resetComponent: Observable<any>;

  @Output() uploadFiles = new EventEmitter<boolean>();

  private FileType = '';
  @Output() updateFileType = new EventEmitter<string>();
  get fileType() { return this.FileType; }
  set fileType(val: string) {
    this.FileType = val;
    this.updateFileType.emit(this.FileType);
  }

  private localSelectedFiles: Array<FileMetadata> = [];
  @Output() selectedFilesChange = new EventEmitter<Array<FileMetadata>>();
  @Input()
  get selectedFiles() { return this.localSelectedFiles; }
  set selectedFiles(value: Array<FileMetadata>) {
    this.localSelectedFiles = value;

    this.selectedFilesChange.emit(this.localSelectedFiles);
  }

  public get compressedFileSize() {
    const size = this.selectedFiles.map(x => x.size).reduce((total, current) => total + current);
    return size > 0 ? Math.round(size / 1024) : 0;
  }

  public get originalFileSize() {
    const size = this.selectedFiles.map(x => x.originalSize || x.size).reduce((total, current) => total + current);
    return size > 0 ? Math.round(size / 1024) : 0;
  }

  constructor(private documentService: DocumentService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.documentService.readySubject.subscribe(readyToUpload => {
      this.readyToUpload = readyToUpload;
    });

    this.resetComponent.subscribe(x => {
      this.selectedFiles.forEach(selectedFile => {
        if (selectedFile.preview) {
          window.URL.revokeObjectURL(selectedFile.preview.source as any);
        }
      });
      this.selectedFiles = [];

      this.fileType = '';
      this.previewIndex = 0;
      this.pdfError = null;
      this.pdfErrorName = '';
      this.imageErrors = [];
      this.imageInput.nativeElement.value = null;
      this.pdfInput.nativeElement.value = null;
      this.fileSizeExceeded = false;
    });
  }

  public incrementPreviewIndex() {
    this.previewIndex++;
  }

  public decrementPreviewIndex() {
    this.previewIndex--;
  }

  public removeImage() {
    const removedImage = this.selectedFiles.splice(this.previewIndex, 1)[0];
    window.URL.revokeObjectURL(removedImage.preview.source as any);

    if (this.selectedFiles.length === 0 || this.previewIndex === 0) {
      this.previewIndex = 0;
    } else if (this.selectedFiles.length === this.previewIndex) {
      this.previewIndex--;
    }

    if (this.selectedFiles.length < 1) {
      this.fileType = '';
    }

    this.fileSizeExceeded = false;
    this.imageErrors = [];

    // this allows us to manage the duplicate file check manually 
    this.imageInput.nativeElement.value = null;
  }

  public removePDF() {
    this.selectedFiles = [];
    this.fileType = '';
    this.pdfError = null;
    this.pdfErrorName = '';
    this.pdfInput.nativeElement.value = null;
  }

  public onSelectPDF() {
    this.imageErrors = [];
    const file: File = this.pdfInput.nativeElement.files[0];
    const fileType: string = file.name.split('.')[file.name.split('.').length - 1];

    if (fileType.toUpperCase() !== 'PDF') {
      this.pdfErrorName = file.name;
      this.pdfError = FileError.FileFormat;
    } else if (file.size >= this.documentService.MaxUploadSize) {
      this.pdfErrorName = file.name;
      this.pdfError = FileError.FileSize;
    } else {
      this.pdfErrorName = '';
      this.pdfError = null;

      this.selectedFiles.push({ name: file.name, size: file.size, lastModified: (file as any).lastModified, file: file });

      this.fileType = 'pdf';
    }
  }

  public onSelectImages() {
    this.pdfError = null;
    this.pdfErrorName = '';

    const files: File[] = Array.from(this.imageInput.nativeElement.files);

    const errors: Array<FileError> = [];
    const validFiles: Array<FileMetadata> = [];

    let totalFileSize = 0;
    this.selectedFiles.forEach(selectedFile => {
      totalFileSize += selectedFile.size;
    });

    const newFiles: Array<File> = [];
    files.forEach(file => {
      const lastModified = (file as any).lastModified;
      if (this.selectedFiles.some(selected => selected.name === file.name && selected.size === file.size && selected.lastModified === lastModified)) {
        errors.push(FileError.Duplicate);
      } else {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      // process each file in order, a processedFile doesn't necessarily mean the image required processing
      from(newFiles)
        .pipe(
          concatMap(file => {
            return this.documentService.processFile(file, totalFileSize, this.fileSizeExceeded)
              .pipe(
                catchError((error: FileError) => {
                  // this catches and handles a single instance of an error being thrown, allowing the iterable to continue
                  if (error === FileError.FileSize) {
                    this.fileSizeExceeded = true;
                  }

                  errors.push(error);
                  return of();
                })
              )
          }),
          finalize(() => {
            // once all asynchronous functionality has been completed we set the global values for the UI
            this.imageErrors = errors;
            if (validFiles.length > 0) {
              this.selectedFiles.push(...validFiles);
              this.fileType = 'jpg';
            }

            new Observable(observer => {
              setInterval(() => {
                observer.next();
              }, 10)
            }).subscribe(_ => { this.changeDetector.detectChanges(); });
          })
        )
        .subscribe(
          (metadata: FileMetadata) => {
            totalFileSize += metadata.size;
            validFiles.push(metadata);
          });
    } else {
      this.imageErrors = errors;
    }

  }

  public triggerPDFMenu() {
    this.pdfInput.nativeElement.click();
  }

  public triggerImageMenu() {
    this.imageInput.nativeElement.click();
  }

  public upload() {
    this.uploadFiles.emit(true);
  }

  public imageErrorsContain(fileError: FileError) {
    return this.imageErrors.some(error => error === fileError);
  }

  public imageErrorsCount(fileError: FileError) {
    return this.imageErrors.filter(error => error === fileError).length;
  }
}
