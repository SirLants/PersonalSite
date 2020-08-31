export interface DocumentSettings {
  aidAppId: number;
  legacyApplicationId: number;
  applicantFirstName: string;
  applicantLastName: string;
  hasCoApplicant: boolean;
  coApplicantFirstName: string;
  coApplicantLastName: string;
  applicantSSN: string;
  coApplicantSSN: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: number;
}
