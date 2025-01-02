import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { employerCollection } from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Employer, LocalStorageAuthUser } from '../../interfaces';
import { removeUndefinedFields } from '../../utils/functions';
import toast from 'react-hot-toast';
import { axiosInstance } from '../../api/axios';
import {
  getInstituteEmployersUrl,
  getEmployersUrl,
  registerEmployerUrl,
  getEmployerBranchesUrl,
  getEmployerUrl,
  updateEmployerUrl,
  getEmployerDashboardCountsUrl,
  getUserEmployersUrl,
  getEmployerByCompanyAndBranchUrl,
  getEmployerMainBranchUrl,
} from '../../api/Endpoint';
import {
  transformEmployertDataToFirebase,
  transformEmployerRegisterData,
  transformEmployertDataToMongo,
} from '../../methods/employers.method';
import { fetchedEmployers } from '../../methods/employers.method';

// TODO: branches -> employers
export const fetchEmployerDashboardCount = createAsyncThunk(
  'dashboard/fetchEmployerDashboardCount',
  async (userId: string) => {
    const url = getEmployerDashboardCountsUrl(userId);
    const response = await axiosInstance.get(url);
    return response.data.counts;
  },
);
const setEmployerDoc = (employerDoc) => {
  let employer = undefined;
  if (employerDoc.exists()) {
    employer = employerDoc.data();
  }

  return employer;
};
//mongo getInstituteEmployers api
export const getInstituteEmployers = createAsyncThunk(
  'employers/getInstituteEmployers',
  async () => {
    const url = getInstituteEmployersUrl();
    const response = await axiosInstance.get(url);
    return response.data;
  },
);
//mongo fetch employers
export const fetchEmployers = createAsyncThunk(
  'employers/fetchEmployers',
  async () => {
    const url = getEmployersUrl({ page: 1, limit: 1000 });
    const response = await axiosInstance.get(url);
    return response.data;
  },
);

export const fetchUserEmployers = createAsyncThunk(
  'employers/fetchUserEmployers',
  async (role: string) => {
    const url = getUserEmployersUrl(1, 1000000, role);
    const response = await axiosInstance.get(url);
    return response.data.users.users;
  },
);
interface EmployerData {
  name: string;
  contactName: string;
  email: string;
  branchLocation: string;
  addressLine1: string;
  city: string;
  state: string;
}
export const registerEmployer = createAsyncThunk(
  'employers/registerEmployer',
  async (employerData: EmployerData) => {
    const url = registerEmployerUrl();
    const transformmedData = transformEmployerRegisterData(employerData);
    const response = await axiosInstance.post(url, transformmedData);
    return response.data;
  },
);

export const fetchEmployerCount = createAsyncThunk(
  'employers/fetchEmployerCount',
  async () => {
    const querySnapshot = await getDocs(employerCollection);
    const employerCount = querySnapshot.size; // Get the count of documents
    return employerCount;
  },
);

export const fetchEmployerById = createAsyncThunk<any, string>(
  'employers/fetchEmployerById',
  async (userId) => {
    const url = getEmployerUrl(userId);
    const response = await axiosInstance.get(url);
    return response.data.branch;
  },
);

export const updateEmployer = createAsyncThunk<fetchedEmployers, Employer>(
  'employers/updateEmployer',
  async (employerData) => {
    const transformedData = transformEmployertDataToMongo(employerData);
    const url = updateEmployerUrl(employerData.id);
    const response = await axiosInstance.patch(url, transformedData);
    return response.data.branch;
  },
);
// export const fetchEmployerById = createAsyncThunk<Employer, string>(
//   'employers/fetchEmployerById',
//   async (userId) => {
//     try {
//       if (!userId) {
//         return console.error('Employer id is missing');
//       }
//       const employer = await getDoc(doc(db, 'employers', userId));
//       return setEmployerDoc(employer);
//     } catch (error) {
//       throw Error(error?.message);
//     }
//   },
// );

export const fetchEmployerByCompanyAndBranch = createAsyncThunk<
  Employer,
  { companyName: string; branchLocation: string }
>(
  'employers/fetchEmployerByCompanyAndBranch',
  async ({ companyName, branchLocation }) => {
    const url = getEmployerByCompanyAndBranchUrl(companyName, branchLocation);
    const response = await axiosInstance.get(url);
    const transformedData = transformEmployertDataToFirebase(
      response.data.Branch,
    );
    return transformedData;
  },
);

export const fetchEmployerMainBranch = createAsyncThunk<
  Employer,
  { name: string }
>('employers/fetchEmployerMainBranch', async ({ name }) => {
  const url = getEmployerMainBranchUrl(name);
  const response = await axiosInstance.get(url);
  const transformedData = transformEmployertDataToFirebase(
    response.data.Branch,
  );
  return transformedData;
});

export const fetchEmployersByEmailApi = async (email) => {
  if (!email) throw Error('Email is missing.');

  const q = query(employerCollection, where('email', '==', email));

  const querySnapshot = await getDocs(q);
  const employers = querySnapshot.docs.map((doc) => setEmployerDoc(doc));

  // Sort employers by dateCreated (assuming dateCreated is a timestamp)
  employers.sort((a, b) => a?.dateCreated - b?.dateCreated);
  return employers;
};

export const fetchEmployersByEmail = createAsyncThunk<Employer[], string>(
  'employers/fetchEmployersByEmail',
  async (email) => {
    try {
      return await fetchEmployersByEmailApi(email);
    } catch (error) {
      console.error('Error fetching employers by email:', error);
      throw error;
    }
  },
);

interface FetchEmployerBranchesResponse {
  success: boolean;
  branches: any[];
  totalBranches: number;
}

export const fetchEmployerBranchesByEmail = createAsyncThunk<
  FetchEmployerBranchesResponse,
  string
>('employers/fetchEmployerBranchesByEmail', async (email) => {
  try {
    const url = getEmployerBranchesUrl({
      page: 1,
      limit: 10000,
      employerEmail: email,
    });
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching employers by email:', error);
    throw error;
  }
});

export const createEmployer = createAsyncThunk<Employer, Employer>(
  'employers/createEmployer',
  async (employerData) => {
    try {
      employerData = removeUndefinedFields(employerData);
      const id = uuidv4();
      const docRef = doc(employerCollection, id);
      const data = {
        ...employerData,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        id,
        isTest: localStorage.getItem('isTest') === 'true',
      };
      await setDoc(docRef, data, { merge: true });

      return data;
    } catch (error) {
      console.error('error', error, error?.name, error?.code);
    }
  },
);

export const deleteEmployerApi = async (_id) => {
  if (_id && _id.length > 0) {
    const docRef = doc(employerCollection, _id);
    await deleteDoc(docRef);
  }
};

export const setEmployerCreateModal = createAsyncThunk<Employer, any>(
  'users/setEmployer',
  async (employer) => {
    const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
      ? JSON.parse(localStorage.getItem('auth'))
      : null;

    if (authUser?.employerId) {
      employer.id = authUser.employerId;
    }
    if (!employer.email) throw Error('Email is missing.');

    // Check if email already exists
    const q = query(employerCollection, where('email', '==', employer.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast.error('Email already exists.');
      return;
    }
    const employerData = await setEmployerApi(employer);

    if (authUser?.employerId == employerData?.id) {
      const userForLocalStorage: LocalStorageAuthUser = {
        ...authUser,
        employerName: employerData?.name,
        employerId: employerData?.id,
        logo: employerData.photoUrl,
      };
      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
    }

    return employerData;
  },
);
export const setEmployerApi = async (employer) => {
  try {
    if (!employer.email) throw Error('Email is missing.');

    const employerData = JSON.parse(JSON.stringify(employer));
    if (!employerData.id) {
      employerData.id = uuidv4();
      employerData.dateCreated = new Date();
    }
    employerData.isTest = localStorage.getItem('isTest') === 'true';
    employerData.dateUpdated = new Date();

    const docRef = doc(employerCollection, employerData.id);
    await setDoc(docRef, employerData, { merge: true });

    return employerData;
  } catch (error) {
    console.error('Error creating user:', error);
  }
};
export const setEmployer = createAsyncThunk<Employer, any>(
  'users/setEmployer',
  async (employer) => {
    const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
      ? JSON.parse(localStorage.getItem('auth'))
      : null;

    if (authUser?.employerId) {
      employer.id = authUser.employerId;
    }

    const employerData = await setEmployerApi(employer);

    if (authUser?.employerId == employerData?.id) {
      const userForLocalStorage: LocalStorageAuthUser = {
        ...authUser,
        employerName: employerData?.name,
        employerId: employerData?.id,
        logo: employerData.photoUrl,
      };
      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
    }

    return employerData;
  },
);
export const updateMainBranchDetails = createAsyncThunk<
  Employer[],
  { data: any; email: string }
>('users/updateMainBranchDetails', async ({ data, email }) => {
  try {
    if (!email) throw Error('Email is missing.');

    const q = query(employerCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    const employers = querySnapshot.docs.map((doc) => doc.data());

    const updatedEmployers = employers.map((employer) => ({
      ...employer,
      ...data,
      cultureMedia: data.cultureMedia ?? employer.cultureMedia, // Ensure cultureMedia is merged
      isTest: localStorage.getItem('isTest') === 'true',
    }));

    const updatePromises = updatedEmployers.map((employer) => {
      const docRef = doc(employerCollection, employer.id);
      return setDoc(docRef, employer, { merge: true });
    });

    await Promise.all(updatePromises);

    return updatedEmployers;
  } catch (error) {
    console.error('Error updating employers:', error);
  }
});

const initialState = {
  employer: undefined,
  employers: [],
  allEmployers: [], // All employers of db irrespective of email
  userEmployers: [],
  allEmployersCount: 0, // All employers count of db irrespective of email
  branches: [],
  isLoading: false,
  countsLoading: false,
  countsError: null,
  error: null,
  jobCounts: 0,
  swipeCounts: 0,
  applicationCounts: 0,
  chatCounts: 0,
};

const employersSlice = createSlice({
  name: 'employers',
  initialState,
  reducers: {
    addEmployer(state, action: PayloadAction<Employer>) {
      state.allEmployers.push(action.payload);
    },
    resetState: () => initialState,
    setEmployerSlice: (state, action: PayloadAction<Employer>) => {
      state.employer = action.payload;
    },
    setEmployersSlice: (state, action: PayloadAction<Employer[]>) => {
      state.employers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployerDashboardCount.pending, (state) => {
        state.countsLoading = true;
        state.countsError = null;
      })
      .addCase(fetchEmployerDashboardCount.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.applicationCounts = action.payload.applicationCounts;
        state.jobCounts = action.payload.jobCounts;
        state.swipeCounts = action.payload.swipeCounts;
        state.chatCounts = action.payload.chatCounts;
      })
      .addCase(fetchEmployerDashboardCount.rejected, (state, action) => {
        state.countsLoading = false;
        state.countsError =
          action.error.message ?? 'Failed to fetch dashboard counts';
      })
      .addCase(fetchEmployers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allEmployers = action.payload.employers.map((employer: any) =>
          transformEmployertDataToFirebase(employer),
        );
      })
      .addCase(fetchEmployers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserEmployers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserEmployers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userEmployers = action.payload.map((employer: any) =>
          transformEmployertDataToFirebase(employer),
        );
      })
      .addCase(fetchUserEmployers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchEmployerCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployerCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allEmployersCount = action.payload;
      })
      .addCase(fetchEmployerCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchEmployerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployerById.fulfilled, (state, action) => {
        state.employer = transformEmployertDataToFirebase(action.payload);
        state.isLoading = false;
      })
      .addCase(fetchEmployerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // .addCase(fetchEmployerById.pending, (state) => {
      //   state.isLoading = true;
      //   state.error = null;
      // })
      // .addCase(fetchEmployerById.fulfilled, (state, action) => {
      //   state.employer = action.payload;
      //   state.isLoading = false;
      // })
      // .addCase(fetchEmployerById.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.error = action.error.message;
      // })
      .addCase(fetchEmployersByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployersByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branches = action.payload;
      })
      .addCase(fetchEmployersByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchEmployerBranchesByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployerBranchesByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = action.payload.branches.map(
          transformEmployertDataToFirebase,
        );
        state.branches = transformedData;
      })
      .addCase(fetchEmployerBranchesByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateMainBranchDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMainBranchDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employers = state.employers.map((employer) => {
          const updatedEmployer = action.payload?.find(
            (updatedEmployer) => updatedEmployer?.id === employer?.id,
          );
          return updatedEmployer ? updatedEmployer : employer;
        });
        state.branches = state.branches.map((branch) => {
          const updatedEmployer = action.payload?.find(
            (updatedEmployer) => updatedEmployer?.id === branch?.id,
          );
          return updatedEmployer ? updatedEmployer : branch;
        });
      })
      .addCase(updateMainBranchDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEmployer.fulfilled, (state) => {
        state.isLoading = false;
        // state.employers = [...state.employers, action.payload];
      })
      .addCase(createEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setEmployer.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.isHeadquarter) state.employer = action.payload;

        const isEmployerExist = state.employers.some(
          (e) => e?.id == action.payload?.id,
        );
        state.employers = isEmployerExist
          ? state.employers.map(
              (e) => (e = e?.id == action.payload?.id ? action.payload : e),
            )
          : [...state.employers, action.payload];

        const EmployerExist = state.allEmployers.some(
          (e) => e?.id == action.payload?.id,
        );
        state.allEmployers = EmployerExist
          ? state.allEmployers.map(
              (e) => (e = e?.id == action.payload?.id ? action.payload : e),
            )
          : [...state.allEmployers, action.payload];

        const isBranchExist = state.branches.some(
          (e) => e?.id == action.payload?.id,
        );
        state.branches = isBranchExist
          ? state.branches.map(
              (e) => (e = e?.id == action.payload?.id ? action.payload : e),
            )
          : [...state.branches, action.payload];
      })
      .addCase(setEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmployer.fulfilled, (state, action) => {
        const transforedData = transformEmployertDataToFirebase(action.payload);
        state.isLoading = false;
        state.employer = transforedData;

        const isEmployerExist = state.employers.some(
          (e) => e?.id == transforedData?.id,
        );
        state.employers = isEmployerExist
          ? state.employers.map(
              (e) => (e = e?.id == transforedData?.id ? transforedData : e),
            )
          : [...state.employers, transforedData];

        const EmployerExist = state.allEmployers.some(
          (e) => e?.id == transforedData?.id,
        );
        state.allEmployers = EmployerExist
          ? state.allEmployers.map(
              (e) => (e = e?.id == transforedData?.id ? transforedData : e),
            )
          : [...state.allEmployers, transforedData];

        const isBranchExist = state.branches.some(
          (e) => e?.id == transforedData?.id,
        );
        state.branches = isBranchExist
          ? state.branches.map(
              (e) => (e = e?.id == transforedData?.id ? transforedData : e),
            )
          : [...state.branches, transforedData];
      })
      .addCase(updateEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(registerEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerEmployer.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformEmployertDataToFirebase(
          action.payload.user,
        );

        const isEmployerExist = state.employers.some(
          (e) => e?.id == action.payload?.user.id,
        );

        state.employers = isEmployerExist
          ? state.allEmployers.map(
              (e) => (e = e?.id == transformedData.id ? transformedData : e),
            )
          : [...state.employers, transformedData];
        const EmployerExist = state.allEmployers.some(
          (e) => e?.id == transformedData.id,
        );
        state.allEmployers = EmployerExist
          ? state.allEmployers.map(
              (e) => (e = e?.id == transformedData.id ? transformedData : e),
            )
          : [...state.allEmployers, transformedData];
        const isBranchExist = state.branches.some(
          (e) => e?.id == transformedData.id,
        );
        state.branches = isBranchExist
          ? state.branches.map(
              (e) => (e = e?.id == transformedData.id ? transformedData : e),
            )
          : [...state.branches, transformedData];
      })
      .addCase(registerEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(employerActions.resetState, (state) => {
        state.employer = undefined;
        state.employers = [];
        state.allEmployers = [];
        state.branches = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export default employersSlice.reducer;
export const { resetState, setEmployerSlice } = employersSlice.actions;
export const { actions: employerActions } = employersSlice;
