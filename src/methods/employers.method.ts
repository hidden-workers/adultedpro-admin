import { Employer } from '../interfaces';

export interface fetchedEmployers {
  address: string;
  address_line1: string;
  address_line2: string;
  alumni_links: string[];
  awards_and_accolades: string;
  banner_image: string;
  benefits_and_perks: string[];
  bio: string;
  book_mark_students: string[];
  book_mark_user_applications: string[];
  branch_location: string;
  city: string;
  company_size: string;
  contact_bio: string;
  contact_email: string;
  contact_name: string;
  contact_number: string;
  country: string;
  createdAt: string;
  culture_and_environment: string;
  culture_media: [];
  description: string;
  email: string;
  fcm_token: string;
  firebaseId: string;
  firebaseUserId: string;
  id: string;
  _id?: string;
  is_head_quarter: string;
  is_test: string;
  media: string[];
  mission: string;
  name: string;
  phone_no: string;
  photo_url: string;
  requirments: string;
  reviewed_user: string[];
  reviewed_user_application: string[];
  social_media_links: string[];
  state: string;
  tag_line: string;
  userId: string;
  updatedAt: string;
  zip_code: string;
  jobCount: number;
  applicationsCount: number;
  totalSwipes: number;
}

export const transformEmployertDataToFirebase = (
  data: fetchedEmployers,
): Employer => ({
  id: data?.id ?? data?._id,
  firebaseId: data?.firebaseId,
  addressLine1: data?.address_line1,
  addressLine2: data?.address_line2,
  description: data?.description,
  branchLocation: data?.branch_location,
  city: data?.city,
  contactEmail: data?.contact_email,
  contactName: data?.contact_name,
  contactNumber: data?.contact_number,
  country: data?.country,
  dateCreated: data?.createdAt,
  dateUpdated: data?.updatedAt,
  email: data?.email,
  media: data?.media,
  logo: data?.photo_url,
  name: data?.name,
  requirements: data?.requirments,
  state: data?.state,
  tagLine: data?.tag_line,
  userId: data?.userId,
  zipCode: data?.zip_code,
  contactBio: data?.contact_bio,
  bio: data?.bio,
  bannerImage: data?.banner_image,
  isHeadquarter: data?.is_head_quarter,
  companySize: data?.company_size,
  mission: data?.mission,
  cultureAndEnvironment: data?.culture_and_environment,
  cultureMedia: data?.culture_media,
  benefitsAndPerks: data?.benefits_and_perks,
  awardsAndAccolades: data?.awards_and_accolades,
  alumniLinks: data?.alumni_links,
  socialMediaLinks: data?.social_media_links,

  photoUrl: data?.photo_url,
  bookmarkedUserApplications: data?.book_mark_user_applications,
  reviewedUserApplications: data?.reviewed_user_application,
  bookmarkedStudents: data?.book_mark_students,
  reviewedStudents: data?.reviewed_user,
  isTest: data?.is_test,

  jobCount: data?.jobCount,
  applicationsCount: data?.applicationsCount,
  totalSwipes: data?.totalSwipes,
});

export const transformEmployertDataToMongo = (data: Employer) => ({
  id: data?.id,
  firebaseId: data?.firebaseId,
  address_line1: data?.addressLine1,
  address_line2: data?.addressLine2,
  description: data?.description,
  branch_location: data?.branchLocation,
  city: data?.city,
  contact_email: data?.contactEmail,
  contact_name: data?.contactName,
  contact_number: data?.contactNumber,
  country: data?.country,
  createdAt: data?.dateCreated,
  updatedAt: data?.dateUpdated,
  email: data?.email,
  media: data?.media,
  photo_url: data?.photoUrl,
  name: data?.name,
  requirments: data?.requirements,
  state: data?.state,
  tag_line: data?.tagLine,
  firebaseUserId: data?.userId,
  zip_code: data?.zipCode,
  contact_bio: data?.contactBio,
  bio: data?.bio,
  banner_image: data?.bannerImage,
  is_head_quarter: data?.isHeadquarter,
  company_size: data?.companySize,
  mission: data?.mission,
  culture_and_environment: data?.cultureAndEnvironment,
  culture_media: data?.cultureMedia,
  benefits_and_perks: data?.benefitsAndPerks,
  awards_and_accolades: data?.awardsAndAccolades,
  alumni_links: data?.alumniLinks,
  social_media_links: data?.socialMediaLinks,

  book_mark_user_applications: data?.bookmarkedUserApplications,
  reviewed_user_application: data?.reviewedUserApplications,
  book_mark_students: data?.bookmarkedStudents,
  reviewed_user: data?.reviewedStudents,
  is_test: data?.isTest,

  jobCount: data?.jobCount,
  applicationsCount: data?.applicationsCount,
  totalSwipes: data?.totalSwipes,
});

interface EmployerData {
  name: string;
  contactName: string;
  email: string;
  branchLocation: string;
  addressLine1: string;
  city: string;
  state: string;
  tagLine?: string;
  contactEmail?: string;
  contactNumber?: string;
  description?: string;
  addressLine2?: string;
  zipCode?: string;
  country?: string;
}
export const transformEmployerRegisterData = (data: EmployerData) => ({
  name: data?.name,
  contact_name: data?.contactName,
  email: data?.email,
  branch_location: data?.branchLocation,
  address_line1: data?.addressLine1,
  city: data?.city,
  state: data?.state,
  tag_line: data?.tagLine,
  contact_email: data?.contactEmail,
  contact_number: data?.contactNumber,
  description: data?.description,
  address_line2: data?.addressLine2,
  zip_code: data?.zipCode,
  country: data?.country,
});
