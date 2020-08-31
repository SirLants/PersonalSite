import { FileError } from '../enums';

export interface SaveResult {
  fileType?: string;
  uploadSuccessful?: boolean;
  uploadError?: FileError;
  fileName?: string;
  passwordProtectedFileId?: number;
  uploadProgress?: number;
}
