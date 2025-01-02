import { User, Partner } from '../interfaces';

interface FirebaseUserData {
  name: '';
  phone: '';
  bio: '';
  photoUrl: '';
  partnerId?: '';
}

export const transformUserDataToMongo = (data: FirebaseUserData) => ({
  name: data.name,
  phone_no: data.phone,
  photo_url: data.photoUrl,
  bio: data.bio,
  institute_id: data.partnerId,
});

export const transformCandidateDataToMongo = (data: User) => ({
  name: data.name,
  email: data.email?.toLowerCase() || '', // Convert email to lowercase
  address: data.addressLine1 || '',
  address_line1: data.addressLine1 || '',
  address_line2: data.addressLine2 || '',
  program_id: data.program_id || null, // Reference to program
  institute_id: data.partnerId || null, // Reference to institution
  institution_join_date: data.dateCreated || null,
  last_activity: data.lastActivity || null,
  joinedCompany: data.joinedCompany || {},
  phone_no: data.phone || '',
  tag_line: data.tagLine || '',
  photo_url: data.photoUrl || '',
  is_legal_terms_accepted: data.isLegalTermsAccepted || false,
  is_test: data.isTest || false,
  approved_by_admin: data.approvedByAdmin || false,
  role: data.role || [],
  aiProfile: data.aiProfile || {},
  employerNotes: (data.employerNotes || []).map((note) => ({
    createdAt: note.dateCreated || new Date(),
    employerId: note.employerId || null,
    note: note.note || '',
  })),
});
export interface MongoUserData {
  firebaseId: string;
  name: string;
  address: string;
  address_line1: string;
  address_line2: string;
  email: string;
  institute_id: {
    _id: string;
    firebaseId: string;
    name: string;
    country: string;
    city: string;
    address: string;
    address_line1: string;
    address_line2: string;
    zip: string;
    state: string;
    website: string;
    tag_line: string;
    logo_url: string;
    banner_color: string;
    mission: string;
    carousel_images: string[];
    email: string;
    admin_email: string;
    phone_no: string;
    photo_url: string;
    approved: boolean;
    program: string[];
    fcm_token: string;
    latitude: string;
    longitude: string;
    ipedsid: string;
    is_test: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  last_activity: string | null;
  photo_url: string;
  is_legal_terms_accepted: boolean;
  is_test: boolean;
  fcm_token: string;
  approved_by_admin: boolean;
  available_AiTagline_Credits: number;
  role: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
  phone_no: string;
  tag_line: string;
  bio: string;
}

export const transformUserdataToFirebase = (data: MongoUserData) => ({
  id: data?.id,
  firebaseId: data?.firebaseId,
  name: data?.name,
  email: data?.email,
  phone: data?.phone_no,
  bio: data?.bio,
  mongoId: data?.id,
  photoUrl: data?.photo_url,
  tagLine: data?.tag_line,
  role: data?.role,
  partnerId: data?.institute_id?._id,
  partner: {
    id: data?.institute_id?._id,
    name: data?.institute_id?.name,
    email: data?.institute_id?.email,
    city: data?.institute_id?.city,
    state: data?.institute_id?.state,
    addressLine1: data?.institute_id?.address_line1,
    addressLine2: data?.institute_id?.address_line2,
    address: data?.institute_id?.address,
    carouselImages: data?.institute_id?.carousel_images,
    photoUrl: data?.institute_id?.photo_url,
    mission: data?.institute_id?.mission,
    website: data?.institute_id?.website,
    adminEmail: data?.institute_id?.admin_email,
    zip: data?.institute_id?.zip,
    dateCreated: data?.institute_id?.createdAt,
    dateUpdated: data?.institute_id?.updatedAt,
    tagLine: data?.institute_id?.tag_line,
    bannerColor: data?.institute_id?.banner_color,
    isTest: data?.institute_id?.is_test,
  } as Partner,
  approvedByAdmin: data?.approved_by_admin,
  dateCreated: data?.createdAt,
  dateUpdated: data?.updatedAt,
  isTest: data?.is_test,
  addressLine1: data?.institute_id?.address_line1,
  addressLine2: data?.institute_id?.address_line2,
  isLegalTermsAccepted: data?.is_legal_terms_accepted,
});
