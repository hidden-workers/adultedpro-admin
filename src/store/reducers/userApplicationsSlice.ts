import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { userApplicationCollection } from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { UserApplication } from '../../interfaces';
import { UserApplicationStatus } from '../../utils/enums';
import { axiosInstance } from '../../api/axios';
import {
  getApplicationsByEmployerEmail,
  updateApplicationUrl,
  getInstituteUserApplicationsUrl,
  getApplicantAppliedJobsUrl,
} from '../../api/Endpoint';
import {
  transformApplicationDataToFirebase,
  transformStudentApplicationDataToFirebase,
} from '../../methods/applications.method';

interface UserApplicationState {
  allUserApplications: any[];
  userApplications: UserApplication[];
  userApplicationsByStudentIds: UserApplication[];
  isLoading: boolean;
  error: string | null;
  userApplicationsCount: number;
  userApplicationsAppliedCount: number;
}

const setUserApplicationDoc = (
  userApplicationDoc: any,
): UserApplication | undefined => {
  let userApplication: UserApplication | undefined = undefined;
  if (userApplicationDoc.exists())
    userApplication = userApplicationDoc.data() as UserApplication;
  return userApplication;
};

export const fetchUserApplicationsCountForPartner = createAsyncThunk<
  number,
  string,
  { rejectValue: string }
>(
  'userApplications/fetchUserApplicationsCountForPartner',
  async (partnerId) => {
    const q = query(
      userApplicationCollection,
      where('applicant.partnerId', 'in', [partnerId]),
    );

    const countSnapshot = await getCountFromServer(q);
    return countSnapshot.data().count;
  },
);

export const fetchUserApplicationsByStudentIds = createAsyncThunk(
  'userApplications/fetchUserApplicationsByStudentIds',
  async (studentIds: string[]) => {
    let userApplications: UserApplication[] = [];

    // Chunk size for Firestore's 'in' clause
    const chunkSize = 30;
    const chunks = [];

    // Split student IDs into chunks of max 30
    for (let i = 0; i < studentIds.length; i += chunkSize) {
      chunks.push(studentIds.slice(i, i + chunkSize));
    }

    try {
      const fetchPromises = chunks.map(async (chunk) => {
        const querySnapshot = await getDocs(
          query(userApplicationCollection, where('applicantId', 'in', chunk)),
        );

        return querySnapshot.docs
          .map((doc) => setUserApplicationDoc(doc))
          .filter(
            (userApplication): userApplication is UserApplication =>
              userApplication !== undefined,
          );
      });

      // Wait for all fetch promises to resolve
      const results = await Promise.all(fetchPromises);
      userApplications = results.flat(); // Flatten the results into a single array
    } catch (error) {
      console.error('Error fetching user applications:', error); // Log the error
    }

    return userApplications;
  },
);

export const fetchUserApplicationsByApplicantIdApi = async (userId) => {
  let userApplications: UserApplication[] = [];
  const q = query(
    userApplicationCollection,
    where('applicantId', '==', userId),
  );

  const querySnapshot = await getDocs(q);
  userApplications = querySnapshot.docs
    .map((doc) => {
      const userApplication = setUserApplicationDoc(doc);
      return userApplication
        ? { ...userApplication, id: userApplication.id || doc.id }
        : undefined;
    })
    .filter(
      (userApplication): userApplication is UserApplication =>
        userApplication !== undefined,
    );

  return userApplications;
};

export const deleteUserApplicationApi = async (_userApplicationId) => {
  if (_userApplicationId && _userApplicationId.length > 0) {
    const docRef = doc(userApplicationCollection, _userApplicationId);
    await deleteDoc(docRef);
  }
};

export const fetchUserApplicationsByEmployerIdApi = async (userId) => {
  let userApplications: UserApplication[] = [];
  const q = query(userApplicationCollection, where('employerId', '==', userId));

  const querySnapshot = await getDocs(q);
  userApplications = querySnapshot.docs
    .map((doc) => {
      const userApplication = setUserApplicationDoc(doc);
      return userApplication
        ? { ...userApplication, id: userApplication.id || doc.id }
        : undefined;
    })
    .filter(
      (userApplication): userApplication is UserApplication =>
        userApplication !== undefined,
    );

  return userApplications;
};
export const fetchUserApplicationsForPartner = createAsyncThunk(
  'userApplications/fetchUserApplicationsForPartner',
  async (id: string) => {
    const response = await axiosInstance.get<any>(
      getInstituteUserApplicationsUrl(id, 100000, 1),
    );
    const applications = response.data.jobs;
    return applications;
  },
);

export const fetchAppliedJobsForApplicant = createAsyncThunk(
  'userApplications/fetchAppliedJobsForApplicant',
  async (id: string) => {
    const response = await axiosInstance.get<any>(
      getApplicantAppliedJobsUrl(id, 100000, 1),
    );
    const applications = response?.data?.jobs;
    return applications;
  },
);
export const fetchUserApplicationsByEmployerEmail = createAsyncThunk(
  'userApplications/fetchUserApplicationsByEmployerEmail',
  async (email: string) => {
    const response = await axiosInstance.get<any>(
      getApplicationsByEmployerEmail(email, 100000),
    );
    const applications = response.data.applications;
    return applications;
  },
);

export const updateUserApplication = createAsyncThunk(
  'userApplications/updateUserApplication',
  async ({ id, data }: { id: string; data: any }) => {
    const url = updateApplicationUrl(id);

    const response = await axiosInstance.patch(url, {
      status: data.status,
    });

    const application = response.data.application;
    return application;
  },
);

export const fetchUserApplicationsByJobIdApi = async (jobId) => {
  let userApplications: UserApplication[] = [];
  const q = query(userApplicationCollection, where('jobId', '==', jobId));

  const querySnapshot = await getDocs(q);
  userApplications = querySnapshot.docs
    .map((doc) => setUserApplicationDoc(doc))
    .filter(
      (userApplication): userApplication is UserApplication =>
        userApplication !== undefined,
    );

  return userApplications;
};

export const fetchUserApplicationsCountByEmployerEmail = createAsyncThunk(
  'userApplications/fetchUserApplicationsCountByEmployerEmail',
  async (email: string) => {
    const q = query(
      userApplicationCollection,
      where('employerEmail', '==', email),
    );

    const countSnapshot = await getCountFromServer(q);
    return countSnapshot.data().count;
  },
);

export const fetchUserApplicationsAppliedCountByEmployerEmail =
  createAsyncThunk(
    'userApplications/fetchUserApplicationsAppliedCountByEmployerEmail',
    async (email: string) => {
      const q = query(
        userApplicationCollection,
        where('employerEmail', '==', email),
        where('status', 'not-in', [
          UserApplicationStatus.Rejected,
          UserApplicationStatus.Skipped,
          UserApplicationStatus.Bookmarked,
        ]),
      );

      const countSnapshot = await getCountFromServer(q);
      return countSnapshot.data().count;
    },
  );

export const setUserApplicationApi = async (applicationData) => {
  if (!applicationData.id) {
    applicationData.id = uuidv4();
    applicationData.dateCreated = new Date();
  }

  applicationData.dateUpdated = new Date();
  applicationData.isTest = localStorage.getItem('isTest') === 'true';

  await setDoc(
    doc(userApplicationCollection, applicationData.id),
    applicationData,
    { merge: true },
  );

  return applicationData;
};

export const setUserApplication = createAsyncThunk(
  'jobs/setUserApplication',
  async (applicationData: any) => {
    try {
      if (applicationData) {
        return await setUserApplicationApi(applicationData);
      }
    } catch (error) {
      console.error('error.message', error.message);
    }
  },
);

const initialState: UserApplicationState = {
  allUserApplications: [],
  userApplications: [],
  userApplicationsByStudentIds: [],
  isLoading: false,
  error: null,
  userApplicationsCount: 0,
  userApplicationsAppliedCount: 0,
};

const userApplicationsSlice = createSlice({
  name: 'userApplications',
  initialState,
  reducers: {
    resetState: () => initialState,
    setUserApplicationsSlice: (state, action) => {
      state.userApplications = action.payload as UserApplication[];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserApplicationsByEmployerEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserApplicationsByEmployerEmail.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.userApplications = action.payload.map(
            transformApplicationDataToFirebase,
          );
        },
      )
      .addCase(
        fetchUserApplicationsByEmployerEmail.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      )
      .addCase(fetchUserApplicationsCountByEmployerEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserApplicationsCountByEmployerEmail.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.userApplicationsCount = action.payload;
        },
      )
      .addCase(
        fetchUserApplicationsCountByEmployerEmail.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      )
      .addCase(
        fetchUserApplicationsAppliedCountByEmployerEmail.pending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addCase(
        fetchUserApplicationsAppliedCountByEmployerEmail.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.userApplicationsAppliedCount = action.payload;
        },
      )
      .addCase(
        fetchUserApplicationsAppliedCountByEmployerEmail.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      )
      .addCase(fetchAppliedJobsForApplicant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppliedJobsForApplicant.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformeddata = action.payload?.map(
          transformStudentApplicationDataToFirebase,
        );
        state.userApplicationsByStudentIds = transformeddata;
      })
      .addCase(fetchAppliedJobsForApplicant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserApplicationsByStudentIds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserApplicationsByStudentIds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userApplicationsByStudentIds = action.payload;
      })
      .addCase(fetchUserApplicationsByStudentIds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserApplicationsForPartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserApplicationsForPartner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUserApplications = action.payload;
      })
      .addCase(fetchUserApplicationsForPartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserApplicationsCountForPartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserApplicationsCountForPartner.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.userApplicationsCount = action.payload;
        },
      )
      .addCase(
        fetchUserApplicationsCountForPartner.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      )

      .addCase(setUserApplication.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
      })
      .addCase(setUserApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        const isUserApplicationExist = state.userApplications.some(
          (application) => application?.id === action.payload?.id,
        );
        state.userApplications = isUserApplicationExist
          ? state.userApplications.map(
              (u) => (u = u?.id == action.payload?.id ? action.payload : u),
            )
          : [action.payload, ...state.userApplications];
      })
      .addCase(setUserApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(userApplicationActions.resetState, (state) => {
        state.allUserApplications = [];
        state.userApplications = [];
        state.isLoading = false;
        state.error = null;
        // userApplicationsCount = 0;
        // userApplicationsAppliedCount = 0;
      });
  },
});

export default userApplicationsSlice.reducer;
export const { setUserApplicationsSlice } = userApplicationsSlice.actions;
export const { actions: userApplicationActions } = userApplicationsSlice;
