import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doc, getDocs, setDoc } from 'firebase/firestore';
import { sessionCollection } from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../../interfaces';

interface SessionState {
  session?: Session;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
}

export const setSessionDoc = (sessionDoc: any): Session | undefined => {
  let newSession: Session | undefined = undefined;
  if (sessionDoc.exists()) {
    newSession = sessionDoc.data() as Session;
  }

  return newSession;
};

export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async () => {
    const querySnapshot = await getDocs(sessionCollection);
    const sessions = querySnapshot.docs.map((doc) => setSessionDoc(doc));
    return sessions;
  },
);

export const setSession = createAsyncThunk<Session | any, Session>(
  'sessions/setSession',
  async (sessionData) => {
    if (!sessionData.id) {
      sessionData.id = uuidv4();
    }
    try {
      const docRef = doc(sessionCollection, sessionData.id);
      await setDoc(docRef, sessionData, { merge: true });

      return sessionData;
    } catch (error) {
      console.error('Error creating session:', error);
    }
  },
);

const initialState: SessionState = {
  session: undefined,
  sessions: [],
  isLoading: false,
  error: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    resetState: () => initialState,
    setSessionSlice: (state, action: PayloadAction<Session>) => {
      state.session = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setSession.fulfilled, (state, action) => {
        state.isLoading = false;

        const isSessionExist = state.sessions.some(
          (c) => c?.id === action.payload?.id,
        );
        state.sessions = isSessionExist
          ? state.sessions.map(
              (u) => (u = u?.id == action.payload?.id ? action.payload : u),
            )
          : [action.payload, ...state.sessions];
      })
      .addCase(setSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(sessionActions.resetState, (state) => {
        state.session = undefined;
        state.sessions = [];
        state.isLoading = false;
        state.error = null;
      })
      .addDefaultCase((state) => state);
  },
});

export default sessionsSlice.reducer;
export const { resetState, setSessionSlice } = sessionsSlice.actions;
export const { actions: sessionActions } = sessionsSlice;
