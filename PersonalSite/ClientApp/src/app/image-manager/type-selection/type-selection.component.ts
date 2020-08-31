import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { DocumentService } from '../services';
import { AndStringPipe } from '../pipes';

import { TaxDocumentType, DocumentType } from '../types';
import { DocumentTypeId } from '../enums';

@Component({
  selector: 'type-selection',
  templateUrl: './type-selection.component.html',
  providers: [AndStringPipe],
  styleUrls: ['../tax-document.css']
})
export class TypeSelectionComponent implements OnInit {

  public disableTax = false;
  public disableNontaxable = false;
  public disableSupplemental = false;
  public taxCount = 0;
  public nontaxableCount = 0;
  public supplementalCount = 0;
  public readyToUpload = false;
  public helpText: Partial<{ [typeId: number]: string }> = {
    [DocumentTypeId.SocialSecurity]: 'SSA-1099 or SSI statements/letters for all family members receiving benefits',
    [DocumentTypeId.Welfare]: 'A budget letter or notice of benefit from the appropriate agency',
    [DocumentTypeId.SNAP]: 'A budget letter or notice of benefit from the appropriate agency',
    [DocumentTypeId.TANF]: 'A budget letter or notice of benefit from the appropriate agency',
    [DocumentTypeId.AlimonyReceived]: 'The court ordered legal documents or a letter from the provider of your alimony',
    [DocumentTypeId.ChildSupport]: 'The court ordered legal documents or a letter from the provider of your child support',
    [DocumentTypeId.WorkersCompensation]: 'A Workers\' Compensation award letter',
    [DocumentTypeId.HousingAllowance]: 'A benefit statement or enrollment and payment letter',
  };

  private isViewingAll = false;

  @Input() resetComponent: Observable<any>;

  private localTaxDocumentTypes: Array<TaxDocumentType> = [];
  @Output() taxDocumentTypesChange = new EventEmitter<Array<TaxDocumentType>>();
  @Input()
  get taxDocumentTypes() { return this.localTaxDocumentTypes; }
  set taxDocumentTypes(value: Array<TaxDocumentType>) {
    this.localTaxDocumentTypes = value;

    this.taxDocumentTypesChange.emit(this.localTaxDocumentTypes);
  }

  private localNontaxableDocumentTypes: Array<DocumentType> = [];
  @Output() nontaxableDocumentTypesChange = new EventEmitter<Array<DocumentType>>();
  @Input()
  get nontaxableDocumentTypes() { return this.localNontaxableDocumentTypes; }
  set nontaxableDocumentTypes(value: Array<DocumentType>) {
    this.localNontaxableDocumentTypes = value;

    this.nontaxableDocumentTypesChange.emit(this.localNontaxableDocumentTypes);
  }

  private localSupplementalDocumentTypes: Array<DocumentType> = [];
  @Output() supplementalDocumentTypesChange = new EventEmitter<Array<DocumentType>>();
  @Input()
  get supplementalDocumentTypes() { return this.localSupplementalDocumentTypes; }
  set supplementalDocumentTypes(value: Array<DocumentType>) {
    this.localSupplementalDocumentTypes = value;

    this.supplementalDocumentTypesChange.emit(this.localSupplementalDocumentTypes);
  }

  constructor(private andPipe: AndStringPipe, private documentService: DocumentService) { }

  ngOnInit() {
    this.documentService.readySubject.subscribe(readyToUpload => {
      this.readyToUpload = readyToUpload;
    });

    this.resetComponent.subscribe(() => {
      this.documentService.readySubject.next(false);

      if (this.documentService.typeExistsAndHasSelection(this.taxDocumentTypes)) {
        this.taxDocumentTypes.forEach(type => type.selected = false);
      } else if (this.documentService.typeExistsAndHasSelection(this.nontaxableDocumentTypes)) {
        this.nontaxableDocumentTypes.forEach(type => type.selected = false);
      } else if (this.documentService.typeExistsAndHasSelection(this.supplementalDocumentTypes)) {
        this.supplementalDocumentTypes.forEach(type => type.selected = false);
      }

      this.resetTypes();
    });
  }

  public updateDisplay() {
    this.updateCounts();
    if (this.documentService.typeExistsAndHasSelection(this.taxDocumentTypes)) {
      this.disableTax = false;
      this.disableNontaxable = true;
      this.disableSupplemental = true;
    } else if (this.documentService.typeExistsAndHasSelection(this.nontaxableDocumentTypes)) {
      this.disableTax = true;
      this.disableNontaxable = false;
      this.disableSupplemental = true;
    } else if (this.documentService.typeExistsAndHasSelection(this.supplementalDocumentTypes)) {
      this.disableTax = true;
      this.disableNontaxable = true;
      this.disableSupplemental = false;

      this.supplementalDocumentTypes.forEach(x => x.disabled = true);
      this.supplementalDocumentTypes.find(x => x.selected).disabled = false;
    } else {
      this.resetTypes();
    }
  }

  private updateCounts() {
    if (this.taxDocumentTypes) {
      this.taxCount = this.taxDocumentTypes.filter(x => x.selected).length;
    }
    if (this.nontaxableDocumentTypes) {
      this.nontaxableCount = this.nontaxableDocumentTypes.filter(x => x.selected).length;
    }
    if (this.supplementalDocumentTypes) {
      this.supplementalCount = this.supplementalDocumentTypes.filter(x => x.selected).length;
    }
  }

  public setUploadReady() {
    this.documentService.readySubject.next(!this.readyToUpload);
  }

  public formatTaxTypes() {
    let typeCount = 0;
    const titles = this.taxDocumentTypes.map(type => {
      if (type.selected && typeCount < 3) {
        typeCount++;
        return type.title;
      }
    });
    if (this.taxCount > 3) {
      titles.push(this.taxCount - 3 + ' more');
    }
    return this.andPipe.transform(titles);
  }

  public formatNontaxableTypes() {
    let typeCount = 0;
    const titles = this.nontaxableDocumentTypes.map(type => {
      if (type.selected && typeCount < 3) {
        typeCount++;
        return type.title;
      }
    });
    if (this.nontaxableCount > 3) {
      titles.push(this.nontaxableCount - 3 + ' more');
    }
    return this.andPipe.transform(titles);
  }

  public formatSupplementalTypes() {
    return this.supplementalDocumentTypes.filter(x => x.selected)[0].title;
  }

  private resetTypes() {
    this.disableTax = false;
    this.disableNontaxable = false;
    this.disableSupplemental = false;

    if (this.documentService.typeExists(this.supplementalDocumentTypes)) {
      this.supplementalDocumentTypes.forEach(x => x.disabled = false);
    }
  }

  public viewableTaxDocumentTypes() {
    if (this.isViewingAll) {
      return this.taxDocumentTypes;
    }

    return this.taxDocumentTypes.filter(x => x.isSuggested);
  }

  public viewAll() {
    this.isViewingAll = true;
  }
}
