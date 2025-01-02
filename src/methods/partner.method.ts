interface mongoPartner {
  _id: string;
  id: string;
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
  carousel_images: [];
  email: string;
  admin_email: string;
  phone_no: string; // (telephone)
  photo_url: string;
  approved: boolean;
  program: [];
  fcm_token: string;
  // firebase values
  latitute: string;
  longitude: string;
  ipedsid: string;
  is_test: boolean;
}

export const transformPartnerDataToFirebase = (data: {
  success: boolean;
  institute?: mongoPartner;
  updatedInstitute?: mongoPartner;
}) => {
  const institute = data?.institute ? data?.institute : data?.updatedInstitute;
  return {
    id: institute?._id ? institute?._id : institute?.id,
    name: institute?.name,
    email: institute?.email,
    city: institute?.city,
    state: institute?.state,
    addressLine1: institute?.address_line1,
    addressLine2: institute?.address_line2,
    address: institute?.address,
    carouselImages: institute?.carousel_images,
    photoUrl: institute?.photo_url,
    mission: institute?.mission,
    website: institute?.website,
    adminEmail: institute?.admin_email,
    userId: institute?.firebaseId,
    zip: institute?.zip,
    tagLine: institute?.tag_line,
    logoText: institute?.logo_url,
    bannerColor: institute?.banner_color,
    programs: institute?.program,
    isTest: institute?.is_test,
  };
};

interface firebasePartnerData {
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
  programs?: [];
  isTest: boolean;
}
export const transformPartnerDataToMongo = (data: firebasePartnerData) => ({
  name: data?.name,
  city: data?.city,
  address_line1: data?.addressLine1,
  address_line2: data?.addressLine2,
  zip: data?.zip,
  state: data?.state,
  website: data?.website,
  tag_line: data?.tagLine,
  logo_url: data?.logoText,
  mission: data?.mission,
  photo_url: data?.photoUrl,
});
