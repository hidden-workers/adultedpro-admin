import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { auth, userCollection } from '../../services/firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as logOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import { RootState } from '../store';
import { User } from '../../interfaces';
import { getDocs, query, where } from 'firebase/firestore';
import { axiosInstance } from '../../api/axios';
import { loginUserByMailUrl, signUplUrl } from '../../api/Endpoint';

interface LoginResponse {
  accessToken: string;
  token: string;
  user: any;
  email: string;
  userId: string;
}

interface LoginCredentials {
  email: string;
  token: string;
  source: string;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<any> => {
  try {
    const response = await axiosInstance.post<LoginResponse>(
      loginUserByMailUrl(),
      credentials,
      {
        headers: {
          Authorization: `Bearer ${credentials.token}`,
        },
      },
    );

    const { token, email, user } = response.data;

    localStorage.setItem('Access_Token', token);
    localStorage.setItem('Email', email);
    localStorage.setItem('mongoUserId', user.id);
    localStorage.setItem('mongoInstituteId', user.institute_id?._id);

    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

interface SignUpBackendCredentials {
  name: string;
  email: string;
  phone_no: string;
  role: string[];
  user: {
    test: number;
  };
  token: string;
}
export const signUpUserWithBackend = async (
  backendCredentials: SignUpBackendCredentials,
): Promise<any> => {
  try {
    const response = await axiosInstance.post<any>(
      signUplUrl(),
      backendCredentials,
    );

    const { accessToken, email, user } = response.data;

    localStorage.setItem('Access_Token', accessToken);
    localStorage.setItem('Email', email);
    localStorage.setItem('mongoUserId', user.id);
    localStorage.setItem('mongoInstituteId', user.institute_id?._id);

    return response.data;
  } catch (error) {
    console.error('Backend Signup Error:', error);
    throw error;
  }
};

interface AuthState {
  auth: User | null;
  isLoading: boolean;
  error: { message: string; code: string } | null;
}

const setUserDoc = (userDoc: any): User | undefined => {
  let user: User | undefined = undefined;
  if (userDoc.exists()) {
    user = userDoc.data() as User;
  }

  return user;
};

export const signUp = createAsyncThunk<
  any,
  {
    email: string;
    password: string;
    name?: string;
    isLegalTermsAccepted: boolean;
    role: string[];
    city?: string;
    state?: string;
    contactName?: string;
    phone_no?: string;
    source: string;
  }
>('auth/signUp', async (userCredentials) => {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      userCredentials.email,
      userCredentials.password,
    );
    const firebaseToken = await result.user.getIdToken();
    const backendSignupCredentials = {
      name: userCredentials.name || result.user.displayName || '',
      email: userCredentials.email,
      phone_no: userCredentials.phone_no,
      role: userCredentials.role,
      user: { test: 4 },
      token: firebaseToken,
      source: userCredentials.source,
    };
    const backendResponse = await signUpUserWithBackend(
      backendSignupCredentials,
    );

    return {
      id: result.user.uid,
      email: result.user.email,
      name: userCredentials.name || result.user.displayName,
      photoUrl: result.user.photoURL,
      role: userCredentials.role,
      isLegalTermsAccepted: userCredentials.isLegalTermsAccepted,
      city: userCredentials.city || null,
      state: userCredentials.state || null,
      contactName: userCredentials.contactName || null,
      accessToken: backendResponse.token,
    };
  } catch (error) {
    throw error.message;
  }
});

export const signIn = createAsyncThunk<
  any,
  { email: string; password: string; source?: string }
>('auth/signIn', async (userCredentials) => {
  const result = await signInWithEmailAndPassword(
    auth,
    userCredentials.email,
    userCredentials.password,
  );
  const firebaseToken = await result.user.getIdToken();

  const backendLoginCredentials = {
    email: result.user.email as string,
    source: userCredentials.source,
    token: firebaseToken,
  };

  const backendResponse = await loginUser(backendLoginCredentials);
  //need to create new folder transformer and transform according to previous structure
  return {
    id: result.user.uid,
    email: backendResponse.user.email,
    name: backendResponse.user.name,
    photoUrl: backendResponse.user.photo_url,
    accessToken: backendResponse.token,
    user: backendResponse?.user, // so we can remove 3 4 apis
  };
});

export const signInWithGoogle = createAsyncThunk<any, void>(
  'auth/signInWithGoogle',
  async () => {
    const googleProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleProvider);

    return {
      id: result.user.uid,
      email: result.user.email,
      name: result.user.displayName,
      photoUrl: result.user.photoURL,
    };
  },
);

export const signOut = createAsyncThunk<void, void>(
  'auth/signOut',
  async () => {
    localStorage.clear();
    logOut(auth);
  },
);

export const forgotPassword = createAsyncThunk<void, string>(
  'auth/forgotPassword',
  async (email) => {
    const emailExists = await checkIfUserExists(email);
    if (!emailExists) {
      throw new Error('Email not exists');
    }
    sendPasswordResetEmail(auth, email);
  },
);

const checkIfUserExists = async (email: string): Promise<boolean> => {
  const q = query(userCollection, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  const users: User[] = querySnapshot.docs.map((doc) => setUserDoc(doc));

  if (users.length === 0) return false;
  return true;
};

const initialState: AuthState = {
  auth: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auth = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.error.message,
          code: action.error.code,
        };
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auth = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.error.message,
          code: action.error.code,
        };
      })
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auth = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.error.message,
          code: action.error.code,
        };
      })
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.auth = null;
        localStorage.removeItem('auth');
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.error.message,
          code: action.error.code,
        };
        localStorage.removeItem('auth');
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.auth = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.error.message,
          code: action.error.code,
        };
      })
      .addCase(authActions.resetState, (state) => {
        state.auth = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const updatePassword = createAsyncThunk<
  any,
  { currentPassword: string; newPassword: string }
>(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    const user = auth.currentUser as FirebaseUser | null;

    if (!user) {
      return rejectWithValue('No user is currently logged in.');
    }

    try {
      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await firebaseUpdatePassword(user, newPassword);

      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/invalid-credential') {
        return rejectWithValue('Current password needs reauthentication.');
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  },
);

export default authSlice.reducer;
export const selectAuth = (state: RootState) => state.auth.auth;
export const { actions: authActions } = authSlice;
