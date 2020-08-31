import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { ModalService } from '../../shared/modal/modal.service';
import { DocumentHttpService } from '../services';

import { Document, SaveResult, FileMetadata } from '../types';
import { FileError } from '../enums';

@Component({
  selector: 'image-manager-home',
  templateUrl: './image-manager.component.html',
  styleUrls: ['./image-manager.css']
})

export class ImageManagerHomeComponent implements OnInit {

  public model: Document;
  public selectedFiles: Array<FileMetadata> = [];
  public fileType = '';

  public processingPasswordPdf = false;
  public pdfPassword = '';
  public pdfPasswordId: number;

  public uploadModalId = 'upload-modal';
  public isUploadModalOpen = false;
  public currentlyUploading = false;
  public isFileUpload = true;
  public isUploadComplete = false;
  public uploadModalTitle = 'Uploading...';
  public uploadSubject = new Subject<SaveResult>();
  public passwordSubject = new Subject<boolean>();
  public fileSubject = new Subject<any>();
  public typeSubject = new Subject<any>();

  instKey: string;
  aidAppId: string;

  constructor(private documentHttpService: DocumentHttpService, private modalService: ModalService) { }

  ngOnInit() {
    this.model = this.documentHttpService.getMockModel();
  }

  public upload() {
    const taxDocumentTypes = this.model.taxDocumentTypes.filter(x => x.selected).map(y => y.typeInd);
    const nontaxableDocumentTypes = this.model.nontaxableDocumentTypes.filter(x => x.selected).map(y => y.typeInd);
    const supplementalDocumentType = this.model.supplementalDocumentTypes.filter(x => x.selected).map(y => y.typeInd)[0];

    if (this.fileType === 'pdf') {
      this.openUploadModal();
      this.documentHttpService.uploadPdf(this.instKey, this.aidAppId, taxDocumentTypes, nontaxableDocumentTypes, supplementalDocumentType, this.selectedFiles.map(x => x.file)).subscribe(progressEvent => {
        this.processProgressEvents(progressEvent);
      });
    }
    if (this.fileType === 'jpg') {
      this.openUploadModal();
      this.documentHttpService.uploadImages(this.instKey, this.aidAppId, taxDocumentTypes, nontaxableDocumentTypes, supplementalDocumentType, this.selectedFiles.map(x => x.file)).subscribe(progressEvent => {
        this.processProgressEvents(progressEvent);
      });
    }
  }

  private processProgressEvents(progressEvent: any) {
    switch (progressEvent.type) {
      case HttpEventType.UploadProgress:
        if (!isNaN(progressEvent.loaded / progressEvent.total)) {
          const percentDone = Math.round(100 * progressEvent.loaded / progressEvent.total);
          this.uploadSubject.next({ uploadProgress: percentDone });
        }
        break;
      case HttpEventType.Response:
        if (this.fileType === 'pdf') {
          this.handlePdfResponse(progressEvent.body);
        } else {
          this.handleImageResponse(progressEvent.body);
        }
        break;
    }
  }

  private handlePdfResponse(response: any) {
    const saveResult: SaveResult = {
      fileType: this.fileType,
      uploadSuccessful: response.uploadSuccessful,
      uploadError: response.fileError,
      fileName: this.selectedFiles[0].name,
      passwordProtectedFileId: response.passwordProtectedFileId,
      uploadProgress: 0
    };

    this.currentlyUploading = false;
    if (saveResult.uploadSuccessful) {
      if (saveResult.uploadError === FileError.PasswordProtected) {
        this.processingPasswordPdf = true;
        this.pdfPasswordId = saveResult.passwordProtectedFileId;
        this.uploadModalTitle = 'Upload Problem';
      } else {
        this.successfulSave();
      }
    } else {
      this.uploadModalTitle = 'Upload Problem';
    }

    this.uploadSubject.next(saveResult);
  }

  private handleImageResponse(response: any) {
    const saveResult: SaveResult = {
      fileType: this.fileType,
      uploadSuccessful: response.uploadSuccessful,
      uploadError: response.fileError,
      fileName: '',
      uploadProgress: 0
    };

    this.currentlyUploading = false;
    if (saveResult.uploadSuccessful) {
      this.successfulSave();
    } else {
      this.uploadModalTitle = 'Upload Problem';
    }

    this.uploadSubject.next(saveResult);
  }

  public unlockPasswordProtectedPDF() {
    this.currentlyUploading = true;
    this.isFileUpload = false;
    this.uploadModalTitle = 'Unlocking PDF...';
    this.documentHttpService.unlockedPasswordProtectedPdf(
      this.instKey,
      this.aidAppId,
      this.pdfPasswordId,
      this.pdfPassword,
      this.model.supplementalDocumentTypes.filter(x => x.selected).map(y => y.typeInd)[0])
      .subscribe(result => {
        if (result) {
          this.uploadSubject.next({ uploadSuccessful: true });
          this.processingPasswordPdf = false;
          this.successfulSave();
        } else {
          this.uploadModalTitle = 'Upload Problem';
          this.passwordSubject.next(false);
        }

        this.currentlyUploading = false;
      });
  }

  public updatePassword(passwordValue: string) {
    this.pdfPassword = passwordValue;
  }

  public openUploadModal() {
    this.uploadModalTitle = 'Uploading...';
    this.currentlyUploading = true;
    this.isFileUpload = true;
    this.modalService.open(this.uploadModalId);
  }

  public closeUploadModal(resetFiles: boolean = false) {
    this.processingPasswordPdf = false;
    this.pdfPassword = '';
    this.pdfPasswordId = null;
    this.isUploadComplete = false;

    this.modalService.close(this.uploadModalId);

    if (resetFiles) {
      this.fileSubject.next();
      this.typeSubject.next();
    }
  }

  private successfulSave() {
    this.uploadModalTitle = 'Upload Complete';
    this.isUploadComplete = true;
    this.fileSubject.next();
    this.typeSubject.next();
  }
}
