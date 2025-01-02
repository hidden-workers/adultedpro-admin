import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../services/firebase';
import { axiosInstance } from '../../api/axios';
import { collection, doc, setDoc } from 'firebase/firestore';
import {
  getInstituteUsersByProgramId,
  getProgramsUrl,
  getInstituteUrl,
  linkProgramWithInstituteUrl,
  getProgramsWithStudentsUrl,
} from '../../api/Endpoint';
import { Institute } from '../../interfaces';

interface Program {
  id: string;
  approved: boolean;
  name: string;
  questionType: string;
}

interface ProgramState {
  programs: Program[];
  programsWithStudents: any[];
  updatedPrograms: any;
  institutePrograms: Program[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProgramState = {
  programs: [],
  updatedPrograms: [],
  institutePrograms: [],
  programsWithStudents: [],
  status: 'idle',
  error: null,
};

// export const fetchPrograms = createAsyncThunk(
//   'programs/fetchPrograms',
//   async () => {
//     const programCollection = collection(db, 'programs');
//     const q = query(programCollection, where('approved', '==', true));
//     const querySnapshot = await getDocs(q);
//     const programs: Program[] = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...(doc.data() as Program),
//     }));
//     getPrograms(true)
//     // getUsersByProgramIdApi('66fb9329f5ed5af50aa7bfcb',10,1)
//     return programs;
//   },
// );

//replaaceing fetchPrograms with getPrograms
export const fetchPrograms = createAsyncThunk(
  'programs/fetchPrograms',
  async (approved: boolean, { rejectWithValue }) => {
    try {
      const url = getProgramsUrl(approved);
      const response = await axiosInstance.get(url);
      // getUsersByProgramIdApi('66fb9329f5ed5af50aa7bfcb', 10, 1);
      return response.data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      return rejectWithValue(error);
    }
  },
);

//to be integrated   (tested)
export const getUsersByProgramIdApi = async (
  programId: string,
  limit: number,
  instituteId: string,
): Promise<any> => {
  try {
    const url = getInstituteUsersByProgramId(programId, instituteId, limit);
    const response = await axiosInstance.get<any>(url);
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users in program:', error);
    throw error;
  }
};

export const getProgramsWithStudentsApi = createAsyncThunk(
  'programs/getProgramsWithStudentsApi',
  async ({
    instituteId,
    limit,
    page,
  }: {
    instituteId: string;
    limit: number;
    page: number;
  }) => {
    try {
      const url = getProgramsWithStudentsUrl(instituteId, limit, page);
      const response = await axiosInstance.get<any>(url);
      return response.data.users.programsWithStudents;
    } catch (error) {
      console.error('Error fetching programs with students:', error);
      throw error;
    }
  },
);

//integrated and working
export const getInstituteProgramsApi = createAsyncThunk(
  'programs/fetchProgramsOfInstitution',
  async (instituteId: string, { rejectWithValue }) => {
    try {
      const url = getInstituteUrl(instituteId);
      const response = await axiosInstance.get(url);
      return response.data.institute.program;
    } catch (error) {
      console.error('Error fetching institute programs:', error);
      return rejectWithValue(error);
    }
  },
);

//used in add program
export const getInstituteApi = createAsyncThunk(
  'programs/fetchfInstitution',
  async (instituteId: string, { rejectWithValue }) => {
    try {
      const url = getInstituteUrl(instituteId);
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching institute:', error);
      return rejectWithValue(error);
    }
  },
);

//integrated and working
export const linkProgramWithInstitute = createAsyncThunk(
  'institute/linkProgramWithInstitute',
  async (
    {
      instituteId,
      updatedInstitute,
    }: { instituteId: string; updatedInstitute: Institute },
    { rejectWithValue },
  ) => {
    try {
      const url = linkProgramWithInstituteUrl(instituteId);
      const response = await axiosInstance.patch(url, updatedInstitute);
      return response.data;
    } catch (error) {
      console.error('Error updating institute:', error);
      return rejectWithValue(
        error.response?.data || 'Error linking program with institute',
      );
    }
  },
);

export const updateSingleProgram = createAsyncThunk(
  'program/updateSingleProgram',
  async (programData: any, { rejectWithValue }) => {
    try {
      if (!programData || typeof programData !== 'object') {
        throw new Error('Invalid programData. It should be a valid object.');
      }

      const programRef = collection(db, 'labour-market');
      const uniqueId = programData?.program?.id;
      if (!uniqueId) {
        throw new Error('Program ID is missing.');
      }

      const updateDataRef = doc(programRef, uniqueId);

      // Set the data to Firestore
      await setDoc(updateDataRef, programData);

      return programData;
    } catch (error) {
      console.error('Error uploading program:', error.message);
      return rejectWithValue(error.message);
    }
  },
);

const programSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrograms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.programs = action.payload.programs;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch programs';
      })
      .addCase(updateSingleProgram.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateSingleProgram.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.updatedPrograms = action.payload;
      })
      .addCase(updateSingleProgram.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch programs';
      })
      .addCase(getInstituteProgramsApi.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getInstituteProgramsApi.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.institutePrograms = action.payload;
      })
      .addCase(getInstituteProgramsApi.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message || 'Failed to fetch institute programs';
      })
      .addCase(linkProgramWithInstitute.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(linkProgramWithInstitute.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.institutePrograms = action.payload.updatedInstitute.program;
      })
      .addCase(linkProgramWithInstitute.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message || 'Failed to link program with institute';
      })

      .addCase(getProgramsWithStudentsApi.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProgramsWithStudentsApi.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.programsWithStudents = action.payload;
      })
      .addCase(getProgramsWithStudentsApi.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message || 'Failed to link program with institute';
      });
  },
});

export default programSlice.reducer;

export const selectPrograms = (state: { programs: ProgramState }) =>
  state.programs.programs;
export const selectProgramStatus = (state: { programs: ProgramState }) =>
  state.programs.status;
export const selectProgramError = (state: { programs: ProgramState }) =>
  state.programs.error;
export const selectInstitutePrograms = (state: { programs: ProgramState }) =>
  state.programs.institutePrograms;
export const selectProgramsWithStudents = (state: { programs: ProgramState }) =>
  state.programs.programsWithStudents;
