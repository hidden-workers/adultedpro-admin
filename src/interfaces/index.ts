import {
  BoardMessageType,
  ChatTypes,
  EventStatus,
  EventTypes,
  UserApplicationStatus,
} from '../utils/enums';
export interface Program {
  approved: boolean;
  name: string;
  questionType: string;
  id?: string;
}

export interface Education {
  educationLevelKey: string;
  label?: string;
}
export interface Interests {
  interestKey?: string;
  label?: string;
  traits?: string;
}
export interface RepeatChat {
  id: string;
  participantsDetails?: any[];
  participants?: string[];
  messages: any[];
  [key: string]: any; // For other potential fields in the chat
}
interface AiProfile {
  educationsList?: Education[];
  experienceNotes?: string;
  interestsList?: Interests[];
  certificatesList?: string[];
  doYouHaveDriverLicense?: string;
  doYouHaveLivescan?: boolean;
  isFirstAidCertified?: boolean;
  needSpecialAccommodations: string;
  otherSkills: string[];
}
export interface JoinedCompany {
  dateOfHire?: string;
  employerName?: string;
  pay?: string;
  positionHired?: string;
}
export interface User {
  id?: string;
  _id?: string;
  firebaseId?: string;
  jobApplications?: UserApplication[];
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  mongoId?: string; //will change this to id later and remove the firebaseid
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  partnerId?: string;
  partner?: Partner;
  photoUrl: string;
  addressLine1: string;
  addressLine2: string;
  program?: Program | string;
  tagLine: string;
  interestedIn?: string;
  role: string[];
  isLegalTermsAccepted: boolean;
  aiProfile?: AiProfile;
  visitedBy?: string[]; // emails of employers who visisted this user

  lastSignedIn?: any;
  is_subscribed_user?: boolean;
  skills?: string[];
  approvedByAdmin?: boolean;
  rejectedByAdmin?: boolean;
  employerNotes?: { employerId: string; note: string; dateCreated: any }[];

  dateCreated?: any;
  dateUpdated?: any;
  lastActivity?: any;
  joinedCompany?: JoinedCompany;
  isTest?: boolean;
  applicationsCount?: number;
  program_id?: string;
  pdfUrl?: string;
}
export interface Institute {
  program: string[];
  firebaseId: string;
  name: string;
  country: string;
  city: string;
  address: string;
  address_line1: string;
  address_line2: string;
  admin_email: string;
  approved: boolean;
  banner_color: string;
  carousel_images: string[];
  createdAt: string;
  email: string;
  fcm_token: string;
  id: string;
  ipedsid: string;
  is_test: boolean;
  latitute: string;
  logo_url: string;
  longitude: string;
  mission: string;
  phone_no: string;
  photo_url: string;
  state: string;
  tag_line: string;
  updatedAt: string;
  website: string;
  zip: string;
}

export interface Employer {
  id?: string;
  firebaseId?: string;
  addressLine1: string;
  addressLine2: string;
  description: string; // companyDescription
  branchLocation: string;
  city: string;
  contactEmail: string;
  contactName: string;
  contactNumber: string;
  country: string;
  dateCreated: any;
  dateUpdated: any;
  email: string;
  media: string[];
  logo?: string;
  name: string;
  partnerId?: string;
  partner?: Partner;
  requirements: string;
  state: string;
  tagLine: string;
  userId: string;
  zipCode: string;
  contactBio: string;
  bio: string;
  bannerImage: string;
  isHeadquarter?: boolean | string;
  companySize: string;
  mission: string;
  cultureAndEnvironment: string;
  benefitsAndPerks: string | string[];
  awardsAndAccolades: string;
  alumniLinks: string[];
  socialMediaLinks: string[];

  photoUrl?: string; // Replacing Logo with photoUrl
  bookmarkedUserApplications?: string[]; // ids of user applicaitons
  reviewedUserApplications?: string[]; // ids of user applicaitons
  bookmarkedStudents?: string[]; // ids of users/students
  reviewedStudents?: string[]; // ids of users/students
  isTest: boolean | string;
  cultureMedia?: string[];
  jobCount?: number;
  applicationsCount?: number;
  totalSwipes?: number;
}
export interface UserApplication {
  id: string;
  applicant: any;
  applicantEmail: string;
  applicantId: string;
  dateCreated: any; // FirestoreTimestamp
  dateUpdated?: any; // FirestoreTimestamp
  employer: any;
  employerEmail: string;
  employerId: string;
  job: Job;
  jobId: string;
  source?: string;
  status: UserApplicationStatus;
  visitedBy?: string[]; // emails of the employers who visited this userapplication
  employerNotes?: { employerId: string; note: string; dateCreated: any }[];
  programs?: { id: string; name: string };
}
export interface Application {
  id: string;
  name: string;
  jobId: string;
  status: UserApplicationStatus;
}

export interface Chat {
  id?: string;
  jobId: { _id: string; title: string } | string;
  jobTitle?: string;
  chatType?: ChatTypes;
  groupType?: 'GENERAL' | 'CLASS'; // GENERAL, CLASS
  classId?: string;
  lastMessage: string;
  groupName?: string;
  lastMessageTimestamp: any; // convert it into FirestoreTimestamp
  participants: string[];
  participantsDetails?: (Employer | User)[];
  isUserApplication?: boolean;
  role?: string;
  shouldBotStopResponding: boolean;
  isGroup?: boolean;
  dateCreated: any;
  dateUpdated: any;
  user?: any;
  isTest?: boolean;
}
export interface ChatMessage {
  id?: string;
  receiverId: string;
  senderId: string;
  timestamp: any; // convert it into FirestoreTimestamp
  unreadCounts: number;
  userinfo: { displayName: string; photoUrl: string; lastMessage: string };
  senderinfo: { displayName: string; photoUrl: string };
  text?: string;
  user1?: any;
  user2?: any;
  dateCreated: any;
  dateUpdated: any;
  isTest: boolean;
}

export interface Message {
  chatId: string;
  content: string;
  createdAt: string;
  deletedBy: [];
  id: string;
  isDeleted: boolean;
  isEmployerResponse: boolean;
  mediaUrl: string;
  messageType: string;
  readBy: [{ readAt: string; userId: string; _id?: string }];
  senderId: string;
  updatedAt: string;
  isFromBot: boolean;
}
export interface Partner {
  id?: string;
  name: string;
  instituteType?: string;
  email: string;
  city: string;
  state: string;
  addressLine1: string;
  addressLine2: string;
  address?: string;
  carouselImages: string[];
  photoUrl: string;
  mission?: string;
  website: string;
  adminEmail: string;
  userId?: string;
  zip?: string;

  dateCreated?: any;
  dateUpdated?: any;

  tagLine?: string;
  logoText?: string;
  bannerColor?: string;
  bannerText?: string;
  footerLogo?: string;
  jobsView?: boolean;
  textColor?: string;
  programs?: Program[];
  isTest: boolean;
}

interface JobSnapshot {
  addressLine1: string;
  addressLine2: string;
  applicantEmails: string[];
  applyDate: number;
  branchLocation: string;
  city: string;
  contactBio: string;
  contactEmail: string;
  contactName: string;
  contactNumber: string;
  country: string;
  dateCreated: number;
  dateUpdated: number;
  days: string[];
  daysDescription: string;
  description: string;
  employerBio: string;
  employerEmail: string;
  employerId: string;
  employerName: string;
  employerNumber: string;
  expireDate: string;
  hours: string;
  hoursDescription: string;
  id: string;
  isActive: boolean;
  isRemote: boolean;
  language: string;
  lastmodified: { _operation: string; value: number };
  noOfPositions: number;
  objectID: string;
  path: string;
  pay: string;
  payDescription: string;
  payPeriod: string;
  photoUrl: string;
  program: string[];
  rankIndex: number;
  savedJobEmails: string[];
  searchKeywords: string;
  shift: string[];
  shiftDescription: string;
  skippedJobEmails: string[];
  state: string;
  swipeCount: number;
  title: string;
  zipCode: string;
  _geoloc: { lng: number; lat: number };
  _highlightResult?: Record<string, any>;
}

interface JobApplication {
  candidate_id: string;
  createdAt: string;
  firebaseId: string;
  job_id: string;
  job_snapshot: JobSnapshot;
  status: string;
  updatedAt: string;
}

export interface Job {
  _geoloc: { lat: number; lng: number };
  addressLine1: string;
  addressLine2: string;
  city: string;

  contactBio: string;
  contactEmail: string;
  contactName: string;

  country: string;

  dateCreated?: any;
  datePosted?: any; // Firebase Timestamp
  dateUpdated?: any;

  days: string[];
  daysDescription: string[];

  description: string;

  employerBio: string;
  employerEmail: string;
  employerName: string;
  employerNumber: string;

  hours: string;
  hoursDescription: string;

  id?: string;
  language: string;
  pay: string;
  payDescription: string;
  payPeriod: string;
  program?: string[];
  rankIndex: number;
  searchKeywords: string;
  shift: string[];
  shiftDescription: string[];
  state: string;
  title: string;
  zipCode: string;

  // newly added
  expireDate: any;
  applyDate: any;
  noOfPositions: number;
  employerId: string;
  employerPhotoUrl?: string;
  branchLocation: string;
  contactNumber?: string;
  isRemote: boolean;
  photoUrl?: string;
  isActive: boolean;
  applicationsCount?: number;
  isTest: boolean;
  jobApplications?: JobApplication[];
  jobLink?: string;
}
export interface SelectedChat extends Chat {
  otherUser: any;
}
export interface Event {
  // Common Fields
  id?: string;
  title: string;
  creater_role?: string; //mongoose need to remove one either creater_role or createrRole
  rejectedByAdmin?: boolean;
  contactEmail: string;
  contactPhone?: string;
  contactName?: string;
  contactTitle?: string;
  purpose: string;
  dateCreated: any;
  dateUpdated: any;
  createrEmail: string;
  createrName?:string,
  employerId?: string;
  partnerId?: string;
  createrRole: string;
  city: string;
  state: string;
  hostName: string;
  addressLine1: string;
  addressLine2: string;
  eventDate?: any;
  eventFrom?: any;
  eventTo?: any;
  status: EventStatus;
  description?: string;
  zipCode?: string;
  url?: string;
  additionalComments?: string;
  studentIds?: string[];
  employerIds?: string[];
  carouselImages?: string[];
  type: EventTypes;

  eventParticipants?: (Employer | Partner | User)[];
  approvedByAdmin?: boolean;
  noteFromInstitution: string;

  // OffCampus Event Fields
  transportationDetails?: string;
  RSVP?: string;
  emergencyContactPhone?: string;
  agenda?: string;
  dressCode?: string;
  requestedEmployerIds?: string[];
  declinedEmployerIds?: string[];

  // OnCampus Event Fields
  proposedDates?: {
    eventFrom: any;
    eventTo: any;
    eventDate: any;
    proposerRole: any;
    proposedBy: any; // Employer or Institution name
  }[];
  requestedPartnerId?: string;
  requestedPartner?: string | Partner;
  preferredLocationInSchool?: string;
  expectedAttendees?: number;
  requestedProgram?: string | null;
  setupRequirements?: string;
  AVEquipmentNeeds?: string;
  cateringPreferences?: string;
  parkingArrangements?: string;
  isTest?: boolean;
}

export interface EventFile {
  id: string;
  program: string;
  eventType: string;
  class: string;
  days: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  status: string;
  createrRole: string;
  instituteName: string;
}

export interface BoardMessage {
  id?: string;
  title: string;
  description: string;
  to: string;
  toIds?: string[];
  toEmails?: string[];
  type: BoardMessageType;
  partnerId: string;
  dateCreated: any;
  dateUpdated: any;
  isTest: boolean;
}

export interface EmailData {
  to: string;
  template: {
    name: string | 'event-in-progress' | 'event-accepted' | 'event-rejected';
    data: any; // Event|School SignUp Data
  };
  dateCreated: any;
  dateUpdated: any;
  isTest: boolean;
}

export interface Session {
  id?: string;
  name: string;
  dateCreated: any;
  dateUpdated: any;
}

export interface Class {
  id?: string;
  name: string;
  instructorName: string;
  instructorId: string;
  partnerId: string;
  students: string[];
  session: string;
  dateCreated: any;
  dateUpdated: any; // it's any cz date might be Date or Firestore Timestamp object
  isTest: boolean;
}

export interface Todo {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  type: 'normal' | 'pending-teacher' | 'pending-student';
  pendingUserId: string;
  dateCreated?: any;
  dateUpdated?: any;
  dueDateTime?: any;
  isTest: boolean;
}

export interface UnassignedStudent {
  id: string;
  dateCreated?: any;
  dateUpdated?: any;
  partnerId: string;
  partnerName: string;
  students: string[];
  name?: string;
}

export interface LocalStorageAuthUser {
  [x: string]: any;
  id?: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  employerId?: string;
  employerName?: string;
  partnerId?: string;
  partnerName?: string;
  logo?: string;
}

export enum PusherEvents {
  NewMessage = 'new-message',
}
