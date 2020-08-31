import { DocumentSettings } from './document-settings.type';
import { TaxDocumentType } from './tax-document-type.type';
import { DocumentType } from './document-type.type';

export interface Document {
  settings: DocumentSettings;
  taxDocumentTypes: Array<TaxDocumentType>;
  nontaxableDocumentTypes: Array<DocumentType>;
  supplementalDocumentTypes: Array<DocumentType>;
}
