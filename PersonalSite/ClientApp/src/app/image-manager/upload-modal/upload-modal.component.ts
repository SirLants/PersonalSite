import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { SaveResult } from '../types';
import { FileError } from '../enums';

@Component({
  selector: 'upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['../tax-document.css']
})
export class UploadModalComponent implements OnInit {
  @Input() saveResult: Observable<SaveResult>;
  @Input() passwordResult: Observable<boolean>;
  @Input() currentlyUploading = false;
  @Input() isFileUpload = true;

  private PasswordValue = '';
  @Output() passwordUpdated: EventEmitter<string> = new EventEmitter<string>();
  get passwordValue() { return this.PasswordValue; }
  set passwordValue(val: string) {
    this.PasswordValue = val;
    this.passwordUpdated.emit(this.PasswordValue);
  }

  public fileError = FileError;

  public localSaveResult: SaveResult;

  public passwordAttempted = false;
  public uploadProgress = 0;

  constructor() { }

  ngOnInit() {
    this.saveResult.subscribe((data: SaveResult) => {
      if (data.uploadProgress) {
        this.uploadProgress = data.uploadProgress;
      }
      this.localSaveResult = data;
    });
    this.passwordResult.subscribe((result: boolean) => {
      this.passwordAttempted = true;
    });
  }
}
