import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { ModalModule } from '../shared/modal/modal.module';

import { PluralityPipe, AndStringPipe, NamePipe } from './pipes';

import { ImageManagerHomeComponent } from './image-manager/image-manager.component';
import { TypeSelectionComponent } from './type-selection/type-selection.component';
import { FileSelectionComponent } from './file-selection/file-selection.component';
import { UploadModalComponent } from './upload-modal/upload-modal.component';
import { ImageManagerRoutingModule } from './image-manager-routing.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ImageManagerHomeComponent,
    TypeSelectionComponent,
    FileSelectionComponent,
    UploadModalComponent,
    AndStringPipe,
    PluralityPipe,
    NamePipe
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ModalModule,
    ImageManagerRoutingModule,
    MatIconModule
  ]
})
export class ImageManagerModule { }
