import { Job } from '../interfaces';

interface fetchedJobs {
  _id?: '';
  id?: '';
  job_description: '';
  hours_description: '';
  hours: '';
  firebaseId: '';
  address_line1: '';
  address_line2: '';
  rank_index: number;
  is_active: boolean;
  is_remote: boolean;
  language: '';
  program: [];
  savedJobEmails: [];
  applicantEmails: [];
  skippedJobEmails: [];
  program_id: '';
  branch_id: '';
  city: '';
  state: '';
  title: '';
  zip_code: '';
  _geoloc: { lng: number; lat: number };
  branch_location: '';
  contact_bio: '';
  contact_email: '';
  contact_no: '';
  contact_name: '';
  country: '';
  posted_date: '';
  branch_bio: '';
  branch_no: '';
  branch_name: '';
  branch_email: '';
  expire_date: '';
  no_of_positions: number;
  pay: '';
  pay_description: '';
  payPeriod: '';
  photo_url: '';
  shift: [];
  shift_description: [];
  days_description: [];
  days: [];
  date_posted: '';
  date_updated: '';
  date_created: '';
  apply_date: '';
  search_keywords: '';
  is_test: boolean;
  jobApplications: [];
  jobLink?: '';
}
export const transformJobDataToMongo = (data: Job): any => ({
  job_description: data?.description,
  hours_description: data?.hoursDescription,
  hours: data?.hours,
  address_line1: data?.addressLine1,
  address_line2: data?.addressLine2,
  rank_index: data?.rankIndex,
  is_active: data?.isActive,
  is_remote: data?.isRemote,
  language: data?.language,
  program: data?.program,
  city: data?.city,
  state: data?.state,
  title: data?.title,
  zip_code: data?.zipCode,
  _geoloc: { lng: data?._geoloc?.lng, lat: data?._geoloc?.lat },
  branch_location: data?.branchLocation,
  branch_name: data?.employerName,
  branch_id: data?.employerId,
  branch_email: data?.employerEmail,
  branch_no: data?.employerNumber,
  branch_bio: data?.employerBio,

  contact_bio: data?.contactBio,
  contact_email: data?.contactEmail,
  contact_no: data?.contactNumber,
  contact_name: data?.contactName,
  country: data?.country,
  date_posted: data?.dateCreated,
  date_updated: data?.dateUpdated,
  date_created: data?.datePosted,
  posted_date: data?.datePosted,
  expire_date: data?.expireDate,
  no_of_positions: data?.noOfPositions,
  pay: data?.pay,
  pay_description: data?.payDescription,
  payPeriod: data?.payPeriod,
  photo_url: data?.photoUrl ? data?.photoUrl : data?.employerPhotoUrl,
  shift: data?.shift,
  shift_description: data?.shiftDescription,
  days_description: data?.daysDescription,
  days: data?.days,
  apply_date: data?.applyDate,
  search_keywords: data?.searchKeywords,
  is_test: data?.isTest,
  jobApplications: data?.jobApplications,
  jobLink: data?.jobLink,
  _id: data?.id,
});

export const transformJobDataToFirebase = (data: fetchedJobs[]): Job[] => {
  return data.map((job) => ({
    _geoloc: job?._geoloc,
    addressLine1: job?.address_line1,
    addressLine2: job?.address_line2,
    city: job?.city,

    contactBio: job?.contact_bio,
    contactEmail: job?.contact_email,
    contactName: job?.contact_name,

    country: job?.country,

    dateCreated: job?.date_created,
    datePosted: job?.date_posted,
    dateUpdated: job?.date_updated,

    days: job?.days,
    daysDescription: job?.days_description,

    description: job?.job_description,

    employerBio: job?.branch_bio,
    employerEmail: job?.branch_email,
    employerName: job?.branch_name,
    employerNumber: job?.branch_no,

    hours: job?.hours,
    hoursDescription: job?.hours_description,

    id: job?._id ? job?._id : job?.id,
    language: job?.language,
    pay: job?.pay,
    payDescription: job?.pay_description,
    payPeriod: job?.payPeriod,
    program: job?.program,
    rankIndex: job?.rank_index,
    searchKeywords: job?.search_keywords,
    shift: job?.shift,
    shiftDescription: job?.shift_description,
    state: job?.state,
    title: job?.title,
    zipCode: job?.zip_code,

    // newly added
    expireDate: job?.expire_date,
    applyDate: job?.apply_date,
    noOfPositions: job?.no_of_positions,
    employerId: job?.branch_id,
    employerPhotoUrl: job?.photo_url,
    branchLocation: job?.branch_location,
    contactNumber: job?.contact_no,
    isRemote: job?.is_remote,
    photoUrl: job?.photo_url,
    isActive: job?.is_active,
    isTest: job?.is_test,
    jobApplications: job?.jobApplications,
    jobLink: job?.jobLink,
  }));
};

export const transformSingleJobToFirebase = (job: fetchedJobs): Job => {
  return {
    _geoloc: job?._geoloc,
    addressLine1: job?.address_line1,
    addressLine2: job?.address_line2,
    city: job?.city,

    contactBio: job?.contact_bio,
    contactEmail: job?.contact_email,
    contactName: job?.contact_name,

    country: job?.country,

    dateCreated: job?.date_created,
    datePosted: job?.date_posted,
    dateUpdated: job?.date_updated,

    days: job?.days,
    daysDescription: job?.days_description,

    description: job?.job_description,

    employerBio: job?.branch_bio,
    employerEmail: job?.branch_email,
    employerName: job?.branch_name,
    employerNumber: job?.branch_no,

    hours: job?.hours,
    hoursDescription: job?.hours_description,

    id: job?._id ? job?._id : job?.id,
    language: job?.language,
    pay: job?.pay,
    payDescription: job?.pay_description,
    payPeriod: job?.payPeriod,
    program: job?.program,
    rankIndex: job?.rank_index,
    searchKeywords: job?.search_keywords,
    shift: job?.shift,
    shiftDescription: job?.shift_description,
    state: job?.state,
    title: job?.title,
    zipCode: job?.zip_code,

    // newly added
    expireDate: job?.expire_date,
    applyDate: job?.apply_date,
    noOfPositions: job?.no_of_positions,
    employerId: job?.branch_id,
    employerPhotoUrl: job?.photo_url,
    branchLocation: job?.branch_location,
    contactNumber: job?.contact_no,
    isRemote: job?.is_remote,
    photoUrl: job?.photo_url,
    isActive: job?.is_active,
    isTest: job?.is_test,
    jobApplications: job?.jobApplications,
    jobLink: job?.jobLink,
  };
};
