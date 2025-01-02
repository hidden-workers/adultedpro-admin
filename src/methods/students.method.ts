import {
  User,
  Education,
  Interests,
  UserApplication,
  JoinedCompany,
} from '../interfaces';

interface EmployerNote {
  createdAt: string; // ISO string format
  employerId: string | null; // Use null if no employer ID is provided
  note: string;
}

interface FetchedStudentData {
  _id?: string;
  id: string;
  firebaseId: string;
  name: string;
  email: string;
  address: string;
  address_line1: string;
  address_line2: string;
  aiProfile: {
    certificatesList: string[];
    doYouHaveDriverLicense: string;
    educationsList: Education[];
    experienceNotes: string;
    general_certificates: {
      is_first_aid_certified: boolean;
      do_you_have_livescan: boolean;
    };
    interestsList: Interests[];
    needSpecialAccommodations: string;
    otherSkills: string[];
  };
  isLegalTermsAccepted: boolean;
  applicationsCount: number;
  approved_by_admin: boolean;
  createdAt: string;
  updatedAt: string;
  is_test: boolean;
  jobApplications: UserApplication[];
  photo_url: string;
  tag_line: string;
  role: string[];
  program_id: string | null;
  program: {
    approved: boolean;
    name: string;
    question_type: string;
    _id: string;
  };
  institute_id: string;
  employerNotes: EmployerNote[];
  pdfUrl: string;
  last_activity: string;
  last_job_verfication_asked_date: string;
  phone_no: string;
  joinedCompany: JoinedCompany;
}

const transformStudentData = (fetchedData: FetchedStudentData): User => {
  return {
    id: fetchedData?.id || fetchedData?._id,
    firebaseId: fetchedData?.firebaseId,
    name: fetchedData?.name,
    email: fetchedData?.email,
    addressLine1: fetchedData?.address_line1 || '',
    addressLine2: fetchedData?.address_line2 || '',
    aiProfile: {
      certificatesList: fetchedData?.aiProfile?.certificatesList || [],
      educationsList: fetchedData?.aiProfile?.educationsList || [],
      experienceNotes: fetchedData?.aiProfile?.experienceNotes || '',
      interestsList: fetchedData?.aiProfile?.interestsList || [],
      doYouHaveDriverLicense:
        fetchedData?.aiProfile?.doYouHaveDriverLicense || '',
      doYouHaveLivescan:
        fetchedData?.aiProfile?.general_certificates?.do_you_have_livescan ||
        false,
      isFirstAidCertified:
        fetchedData?.aiProfile?.general_certificates?.is_first_aid_certified ||
        false,
      needSpecialAccommodations:
        fetchedData?.aiProfile?.needSpecialAccommodations || '',
      otherSkills: fetchedData?.aiProfile?.otherSkills,
    },
    isLegalTermsAccepted: fetchedData?.isLegalTermsAccepted,
    applicationsCount: fetchedData?.applicationsCount,
    approvedByAdmin: fetchedData?.approved_by_admin,
    dateCreated: new Date(fetchedData?.createdAt).toISOString(),
    dateUpdated: new Date(fetchedData?.updatedAt).toISOString(),
    pdfUrl: fetchedData?.pdfUrl,
    photoUrl: fetchedData?.photo_url,
    program: {
      id: fetchedData?.program_id,
      name: fetchedData?.program?.name,
      approved: fetchedData?.program?.approved,
      questionType: fetchedData?.program?.question_type,
    },
    role: fetchedData?.role,
    tagLine: fetchedData?.tag_line || 'No tag line',
    lastActivity: fetchedData?.last_activity,
    joinedCompany: fetchedData?.joinedCompany,
    jobApplications: fetchedData?.jobApplications,
  };
};

export default transformStudentData;
