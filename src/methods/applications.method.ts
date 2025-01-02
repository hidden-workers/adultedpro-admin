import { UserApplication, Job } from '../interfaces';
import { UserApplicationStatus } from '../utils/enums';

interface fetchedApplications {
  branchDetails: { name: ''; email: ''; _id: '' };
  candidateDetails: {
    _id: '';
    name: '';
    email: '';
    programDetails: { name: ''; _id: '' };
  };
  createdAt: '';
  jobDetails: { _id: ''; branch_id: ''; title: '' };
  status: '';
  _id: '';
}

export const transformApplicationDataToFirebase = (
  data: fetchedApplications,
): UserApplication => ({
  id: data?._id,
  applicant: {
    id: data?.candidateDetails?._id,
    name: data?.candidateDetails?.name,
    email: data?.candidateDetails?.email,
    programDetails: {
      id: data?.candidateDetails?.programDetails?._id,
      name: data?.candidateDetails?.programDetails?.name,
    },
  },
  applicantEmail: data?.candidateDetails?.email || '',
  applicantId: data?.candidateDetails._id,
  dateCreated: data?.createdAt,
  employer: data?.branchDetails,
  employerEmail: data?.branchDetails[0]?.email || '',
  employerId: data?.jobDetails.branch_id,
  job: {
    id: data?.jobDetails?._id,
    title: data?.jobDetails?.title,
  } as Job,
  jobId: data?.jobDetails?._id,
  status: data?.status as UserApplicationStatus,
});

interface StudentAppliedJob {
  _id: string;
  firebaseId: string;
  firebaseUserId?: string;
  name?: string;
  address?: string;
  address_line1?: string;
  address_line2?: string;
  applicantEmails?: string[];
  apply_date?: string;
  branch_bio?: string;
  branch_email?: string;
  branch_id?: {
    _id: string;
    firebaseId: string;
    firebaseUserId: string;
    name: string;
    address: string;
    [key: string]: any;
  };
  branch_location?: string;
  branch_name?: string;
  branch_no?: string;
  city?: string;
  contact_bio?: string;
  contact_email?: string;
  contact_name?: string;
  contact_no?: string;
  country?: string;
  createdAt?: string;
  date_created?: string;
  date_posted?: string;
  date_updated?: string;
  days?: string[];
  days_description?: string[];
  expire_date?: string;
  hours?: string;
  hours_description?: string;
  is_active?: boolean;
  is_remote?: boolean;
  is_test?: boolean;
  jobLink?: string;
  job_description?: string;
  language?: string;
  no_of_positions?: number;
  pay?: string;
  payPeriod?: string;
  pay_description?: string;
  photo_url?: string;
  posted_date?: string;
  program?: string[];
  rank_index?: number;
  savedJobEmails?: string[];
  search_keywords?: string;
  shift?: string[];
  shift_description?: string[];
  skippedJobEmails?: string[];
  state?: string;
  title?: string;
  updatedAt?: string;
  zip_code?: string;
  __v?: number;
  [key: string]: any;
}

interface StudentJobApplication {
  candidate_id: {
    _id: string;
    firebaseId: string;
    name: string;
    address: string;
    address_line1: string;
    [key: string]: any;
  };
  createdAt: string;
  firebaseId: string;
  id: string;
  is_test: boolean;
  job_id: StudentAppliedJob;
  job_snapshot: {
    _id: string;
    job_description: string;
    hours_description: string;
    hours: string;
    firebaseId: string;
    [key: string]: any;
  };
  status: string;
  updatedAt: string;
  __v: number;
}

export const transformStudentApplicationDataToFirebase = (
  data: StudentJobApplication,
): UserApplication => ({
  id: data?.id,
  applicant: {
    id: data?.candidate_id?._id,
    name: data?.candidate_id?.name,
    email: data?.candidate_id?.email,
  },
  applicantEmail: data?.candidate_id?.email || '',
  applicantId: data?.candidate_id._id,
  dateCreated: data?.createdAt,
  employer: data?.job_id?.branch_name,
  employerEmail: data?.job_id?.branch_email || '',
  employerId: data?.job_id?.branch_id?._id,
  job: {
    id: data?.job_id?._id,
    title: data?.job_id?.title,
  } as Job,
  jobId: data?.job_id?._id,
  status: data?.status as UserApplicationStatus,
});

interface frontendFetchedData {
  id: string;
  applicant: {
    id: string;
    name: string;
    email: string;
  };
  applicantEmail: string;
  applicantId: string;
  dateCreated: any;
  employer: string;
  employerEmail: string;
  employerId: string;
  job: {
    id: string;
    title: string;
  };
  jobId: string;
  status: string;
}

export const transformUserApplicationDataToMongo = (
  data: frontendFetchedData,
) => ({
  _id: data?.id,
  candidate_id: data.applicantId,
  job_id: data.jobId,
  status: data.status,
});
