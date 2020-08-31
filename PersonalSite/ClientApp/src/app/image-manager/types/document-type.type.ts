import { DocumentTypeId } from '../enums';

export interface DocumentType {
  title: string;
  typeInd: DocumentTypeId;
  selected?: boolean;
  disabled?: boolean;
}
