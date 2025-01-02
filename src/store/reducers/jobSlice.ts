// jobsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, jobCollection } from '../../services/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  query,
  where,
  getCountFromServer,
  deleteDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '../../interfaces';
import { removeUndefinedFields } from '../../utils/functions';
import { axiosInstance } from '../../api/axios';
import {
  getJobsByEmployerId,
  getAllJobs,
  createJobUrl,
  updateJobUrl,
  getJobUrl,
  getJobsByEmployerEmail,
} from '../../api/Endpoint';
import {
  transformJobDataToFirebase,
  transformJobDataToMongo,
  transformSingleJobToFirebase,
} from '../../methods/jobs.method';

const setJobDoc = (jobRef) => {
  let job = undefined;

  if (jobRef.exists()) {
    job = jobRef.data();
  }
  if (!job.contactNumber && jobRef.data().contact) {
    job.contactNumber = jobRef.data().contact;
  }

  return job;
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async ({
    limit,
    page,
    includeJobApplications,
  }: {
    limit: number;
    page?: number;
    includeJobApplications: boolean;
  }) => {
    const response = await axiosInstance.get<any>(
      getAllJobs(limit, page, includeJobApplications),
    );
    return response.data;
  },
);

export const fetchDashboardJobs = createAsyncThunk(
  'jobs/fetchDashboardJobs',
  async ({
    limit,
    page,
    includeJobApplications,
  }: {
    limit: number;
    page?: number;
    includeJobApplications: boolean;
  }) => {
    const response = await axiosInstance.get<any>(
      getAllJobs(limit, page, includeJobApplications),
    );
    const jobs = response.data.jobs; // we have count here also response.data.count

    return jobs;
  },
);

export const fetchAllJobsCount = createAsyncThunk(
  'jobs/fetchAllJobsCount',
  async () => {
    const q = query(
      collection(db, 'jobs'),
      where('expireDate', '==', ''),
      where('isActive', '==', true),
    );

    const countSnapshot = await getCountFromServer(q);
    return countSnapshot.data().count;
  },
);

export const fetchJobsByEmployerEmail = createAsyncThunk(
  'jobs/fetchJobsByEmployerEmail',
  async ({ email, limit }: { email: any; limit?: number }) => {
    const response = await axiosInstance.get<any>(
      getJobsByEmployerEmail(email),
    );
    const transforedData = transformJobDataToFirebase(response.data.jobs);
    const jobs = transforedData;
    return jobs;
  },
);
// export const fetchJobsByEmployerId = createAsyncThunk(
//   'jobs/fetchJobsByEmployerId',
//   async ({ id, limit }: { id: any; limit?: number }) => {
//     const response = await axiosInstance.get<any>(getJobsByEmployerId(id,true));
//     const jobs = response.data.jobs.slice(0, limit);
//     return { jobs, totalCount: response?.data?.count };
//   },
// );

export const fetchJobsByEmployerId = createAsyncThunk(
  'jobs/fetchJobsByEmployerId',
  async ({ id, limit }: { id: any; limit?: number }) => {
    const response = await axiosInstance.get<any>(
      getJobsByEmployerId(id, true, limit),
    );
    const transforedData = transformJobDataToFirebase(response.data.jobs);
    const jobs = transforedData;
    return jobs;
  },
);

export const fetchDashboardJobsByEmployerId = createAsyncThunk(
  'jobs/fetchDashboardJobsByEmployerId',
  async ({ id, limit }: { id: any; limit?: number }) => {
    const response = await axiosInstance.get<any>(
      getJobsByEmployerId(id, true, limit),
    );

    const transforedData = transformJobDataToFirebase(response.data.jobs);
    const jobs = transforedData;
    return jobs;
  },
);
export const fetchJobsByEmployerIds = createAsyncThunk(
  'jobs/fetchJobsByEmployerIds',
  async ({ employerIds }: { employerIds: string[] }) => {
    const jobPromises = employerIds.map((id) =>
      axiosInstance.get<any>(getJobsByEmployerId(id, true, 100000)),
    );

    const responses = await Promise.all(jobPromises);
    const jobs = responses.flatMap((response) => response.data.jobs);
    const totalCount = responses.reduce(
      (count, response) => count + (response?.data?.count || 0),
      0,
    );

    return { jobs, totalCount };
  },
);
export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: any) => {
    jobData.dateCreated = new Date();
    jobData.dateUpdated = new Date();
    jobData.datePosted = new Date();

    const transformedData = transformJobDataToMongo(jobData);

    const response = await axiosInstance.post<any>(
      createJobUrl(),
      transformedData,
    );
    return response.data.job;
  },
);
export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async (jobData: any) => {
    jobData.dateUpdated = new Date();

    const transformedData = transformJobDataToMongo(jobData);

    const response = await axiosInstance.patch<any>(
      updateJobUrl(jobData.id),
      transformedData,
    );

    return response.data.updatedJob;
  },
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id: string) => {
    const response = await axiosInstance.get<any>(getJobUrl(id));
    const transforedData = transformSingleJobToFirebase(response.data.job);
    return transforedData;
  },
);

export const setJobApi = async (jobdata) => {
  jobdata = removeUndefinedFields(jobdata);
  if (!jobdata.id) {
    jobdata.id = uuidv4();
    jobdata.dateCreated = new Date();
  }
  jobdata.dateUpdated = new Date();
  jobdata.isTest = localStorage.getItem('isTest') === 'true';
  const jobsRef = collection(db, 'jobs');
  await setDoc(doc(jobsRef, jobdata.id), jobdata, { merge: true });

  return jobdata;
};

export const setJob = createAsyncThunk(
  'jobs/setJob',
  async (jobData: any, { rejectWithValue }) => {
    try {
      return setJobApi(jobData);
    } catch (error) {
      console.error('error.message', error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchJob = createAsyncThunk(
  'jobs/fetchJob',
  async (jobId: any) => {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    return setJobDoc(jobDoc);
  },
);

export const isDuplicateJob = async ({
  jobTitle,
  location,
  employerName,
}: any) => {
  const q = query(
    collection(db, 'jobs'),
    where('title', '==', jobTitle),
    where('addressLine1', '==', location),
    where('employerName', '==', employerName),
  );

  const querySnapshot = await getDocs(q);
  const jobs = querySnapshot.docs.map((doc) => setJobDoc(doc));

  return jobs;
};

export const deleteJobApi = async (_id) => {
  if (_id && _id.length > 0) {
    const docRef = doc(jobCollection, _id);
    await deleteDoc(docRef);
  }
};

export const fetchJobByEmployerIdApi = async (employerId) => {
  const q = query(
    collection(db, 'jobs'),
    where('employerId', '==', employerId.trim()),
  );
  const querySnapshot = await getDocs(q);
  const newData: any = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Ensure the data has an id, either from the data or from the document id
    newData.push({ ...data, id: data.id || doc.id });
  });
  return newData;
};

export const fetchJobByEmployerId = createAsyncThunk(
  'users/fetchUserByEmployerId',
  async (employerId: any, thunk) => {
    const newData = await fetchJobByEmployerIdApi(employerId);
    return thunk.fulfillWithValue(newData);
  },
);

const initialState = {
  job: undefined,
  allJobs: [], // all active jobs
  jobs: [],
  Dashjobs: [],
  allJobsCount: 0,
  isLoading: false,
  error: null,
};
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    resetState: () => initialState,
    setJobsSlice: (state, action) => {
      state.jobs = action.payload.sort((a, b) => {
        const dateA = a?.dateCreated?.seconds
          ? a?.dateCreated.toDate()
          : new Date(a?.dateCreated);
        const dateB = b?.dateCreated?.seconds
          ? b?.dateCreated.toDate()
          : new Date(b?.dateCreated);
        return dateB - dateA;
      }) as Job[];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        // TODO: differentiate between fetchJobs and fetchAllJobs
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformeddata = transformJobDataToFirebase(action.payload.jobs);
        state.jobs = transformeddata;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDashboardJobs.pending, (state) => {
        // TODO: differentiate between fetchJobs and fetchAllJobs
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformeddata = transformJobDataToFirebase(action.payload);
        state.Dashjobs = transformeddata;
      })
      .addCase(fetchDashboardJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAllJobsCount.fulfilled, (state, action) => {
        state.allJobsCount = action.payload;
      })
      .addCase(fetchJobsByEmployerEmail.pending, (state) => {
        state.isLoading = true;
        state.jobs = [];
        state.error = null;
      })
      .addCase(fetchJobsByEmployerEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.DashjobsCount = action?.payload?.totalCount;
        state.jobs = action.payload.sort((a, b) => {
          const dateA = a.dateCreated.seconds
            ? a?.dateCreated.toDate()
            : new Date(a?.dateCreated);
          const dateB = b.dateCreated.seconds
            ? b?.dateCreated.toDate()
            : new Date(b?.dateCreated);
          return dateB - dateA;
        });
      })
      .addCase(fetchJobsByEmployerEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJobsByEmployerId.pending, (state) => {
        state.isLoading = true;
        state.jobs = [];
        state.error = null;
      })
      .addCase(fetchJobsByEmployerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobsByEmployerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDashboardJobsByEmployerId.pending, (state) => {
        state.isLoading = true;
        state.jobs = [];
        state.error = null;
      })
      .addCase(fetchDashboardJobsByEmployerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Dashjobs = action.payload;
      })
      .addCase(fetchDashboardJobsByEmployerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = state.jobs.some((job) => job.id == action.payload.id)
          ? state.jobs.map(
              (j) => (j = j.id == action.payload.id ? action.payload : j),
            )
          : [action.payload, ...state.jobs];
      })
      .addCase(setJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJob.pending, (state) => {
        state.isLoading = true;
        state.job = undefined;
        state.error = null;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.job = action.payload;
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformSingleJobToFirebase(action.payload);
        state.jobs = [transformedData, ...state.jobs];
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.isLoading = false;
        const payloadData = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        const transformedData = transformJobDataToFirebase(payloadData);

        transformedData.forEach((newJob) => {
          const existingIndex = state.jobs.findIndex(
            (job) => job.id === newJob.id,
          );
          if (existingIndex !== -1) {
            state.jobs[existingIndex] = newJob;
          } else {
            state.jobs.unshift(newJob);
          }
        });
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJobByEmployerId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchJobByEmployerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
        state.error = '';
      })
      .addCase(fetchJobByEmployerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(jobActions.resetState, (state) => {
        state.job = undefined;
        state.allJobs = [];
        state.jobs = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export default jobsSlice.reducer;
export const { setJobsSlice } = jobsSlice.actions;
export const { actions: jobActions } = jobsSlice;
