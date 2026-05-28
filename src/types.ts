export type Language = 'MAR' | 'HIN' | 'ENG';

export type UserCategory = 'Student' | 'Farmer' | 'Job Seeker' | 'General';

export interface UserProfile {
  fullName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  aadhaarNumber: string;
  panNumber: string;
  category: UserCategory;
  education: string;
  address: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  language: Language;
  avatarUrl?: string;
  isRegistered: boolean;
}

export type DocumentType =
  | 'Aadhaar Card'
  | 'PAN Card'
  | 'Passport Photo'
  | 'Signature'
  | '10th Marksheet'
  | '12th Marksheet'
  | 'Caste Certificate'
  | 'Income Certificate'
  | 'Domicile Certificate'
  | 'School Leaving Certificate'
  | 'Non Creamy Layer'
  | 'Bank Passbook'
  | '7/12'
  | 'Custom Upload';

export type DocumentStatus = 'Uploaded' | 'Pending' | 'Rejected';

export interface DocumentVaultItem {
  id: string;
  name: DocumentType;
  customName?: string;
  url: string; // base64 or file mock
  fileName: string;
  uploadDate: string;
  status: DocumentStatus;
  rejectReason?: string;
}

export type ApplicationStatus =
  | 'Requested'
  | 'Processing'
  | 'OTP Needed'
  | 'Photo Needed'
  | 'Preview Approval'
  | 'Submitted'
  | 'Rejected';

export interface Form {
  id: string;
  name: string; // Marathi/English combined
  nameEn: string;
  nameMr: string;
  nameHi: string;
  category: 'सरकारी नोकरी' | 'शेतकरी योजना' | 'सरकारी सेवा' | 'शिक्षण सेवा' | 'इतर सेवा';
  organization: string;
  totalPosts: number;
  lastDate: string;
  ageLimit: string;
  qualification: string;
  fees: number;
  serviceFee: number;
  requiredDocuments: DocumentType[];
  eligibility: string;
  websiteUrl: string;
  importantLinks: { label: string; url: string }[];
  isEnabled: boolean;
}

export interface Application {
  id: string;
  formId: string;
  formName: string;
  appliedDate: string;
  status: ApplicationStatus;
  progress: number; // 0 - 100
  paymentStatus: 'Paid' | 'Pending';
  paymentScreenshot?: string;
  govtFee: number;
  serviceFree: number;
  totalFee: number;
  otpLogs?: string[];
  captchaBase64?: string;
  livePhotoRequested?: boolean;
  livePhoto?: string;
  previewPdfUrl?: string;
  previewApproved?: boolean;
  submissionReceiptPdf?: string;
  logs: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  titleMr: string;
  titleHi: string;
  message: string;
  messageMr: string;
  messageHi: string;
  type: 'info' | 'otp' | 'photo' | 'alert' | 'success' | 'new_form';
  createdAt: string;
  read: boolean;
  applicationId?: string;
}

export interface PaymentTransaction {
  id: string;
  applicationId: string;
  formName: string;
  amount: number;
  upiId: string;
  status: 'Pending' | 'Paid' | 'Failed';
  screenshotUrl?: string;
  date: string;
}

// Automation Queue Session
export interface AutomationSession {
  id: string; // same as Application ID
  applicationId: string;
  formName: string;
  currentStep: string;
  status: 'Idle' | 'Running' | 'Paused_Captcha' | 'Paused_OTP' | 'Paused_LivePhoto' | 'Paused_PreviewApproval' | 'Completed' | 'Failed';
  logs: string[];
  captchaImage?: string;
  otpSentToMobile?: string;
  otpEntered?: string;
  livePhotoReceived?: string;
  previewApprovedByCustomer?: boolean;
}
