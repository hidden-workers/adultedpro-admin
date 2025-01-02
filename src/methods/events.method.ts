import { Event, Partner } from '../interfaces';
import { EventStatus, EventTypes } from '../utils/enums';

interface FetchedEventData {
  additional_comments: string;
  address_line1: string;
  address_line2: string;
  agenda: string;
  approved_by_admin: boolean;
  contact_email: string;
  address: string;
  av_equipment_needs: string;
  carousel_images: string[];
  catering_preferences: string;
  city: string;
  createdAt: string;
  creater_email: string;
  creater_name: string;
  creater_role: string;
  description: string;
  dress_code: string;
  emergency_contact_no: string;
  event_date: string;
  event_from: string;
  event_to: string;
  expected_attendees: string;
  isTest: boolean;
  note_from_institution: string;
  parking_arrangments: string;
  prefered_location_in_school: string;
  proposed_dates: string[];
  purpose: string;
  requested_partner: Partner;
  requested_program: string;
  rsvp: string;
  setup_requirments: string;
  state: string;
  status: string;
  title: string;
  transportation_details: string;
  type: string;
  updatedAt: string;
  url: string;
  zipCode: string;
  _v: number;
  id: string;
  organized_by: {
    type: 'branch' | 'institution' | 'student';
    ref_id: string;
  };
}

export const transformEventDataToMongo = (data: Event) => ({
  title: data?.title,
  creater_email: data?.createrEmail,
  creater_name: data.contactName ? data?.contactName : data?.hostName,
  creater_role: data?.createrRole,
  contact_email: data?.contactEmail,
  description: data?.description,
  address_line1: data?.addressLine1,
  address_line2: data?.addressLine2,
  approved_by_admin: data?.approvedByAdmin,
  rejected_by_admin: data?.rejectedByAdmin,
  dress_code: data?.dressCode,
  type: data?.type,
  requested_program: data?.requestedProgram,
  zipCode: data?.zipCode,
  av_equipment_needs: data?.AVEquipmentNeeds,
  rsvp: data?.RSVP,
  additional_comments: data?.additionalComments,
  agenda: data?.agenda,
  carousel_images: data?.carouselImages,
  catering_preferences: data?.cateringPreferences,
  emergency_contact_no: data?.emergencyContactPhone,
  note_from_institution: data?.noteFromInstitution,
  parking_arrangments: data?.parkingArrangements,
  prefered_location_in_school: data?.preferredLocationInSchool,
  purpose: data?.purpose,
  expected_attendees: data?.expectedAttendees,
  setup_requirments: data?.setupRequirements,
  status: data?.status,
  transportation_details: data?.transportationDetails,
  url: data?.url,
  state: data?.state,
  isTest: data?.isTest,
  event_from: data?.eventFrom,
  event_to: data?.eventTo,
  event_date: data?.eventDate,
  city: data?.city,
  proposed_dates: data?.proposedDates,
  requested_partner: data?.requestedPartner,
});
export const transformEventDataToFirebase = (
  data: FetchedEventData,
): Event => ({
  id: data?.id,
  title: data?.title,
  contactEmail: data?.contact_email,
  contactName: data?.creater_name,
  createrEmail: data?.creater_email,
  createrRole: data?.creater_role,
  purpose: data?.purpose,
  dateCreated: data?.createdAt,
  dateUpdated: data?.updatedAt,
  city: data?.city,
  state: data?.state,
  hostName: data?.creater_name,
  addressLine1: data?.address_line1,
  addressLine2: data?.address_line2,
  eventDate: data?.event_date,
  eventFrom: data?.event_from,
  eventTo: data?.event_to,
  status: data?.status as EventStatus,
  description: data?.description,
  zipCode: data?.zipCode,
  url: data?.url,
  additionalComments: data?.additional_comments,
  carouselImages: data?.carousel_images,
  type: data?.type as EventTypes,
  approvedByAdmin: data?.approved_by_admin,
  noteFromInstitution: data?.note_from_institution,
  transportationDetails: data?.transportation_details,
  RSVP: data?.rsvp,
  emergencyContactPhone: data?.emergency_contact_no,
  agenda: data?.agenda,
  dressCode: data?.dress_code,
  proposedDates: data?.proposed_dates.map((date) => ({
    eventDate: date,
    eventFrom: data?.event_from,
    eventTo: data?.event_to,
    proposerRole: data?.creater_role,
    proposedBy: data?.creater_name,
  })),
  requestedPartner: data?.requested_partner,
  preferredLocationInSchool: data?.prefered_location_in_school,
  expectedAttendees: parseInt(data?.expected_attendees, 10),
  requestedProgram: data?.requested_program,
  setupRequirements: data?.setup_requirments,
  AVEquipmentNeeds: data?.av_equipment_needs,
  cateringPreferences: data?.catering_preferences,
  parkingArrangements: data?.parking_arrangments,
  isTest: data?.isTest,
  partnerId: data?.organized_by?.ref_id,
});
