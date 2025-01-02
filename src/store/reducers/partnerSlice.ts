import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, partnerCollection } from '../../services/firebase';
import { LocalStorageAuthUser, Partner } from '../../interfaces';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { UserRolesEnum } from '../../utils/enums';
import { axiosInstance } from '../../api/axios';
import {
  getInstituteUrl,
  updateInstituteUrl,
  getInstitutesUrl,
} from '../../api/Endpoint';
import {
  transformPartnerDataToFirebase,
  transformPartnerDataToMongo,
} from '../../methods/partner.method';

const setPartnerDoc = (partnerDoc): Partner | undefined => {
  let partner: Partner | undefined = undefined;
  if (partnerDoc.exists()) {
    partner = partnerDoc.data() as Partner;
  }

  return partner;
};

export const fetchPartners = createAsyncThunk(
  'partners/fetchPartners',
  async ({
    approved,
    page,
    limit,
  }: {
    approved: boolean;
    page: number;
    limit: number;
  }) => {
    const url = getInstitutesUrl({
      approved: approved,
      page: page,
      limit: limit,
    });

    const response = await axiosInstance.get(url);
    return response.data.institutes;
  },
);

export const fetchPartnerById = createAsyncThunk<any, string>(
  'partners/fetchPartnerById',
  async (partnerId) => {
    try {
      const url = getInstituteUrl(partnerId);
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (err) {
      console.error('error fetching partner by id', err);
    }
  },
);

interface UpdateInstituteResponse {
  success: boolean;
  updatedInstitute: any;
}
export const updateMongoPartner = createAsyncThunk<
  UpdateInstituteResponse,
  { partnerId: string; partnerData: any }
>('users/updateMongoPartner', async ({ partnerId, partnerData }) => {
  try {
    const url = updateInstituteUrl(partnerId);
    const transformedData = transformPartnerDataToMongo(partnerData);
    const response = await axiosInstance.patch<UpdateInstituteResponse>(
      url,
      transformedData,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating partner:', error);
  }
});

export const fetchInstitutionAdmin = createAsyncThunk<
  Partner | undefined,
  string
>('partners/fetchInstitutionAdmin', async (partnerId) => {
  if (!partnerId) throw Error('Email is missing');
  const q = query(
    collection(db, 'users'),
    where('partnerId', '==', partnerId),
    where('role', 'array-contains-any', [UserRolesEnum.SchoolAdmin]),
  );
  const querySnapshot = await getDocs(q);
  const partners = querySnapshot.docs.map((doc) => setPartnerDoc(doc));
  return partners[0];
});
export const fetchPartnerByUserId = createAsyncThunk<
  Partner | undefined,
  string
>('users/fetchPartnerByUserId', async (userId, { rejectWithValue }) => {
  try {
    if (!userId) throw Error('UserId is missing');

    const q = query(partnerCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const partners: Partner[] = querySnapshot.docs.map((doc) =>
      setPartnerDoc(doc),
    );

    return partners[0];
  } catch (error) {
    console.error('Error fetching partner by id:', error);
    return rejectWithValue('Failed to fetch partner by id');
  }
});

export const deletePartnerApi = async (_id) => {
  if (_id && _id.length > 0) {
    const docRef = doc(partnerCollection, _id);
    await deleteDoc(docRef);
  }
};
export const fetchPartnerByEmailApi = async (email) => {
  if (!email) {
    throw Error('Email is missing');
  }
  const q = query(collection(db, 'partners'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  const partners = querySnapshot.docs.map((doc) => setPartnerDoc(doc));
  return partners;
};

export const fetchPartnerByEmail = createAsyncThunk<
  Partner | undefined,
  string
>('partners/fetchPartnerByEmail', async (email) => {
  const allPartners = await fetchPartnerByEmailApi(email);
  return allPartners[0];
});

export const fetchPartnerByName = createAsyncThunk<Partner | undefined, string>(
  'partners/fetchPartnerByName',
  async (name) => {
    const q = query(
      collection(db, 'partners'),
      where('name', '==', name.trim()),
    );
    const querySnapshot = await getDocs(q);
    const partners = querySnapshot.docs.map((doc) => setPartnerDoc(doc));
    return partners[0];
  },
);

export const setPartner = createAsyncThunk<Partner, Partner>(
  'partners/setPartner',
  async (partnerData) => {
    try {
      if (!partnerData.id) {
        partnerData.id = uuidv4();
        partnerData.dateCreated = new Date();
      }
      partnerData.dateUpdated = new Date();
      partnerData.isTest = localStorage.getItem('isTest') === 'true';
      const partnersRef = collection(db, 'partners');
      await setDoc(doc(partnersRef, partnerData.id), partnerData, {
        merge: true,
      });

      const authUser = localStorage.getItem('auth')
        ? JSON.parse(localStorage.getItem('auth'))
        : null;
      const userForLocalStorage: LocalStorageAuthUser = {
        ...authUser,
        partnerName: partnerData?.name,
        partnerId: partnerData?.id,
        logo: partnerData.photoUrl,
      };
      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));

      return partnerData;
    } catch (err) {
      console.error('error: ', err);
    }
  },
);

export const updatePartnerPrograms = createAsyncThunk<
  Partner,
  { partnerId: string; programs: any[] },
  { rejectValue: string }
>(
  'partner/updatePartnerPrograms',
  async ({ partnerId, programs }, { rejectWithValue }) => {
    try {
      if (!partnerId) throw new Error('Partner ID is missing.');

      const updatedPrograms = JSON.parse(JSON.stringify(programs));

      const updateData = {
        programs: updatedPrograms,
        dateUpdated: new Date(),
      };

      const docRef = doc(partnerCollection, partnerId);
      await setDoc(docRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error updating partner programs:', error);
      return rejectWithValue('Failed to update partner programs');
    }
  },
);

interface PartnersState {
  partner: Partner | undefined;
  partners: Partner[];
  institutionAdmin: Partner | undefined;
  isLoading: boolean;
  error: string | null;
}

const initialState: PartnersState = {
  partner: undefined,
  institutionAdmin: undefined,
  partners: [],
  isLoading: false,
  error: null,
};

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    resetState: (state) => {
      state.partner = undefined;
      state.partners = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.partners = action.payload;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPartnerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartnerById.fulfilled, (state, action) => {
        state.isLoading = false;

        const transforedData = transformPartnerDataToFirebase(action.payload);
        state.partner = transforedData;
      })
      .addCase(fetchPartnerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchInstitutionAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institutionAdmin = action.payload;
      })
      .addCase(fetchPartnerByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartnerByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.partner = action.payload;
      })
      .addCase(fetchPartnerByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPartnerByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartnerByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.partner = action.payload;
      })
      .addCase(fetchPartnerByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updatePartnerPrograms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePartnerPrograms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.partner = action.payload;
      })
      .addCase(updatePartnerPrograms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPartnerByName.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartnerByName.fulfilled, (state, action) => {
        state.isLoading = false;
        state.partner = action.payload;
      })
      .addCase(fetchPartnerByName.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setPartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setPartner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.partner = action.payload as Partner;
      })
      .addCase(setPartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(updateMongoPartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMongoPartner.fulfilled, (state, action) => {
        state.isLoading = false;
        const success = action.payload.success;
        const institute = action.payload.updatedInstitute;
        const transforedData = transformPartnerDataToFirebase({
          success,
          institute,
        });
        state.partner = transforedData;
      })
      .addCase(updateMongoPartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(partnerActions.resetState, (state) => {
        state.partner = undefined;
        state.partners = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export default partnersSlice.reducer;
export const { resetState } = partnersSlice.actions;
export const { actions: partnerActions } = partnersSlice;
