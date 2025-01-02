import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  db,
  userApplicationCollection,
  userCollection,
  employerCollection,
} from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { User, Employer } from '../../interfaces';
import { UserRolesEnum } from '../../utils/enums';
import { axiosInstance } from '../../api/axios';
import {
  getUsersUrl,
  getUsersByInstituteIdUrl,
  getUserByIdUrl,
  deleteUserUrl,
  getDashboardCountUrl,
  getInstituteTeacherUrl,
  createUserUrl,
  updateUserUrl,
  updateCandidateUserUrl,
  getApplicantUrl,
} from '../../api/Endpoint';
import transformStudentData from '../../methods/students.method';
import {
  transformUserdataToFirebase,
  MongoUserData,
  transformUserDataToMongo,
  transformCandidateDataToMongo,
} from '../../methods/users.method';
import toast from 'react-hot-toast';

// TODO: there are some docs in user collection for which role field is a string, convert them into array
interface UserState {
  user?: User;
  applicantUser: User;
  students: User[];
  dashboardStudents: User[];
  allTeachers: User[]; // To get all of the teachers irrespective of the institution
  teachers: User[]; // To get the institiution specific teachers
  admins: User[];
  allCounsellors: User[];
  counsellors: User[];
  allStudents: User[];
  users: User[];
  studentEngagedEmployers: Employer[];
  isLoading: boolean;
  error: string | null;
  studentsCount: number | null;
  jobCounts: number | null;
  swipeCounts: number | null;
  chatCounts: number | null;
  countsLoading: boolean;
  countsError: string | null;
}

const mongoInstituteId = localStorage.getItem('mongoInstituteId');

export const setUserDoc = (userDoc: any): User | undefined => {
  let user: User | undefined = undefined;
  if (userDoc.exists()) {
    user = userDoc.data() as User;
  }

  return user;
};
const setEmployerDoc = (employerDoc) => {
  let employer = undefined;
  if (employerDoc.exists()) {
    employer = employerDoc.data();
  }

  return employer;
};

function chunkArray(array: any[], chunkSize: number) {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

export const fetchDashboardCount = createAsyncThunk(
  'dashboard/fetchDashboardCount',
  async ({ instituteId, userId }: { instituteId: string; userId: string }) => {
    const url = getDashboardCountUrl(instituteId, userId);
    const response = await axiosInstance.get(url);
    return response.data;
  },
);

export const deleteUser = async (userId: string): Promise<any> => {
  try {
    const url = deleteUserUrl(userId);
    const response = await axiosInstance.delete<any>(url);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<any> => {
  try {
    const url = getUsersUrl(100000);
    const response = await axiosInstance.get<any>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createStudentsOfInstitution = createAsyncThunk(
  'users/createStudentsOfInstitution',
  async (
    { studentData, institute_id }: { studentData: User; institute_id: string },
    { rejectWithValue },
  ) => {
    try {
      const url = createUserUrl();
      const response = await axiosInstance.post(url, {
        ...studentData,
        institute_id: institute_id,
        approved_by_admin: true,
      });
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      });
      fetchDashboardStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 6,
        page: 1,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      return rejectWithValue(error.response?.data || 'Error creating user');
    }
  },
);

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (ids: undefined | string[] = undefined) => {
    let tempcollection;
    if (ids && ids.length > 0) {
      tempcollection = query(userCollection, where('id', 'in', ids));
    } else {
      tempcollection = userCollection;
    }

    const querySnapshot = await getDocs(tempcollection);
    const users = querySnapshot.docs.map((doc) => setUserDoc(doc));
    return users;
  },
);

export const fetchTeachersOfInstitution = createAsyncThunk(
  'users/fetchTeachersOfInstitution',
  async (
    {
      instituteId,
      limit,
      page,
      search,
    }: { instituteId: string; limit?: number; page?: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      const url = getInstituteTeacherUrl(instituteId, limit, page, search);
      const response = await axiosInstance.get(url);
      return response.data.teachers;
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      return rejectWithValue(error.response?.data || 'Error fetching teachers');
    }
  },
);
export const fetchAdminsOfInstitution = createAsyncThunk<User[], string>(
  'users/fetchAdminsOfInstitution',
  async (partnerId) => {
    const q = query(
      userCollection,
      where('partnerId', '==', partnerId),
      where('role', 'array-contains-any', [UserRolesEnum.SchoolAdmin]),
    );
    const querySnapshot = await getDocs(q);
    const admins = querySnapshot.docs.map((doc) => setUserDoc(doc));
    return admins;
  },
);
export const fetchCounsellors = createAsyncThunk(
  'users/fetchCounsellors',
  async () => {
    const q = query(
      userCollection,
      where('role', 'array-contains-any', [UserRolesEnum.Counsellor]),
    );
    const querySnapshot = await getDocs(q);
    const counsellors = querySnapshot.docs.map((doc) => setUserDoc(doc));
    return counsellors;
  },
);
export const fetchCounsellorsOfInstitution = createAsyncThunk<User[], string>(
  'users/fetchCounsellorsOfInstitution',
  async (partnerId) => {
    const q = query(
      userCollection,
      where('partnerId', '==', partnerId),
      where('role', 'array-contains-any', [UserRolesEnum.Counsellor]),
    );
    const querySnapshot = await getDocs(q);
    const counsellors = querySnapshot.docs.map((doc) => setUserDoc(doc));
    return counsellors;
  },
);

export const updateUserSubscriptionStatus = async ({ email, isSubscribed }) => {
  // Query the users collection for a document where the email matches
  const q = query(userCollection, where('email', '==', email));

  try {
    // Get the documents that match the query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    // Assuming email is unique, so we take the first matched document
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc?.id);

    // Update the is_subscribed_user field
    await updateDoc(userRef, {
      is_subscribed_user: isSubscribed,
    });
  } catch (error) {
    console.error('Error updating subscription status: ', error);
  }
};

export const fetchStudents = createAsyncThunk(
  'users/fetchStudents',
  async () => {
    const url = getUsersUrl(100000);
    const response = await axiosInstance.get<any>(url);
    return response.data.users;
  },
);
export const fetchStudentsOfInstitution = createAsyncThunk(
  'users/fetchUsersByInstituteId',
  async (
    {
      instituteId,
      limit,
      page,
      search,
    }: { instituteId: string; limit: number; page: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      const url = getUsersByInstituteIdUrl(instituteId, limit, page, search);
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.response?.data || 'Error fetching users');
    }
  },
);
export const fetchDashboardStudentsOfInstitution = createAsyncThunk(
  'users/fetchDashboardStudentsOfInstitution',
  async (
    {
      instituteId,
      limit,
      page,
      search,
    }: { instituteId: string; limit: number; page: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      const url = getUsersByInstituteIdUrl(instituteId, limit, page, search);
      const response = await axiosInstance.get(url);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.response?.data || 'Error fetching users');
    }
  },
);
export const fetchEmployersEngagedWithStudents = createAsyncThunk(
  'users/fetchEmployersEngagedWithStudents',
  async (studentIds: string[]) => {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error('studentIds must be a non-empty array.');
    }

    const chunkedStudentIds = chunkArray(studentIds, 10);
    const userApplications = [];

    for (const chunk of chunkedStudentIds) {
      const q = query(
        userApplicationCollection,
        where('applicantId', 'in', chunk),
      );
      const querySnapshot = await getDocs(q);
      const chunkStudents = querySnapshot.docs.map((doc) => setUserDoc(doc));
      userApplications.push(...chunkStudents);
    }

    const employerIds = userApplications
      .map((user) => user?.employerId)
      .filter((id) => id);
    const uniqueEmployerIds = [...new Set(employerIds)];
    const employerQuerySnapshot = await getDocs(
      query(employerCollection, where('id', 'in', uniqueEmployerIds)),
    );
    const employers = employerQuerySnapshot.docs.map((doc) =>
      setEmployerDoc(doc),
    );

    return { employers, userApplications };
  },
);

interface UserResponse {
  success: boolean;
  user: MongoUserData;
}

export const fetchUserById = createAsyncThunk<UserResponse, string>(
  'users/fetchUserById',
  async (userId) => {
    try {
      const url = getUserByIdUrl(userId);
      const response = await axiosInstance.get<any>(url, {
        headers: {
          'Cache-Control': 'no-cache', // Prevents caching
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user with id', error);
      throw error;
    }
  },
);

export const fetchApplicantUserById = createAsyncThunk<MongoUserData, string>(
  'users/fetchApplicantUserById',
  async (userId) => {
    try {
      const url = getApplicantUrl(userId);
      const response = await axiosInstance.get<any>(url, {
        headers: {
          'Cache-Control': 'no-cache', // Prevents caching
        },
      });
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user with id', error);
      throw error;
    }
  },
);
interface UpdateUserResponse {
  success: boolean;
  user: any;
}

export const updateMongoUser = createAsyncThunk<
  UpdateUserResponse,
  { userId: string; userData: any }
>(
  'users/updateMongoUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const url = updateUserUrl(userId);
      const transformedData = transformUserDataToMongo(userData);
      const response = await axiosInstance.patch<UpdateUserResponse>(
        url,
        transformedData,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      return rejectWithValue(error.response?.data || 'Error updating user');
    }
  },
);
export const updateMongoCandidate = createAsyncThunk<
  UpdateUserResponse,
  { userId: string; userData: any }
>(
  'users/updateMongoCandidate',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const url = updateCandidateUserUrl(userId);
      const transformedData = transformCandidateDataToMongo(userData);
      const response = await axiosInstance.patch<UpdateUserResponse>(
        url,
        transformedData,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      return rejectWithValue(error.response?.data || 'Error updating user');
    }
  },
);
// export const updateMongoUser = createAsyncThunk(
//   'users/updateMongoUser',
//   async (userId: string, userData) => {
//     try {
//       const url =   updateUserUrl(userId);
//       const transforedData= transformUserDataToMongo(userData)
//       const response = await axiosInstance.patch<any>(url,transforedData);
//       return response.data;
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       throw error;
//     }
//   },
// );
// export const fetchUserById = createAsyncThunk<User | undefined, string>(
//   'users/fetchUserById',
//   async (userId) => {
//     try {
//       if (!userId) throw Error('Id is missing.');
//       const userDoc = await getDoc(doc(db, 'users', userId));

//       const auth = getAuth();
//       const currentUser = auth.currentUser;

//       if (!currentUser) {
//         throw Error('User is not authenticated.');
//       }

//       const firebaseToken = await currentUser.getIdToken();

//       await fetchUserByIdBackendApi({ userId, firebaseToken });

//       return setUserDoc(userDoc);
//     } catch (error) {
//       throw Error(error?.message);
//     }
//   },
// );

export const fetchUserByEmail = createAsyncThunk<User | undefined, string>(
  'users/fetchUserByEmail',
  async (email, { rejectWithValue }) => {
    try {
      if (!email) {
        return rejectWithValue('Email is missing');
      }
      return await fetchUserByEmailApi(email);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return rejectWithValue('Failed to fetch user by email');
    }
  },
);

export const fetchUserByEmailApi = async (email) => {
  const q = query(userCollection, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  const users: User[] = querySnapshot.docs.map((doc) => {
    const userData = setUserDoc(doc);
    return {
      ...userData,
      id: userData.id || doc.id,
    };
  });
  return users[0];
};

export const getIsAllowedDomain = (email: string) => {
  const allowedDomains = [
    '@goevolo.com',
    '@goevolo.ai',
    '@adultedpro.com',
    '@hiddenworkers.com',
  ];

  // Checks if the email contains any of the allowed domains
  const isAllowedDomain = allowedDomains.some((domain) =>
    email?.includes(domain),
  );
  return isAllowedDomain;
};

export const deleteUserApi = async (
  _id: string,
): Promise<{ success: boolean; error?: string }> => {
  if (_id && _id.length > 0) {
    try {
      const docRef = doc(userCollection, _id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Invalid user ID' };
};

export const setUserApi = async (user) => {
  const userData = JSON.parse(JSON.stringify(user));
  try {
    if (!userData?.id) {
      userData.id = uuidv4();
      userData.dateCreated = new Date();
    }

    userData.dateUpdated = new Date();

    const isAllowedDomain = getIsAllowedDomain(userData?.email);

    // Checks if the email is a SuperAdmin
    const isSuperAdmin = user?.role?.includes(UserRolesEnum.SuperAdmin);

    const isTest = isAllowedDomain && !isSuperAdmin;

    localStorage.setItem('isTest', isTest.toString());

    userData.isTest = isTest;
    const docRef = doc(userCollection, userData.id);
    await setDoc(docRef, userData, { merge: true });

    const authUser = localStorage.getItem('auth')
      ? JSON.parse(localStorage.getItem('auth'))
      : null;
    if (authUser?.email == userData?.email) {
      const userForLocalStorage = {
        ...authUser,
        name: userData?.name,
        email: userData?.email,
        id: userData?.id,
        photoUrl: userData?.photoUrl,
      };
      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
    }
    return userData;
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

export const setUser = createAsyncThunk<User | any, User>(
  'users/setUser',
  async (user) => {
    return setUserApi(user);
  },
);

export const updateUser = createAsyncThunk<User, any>(
  'users/updateUser',
  async (user) => {
    try {
      if (!user.id) throw Error('id is missing.');
      const userData = JSON.parse(JSON.stringify(user));
      userData.isTest = localStorage.getItem('isTest') === 'true';
      userData.dateUpdated = new Date();

      const docRef = doc(userCollection, userData.id);

      await setDoc(docRef, userData, { merge: true });
      return userData;
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },
);

const initialState: UserState = {
  user: undefined,
  applicantUser: undefined,
  students: [],
  dashboardStudents: [],
  teachers: [],
  counsellors: [],
  admins: [],
  allTeachers: [],
  allStudents: [],
  allCounsellors: [],
  users: [],
  studentEngagedEmployers: [],
  isLoading: false,
  error: null,
  studentsCount: null,
  jobCounts: null,
  swipeCounts: null,
  chatCounts: null,
  countsLoading: false,
  countsError: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetState: () => initialState,
    setUserSlice: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardCount.pending, (state) => {
        state.countsLoading = true;
        state.countsError = null;
      })
      .addCase(fetchDashboardCount.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.studentsCount = action.payload.counts.studentsCount;
        state.jobCounts = action.payload.counts.jobCounts;
        state.swipeCounts = action.payload.counts.swipeCounts;
        state.chatCounts = action.payload.counts.chatCounts;
      })
      .addCase(fetchDashboardCount.rejected, (state, action) => {
        state.countsLoading = false;
        state.countsError =
          action.error.message ?? 'Failed to fetch dashboard counts';
      })
      .addCase(fetchUsers.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allStudents = action.payload.map(transformStudentData);
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTeachersOfInstitution.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchTeachersOfInstitution.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.isLoading = false;
          state.teachers = action.payload;
        },
      )
      .addCase(fetchTeachersOfInstitution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(fetchAdminsOfInstitution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchCounsellors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCounsellors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allCounsellors = action.payload;
      })
      .addCase(fetchCounsellors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCounsellorsOfInstitution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCounsellorsOfInstitution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.counsellors = action.payload;
      })
      .addCase(fetchCounsellorsOfInstitution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStudentsOfInstitution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentsOfInstitution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStudents = action.payload.users.map((student: any) =>
          transformStudentData(student),
        );
        state.students = action.payload.users.map((student: any) =>
          transformStudentData(student),
        );
      })

      .addCase(fetchStudentsOfInstitution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDashboardStudentsOfInstitution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardStudentsOfInstitution.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.dashboardStudents = action.payload.users.map((student: any) =>
            transformStudentData(student),
          );
        },
      )
      .addCase(
        fetchDashboardStudentsOfInstitution.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      )
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformUserdataToFirebase(
          action.payload.user,
        );
        state.user = transformedData;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchApplicantUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicantUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformUserdataToFirebase(action.payload);
        state.applicantUser = transformedData;
      })
      .addCase(fetchApplicantUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateMongoUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMongoUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformUserdataToFirebase(
          action.payload.user,
        );
        state.user = transformedData;
      })
      .addCase(updateMongoUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateMongoCandidate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMongoCandidate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateMongoCandidate.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchUserByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformUserdataToFirebase(
          action.payload.user,
        );
        const authUser =
          localStorage.getItem('auth') != 'undefined'
            ? JSON.parse(localStorage.getItem('auth'))
            : null;
        if (authUser?.email == action.payload?.email)
          state.user = transformedData;

        const role = transformedData?.role;

        const isUserExist = state.users.some(
          (user) => user?.id === transformedData?.id,
        );
        state.users = isUserExist
          ? state.users.map(
              (u) => (u = u?.id == transformedData?.id ? transformedData : u),
            )
          : [transformedData, ...state.users];

        if (role?.includes('Student')) {
          const isStudentExist = state.students.some(
            (user) => user?.id === transformedData?.id,
          );
          state.students = isStudentExist
            ? state.students.map(
                (u) => (u = u?.id == transformedData?.id ? transformedData : u),
              )
            : [transformedData, ...state.students];

          const isStudentExistInAll = state.allStudents.some(
            (user) => user?.id === transformedData?.id,
          );
          state.allStudents = isStudentExistInAll
            ? state.allStudents.map(
                (u) => (u = u?.id == transformedData?.id ? transformedData : u),
              )
            : [transformedData, ...state.allStudents];
        }

        if (role?.includes('Teacher')) {
          const isTeacherExist = state.teachers.some(
            (user) => user?.id === transformedData?.id,
          );
          state.teachers = isTeacherExist
            ? state.teachers.map(
                (u) => (u = u?.id == transformedData?.id ? transformedData : u),
              )
            : [transformedData, ...state.teachers];
          const isTeacherExistInAll = state.allTeachers.some(
            (user) => user?.id === transformedData?.id,
          );
          state.allTeachers = isTeacherExistInAll
            ? state.allTeachers.map(
                (u) => (u = u?.id == transformedData?.id ? transformedData : u),
              )
            : [transformedData, ...state.allTeachers];
        }
      })
      .addCase(setUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateUser.pending, () => {
        // state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createStudentsOfInstitution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStudentsOfInstitution.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Student Created Successfully');
      })
      .addCase(createStudentsOfInstitution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchEmployersEngagedWithStudents.fulfilled, (state, action) => {
        state.studentEngagedEmployers = action.payload?.employers;
      })
      .addCase(userActions.resetState, (state) => {
        state.user = undefined;
        state.students = [];
        state.teachers = [];
        state.allTeachers = [];
        state.allStudents = [];
        state.users = [];
        state.isLoading = false;
        state.error = null;
      })
      .addDefaultCase((state) => state);
  },
});

export default userSlice.reducer;
export const { resetState, setUserSlice } = userSlice.actions;
export const { actions: userActions } = userSlice;
