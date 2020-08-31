import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Document } from '../types';

@Injectable({ providedIn: 'root' })
export class DocumentHttpService {
  constructor(private httpClient: HttpClient) { }

  private httpParams(instKey?: string, aidAppId?: string) {
    let params = new HttpParams();
    if (instKey) {
      params = params.set('instKey', instKey);
    }
    if (aidAppId) {
      params = params.set('aidAppId', aidAppId);
    }

    return params;
  }

  public loadTaxDocumentInfo(instKey: string, aidAppId: string): Observable<Document> {
    const apiUrl = '';

    return this.httpClient.get<Document>(apiUrl, { params: this.httpParams(instKey, aidAppId) });
  }

  public uploadPdf(instKey: string, aidAppId: string, taxDocumentTypes: Array<number>, nontaxableDocumentTypes: Array<number>, supplementalDocumentType: number, files: Array<any>): Observable<any> {
    const formData: FormData = this.buildFormData(taxDocumentTypes, nontaxableDocumentTypes, supplementalDocumentType, files);

    const apiUrl = 'documentUploadPdf';

    const req = new HttpRequest('POST', apiUrl, formData,
      { params: this.httpParams(instKey, aidAppId), reportProgress: true }
    );

    return this.httpClient.request(req);
  }

  public uploadImages(instKey: string, aidAppId: string, taxDocumentTypes: Array<number>, nontaxableDocumentTypes: Array<number>, supplementalDocumentType: number, files: Array<any>): Observable<any> {
    const formData: FormData = this.buildFormData(taxDocumentTypes, nontaxableDocumentTypes, supplementalDocumentType, files);

    const apiUrl = 'documentUploadImages';

    const req = new HttpRequest('POST', apiUrl, formData,
      { params: this.httpParams(instKey, aidAppId), reportProgress: true }
    );

    return this.httpClient.request(req);
  }

  public unlockedPasswordProtectedPdf(instKey: string, aidAppId: string, uploadFileId: number, password: string, supplementalDocumentType: number): Observable<any> {
    const apiUrl = 'documentUploadUnlockPasswordPdf';

    const params = this.httpParams(instKey, aidAppId)
      .append('uploadFileId', uploadFileId.toString())
      .append('password', password)
      .append('supplementalDocumentType', supplementalDocumentType.toString());

    return this.httpClient.post<any>(apiUrl, null, { params });
  }

  private buildFormData(taxDocumentTypes: Array<number>, nontaxableDocumentTypes: Array<number>, supplementalDocumentType: number, files: Array<any>) {
    const formData: FormData = new FormData();

    taxDocumentTypes.forEach(type => {
      formData.append('taxDocumentType', type.toString());
    });

    nontaxableDocumentTypes.forEach(type => {
      formData.append('nontaxableDocumentType', type.toString());
    });

    if (supplementalDocumentType) {
      formData.append('supplementalDocumentType', supplementalDocumentType.toString());
    }

    files.forEach(file => {
      formData.append(file.name, file, file.name);
    });

    return formData;
  }

  public getMockModel(): Document {
    return {
      settings: {
        aidAppId: 48331,
        legacyApplicationId: 1703917,
        applicantFirstName: 'Adam',
        applicantLastName: 'Allwaive',
        hasCoApplicant: true,
        coApplicantFirstName: 'Alice',
        coApplicantLastName: 'Allwaive',
        applicantSSN: '***-**-9369',
        coApplicantSSN: '***-**-9865',
        addressLine1: '1234 Main St',
        addressLine2: null,
        city: 'Lincoln',
        state: 'TN',
        zipcode: 68516
      },
      taxDocumentTypes: [
        {
          isSuggested: false,
          title: 'Form 1040/1040A/1040EZ',
          typeInd: 1
        },
        {
          isSuggested: false,
          title: 'Dependent Statement',
          typeInd: 18
        },
        {
          isSuggested: false,
          title: 'Schedules 1 - 5',
          typeInd: 17
        },
        {
          isSuggested: false,
          title: 'W-2',
          typeInd: 2
        },
        {
          isSuggested: false,
          title: 'Schedule C',
          typeInd: 3
        },
        {
          isSuggested: false,
          title: 'Schedule E',
          typeInd: 4
        },
        {
          isSuggested: false,
          title: 'Schedule F',
          typeInd: 5
        },
        {
          isSuggested: false,
          title: 'Form 4562',
          typeInd: 6
        },
        {
          isSuggested: false,
          title: 'Form 1065',
          typeInd: 7
        },
        {
          isSuggested: false,
          title: 'Schedule K-1 (1065)',
          typeInd: 8
        },
        {
          isSuggested: false,
          title: 'Form 1120S',
          typeInd: 9
        },
        {
          isSuggested: false,
          title: 'Schedule K-1 (1120S)',
          typeInd: 10
        },
        {
          isSuggested: false,
          title: 'Form 8825',
          typeInd: 11
        },
        {
          isSuggested: false,
          title: 'Form 1041',
          typeInd: 12
        },
        {
          isSuggested: false,
          title: 'Other',
          typeInd: 13
        }
      ],
      supplementalDocumentTypes: [
        {
          title: 'Essay - Andy, Angie (TR Group)',
          typeInd: 10130
        },
        {
          title: 'JM App Req Yes, Link No (TR Group)',
          typeInd: 10128
        },
        {
          title: 'JM Stud Req Yes, Link Yes - Andy, Angie (TR Group)',
          typeInd: 10127
        },
        {
          title: 'Report Card - Andy, Angie (TR Group)',
          typeInd: 10129
        },
        {
          title: 'Test Sharing to Inst (TR Group)',
          typeInd: 10132
        }
      ],
      nontaxableDocumentTypes: [
        {
          title: 'Child Support',
          typeInd: 19
        },
        {
          title: 'Housing Allowance',
          typeInd: 25
        },
        {
          title: 'SNAP',
          typeInd: 22
        },
        {
          title: 'Social Security',
          typeInd: 16
        },
        {
          title: 'TANF',
          typeInd: 20
        },
        {
          title: 'Tuition Support',
          typeInd: 23
        },
        {
          title: 'Welfare',
          typeInd: 21
        },
        {
          title: 'Workers\' Compensation',
          typeInd: 24
        },
        {
          title: 'Other Nontaxable',
          typeInd: 14
        }
      ]
    };
  }
}
