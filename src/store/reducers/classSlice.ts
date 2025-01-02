import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  doc,
  getDocs,
  query,
  setDoc,
  where,
  updateDoc,
  arrayUnion,
  addDoc,
  arrayRemove,
} from 'firebase/firestore';
import { classCollection, unassignedStudents } from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import {
  Class,
  User,
  LocalStorageAuthUser,
  UnassignedStudent,
} from '../../interfaces';

const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
  ? JSON.parse(localStorage.getItem('auth'))
  : null;

interface ClassState {
  class?: Class;
  allClasses: Class[];
  unassignedClass: UnassignedStudent;
  classes: Class[];
  isLoading: boolean;
  error: string | null;
}

export const setClassDoc = (classDoc: any): Class | undefined => {
  let newClass: Class | undefined = undefined;
  if (classDoc.exists()) {
    newClass = classDoc.data() as Class;
  }

  return newClass;
};

export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (partnerId: string) => {
    if (!partnerId) return [];

    const q = query(classCollection, where('partnerId', '==', partnerId));

    const querySnapshot = await getDocs(q);

    const classes = querySnapshot.docs.map((doc) => setClassDoc(doc));
    return classes;
  },
);

export const fetchUnassignedClasses = createAsyncThunk(
  'classes/fetchUnassignedClasses',
  async (_, { rejectWithValue }) => {
    try {
      if (!authUser) {
        throw new Error('Auth user not found');
      }

      const { partnerId } = authUser;

      // Query for unassigned classes based on the partnerId
      const q = query(unassignedStudents, where('partnerId', '==', partnerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Get the unassigned class document and return the class data
        const unassignedClassDoc = querySnapshot.docs[0];
        const unassignedClassData = unassignedClassDoc.data();

        return unassignedClassData; // Return the entire class document
      } else {
        // No unassigned class found for this partnerId
        return {};
      }
    } catch (error) {
      return rejectWithValue(
        'Error fetching unassigned class: ' + error.message,
      );
    }
  },
);
export const addStudentToUnassignedClass = createAsyncThunk(
  'classes/addStudentToUnassignedClass',
  async (student: User, { rejectWithValue }) => {
    try {
      if (!authUser) {
        throw new Error('Auth user not found');
      }

      const { partnerId, partnerName } = authUser;

      // Query for the document with the current partnerId
      const q = query(unassignedStudents, where('partnerId', '==', partnerId));
      const querySnapshot = await getDocs(q);

      const studentId = student.id; // Extract student ID

      if (!querySnapshot.empty) {
        // Unassigned class document found, update the students array
        const unassignedClassDoc = querySnapshot.docs[0];
        const unassignedClassRef = doc(
          unassignedStudents,
          unassignedClassDoc.id,
        );

        // Update the document by adding only the student ID to the array
        await updateDoc(unassignedClassRef, {
          students: arrayUnion(studentId), // Add only the student ID
          dateUpdated: new Date(),
        });
      } else {
        // No document found, create a new document for this partner
        const newUnassignedClass: UnassignedStudent = {
          id: uuidv4(), // generate a unique ID for the class
          partnerId,
          partnerName,
          students: [studentId], // Store only the student ID in the students array
          dateCreated: new Date(),
          dateUpdated: new Date(),
        };

        await addDoc(unassignedStudents, newUnassignedClass);
      }
    } catch (error) {
      return rejectWithValue(
        'Error adding student to unassigned class: ' + error.message,
      );
    }
  },
);

export const removeStudentsFromUnassignedClass = createAsyncThunk(
  'classes/removeStudentsFromUnassignedClass',
  async (studentIds: string[], { rejectWithValue }) => {
    try {
      if (!authUser) {
        throw new Error('Auth user not found');
      }

      const { partnerId } = authUser;

      // Query for the document with the current partnerId
      const q = query(unassignedStudents, where('partnerId', '==', partnerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Unassigned class document found, update the students array
        const unassignedClassDoc = querySnapshot.docs[0];
        const unassignedClassRef = doc(
          unassignedStudents,
          unassignedClassDoc.id,
        );

        // Extract existing students from the document
        const unassignedStudentsArray =
          unassignedClassDoc.data().students || [];

        // Filter the student IDs to be removed (those that exist in the unassigned class)
        const studentsToRemove = studentIds.filter((studentId) =>
          unassignedStudentsArray.includes(studentId),
        );

        if (studentsToRemove.length > 0) {
          // Update the document by removing the matched student IDs
          await updateDoc(unassignedClassRef, {
            students: arrayRemove(...studentsToRemove), // Remove matched students
            dateUpdated: new Date(),
          });
        } else {
          throw new Error('No matching students found in the unassigned class');
        }
      } else {
        // No unassigned class document found for this partner
        throw new Error('Unassigned class not found');
      }
    } catch (error) {
      return rejectWithValue(
        'Error removing students from unassigned class: ' + error.message,
      );
    }
  },
);

export const fetchClassesByInstructorId = createAsyncThunk(
  'classes/fetchClassesByInstructorId',
  async (instructorId: string) => {
    if (!instructorId) return [];

    const q = query(classCollection, where('instructorId', '==', instructorId));

    const querySnapshot = await getDocs(q);

    const classes = querySnapshot.docs.map((doc) => setClassDoc(doc));
    return classes;
  },
);

export const setClass = createAsyncThunk<Class | any, Class>(
  'classes/setClass',
  async (classData) => {
    if (!classData.id) {
      classData.id = uuidv4();
      classData.dateCreated = new Date();
    }
    classData.isTest = localStorage.getItem('isTest') === 'true';
    classData.dateUpdated = new Date();
    try {
      const docRef = doc(classCollection, classData.id);
      await setDoc(docRef, classData, { merge: true });

      return classData;
    } catch (error) {
      console.error('Error creating class:', error);
    }
  },
);

export const updateClass = createAsyncThunk<Class, any>(
  'classes/updateClass',
  async (classData) => {
    try {
      if (!classData.id) throw Error('id is missing.');
      classData.dateUpdated = new Date();
      classData.isTest = localStorage.getItem('isTest') === 'true';
      const docRef = doc(classCollection, classData.id);
      await setDoc(docRef, classData, { merge: true });
      return classData;
    } catch (error) {
      console.error('Error updating class:', error);
    }
  },
);

const initialState: ClassState = {
  class: undefined,
  allClasses: [],
  classes: [],
  unassignedClass: {} as UnassignedStudent,
  isLoading: false,
  error: null,
};

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    resetState: (state) => {
      state.class = undefined;
      state.allClasses = [];
      state.classes = [];
      state.unassignedClass = {} as UnassignedStudent;
      state.isLoading = false;
      state.error = null;
    },
    setClassSlice: (state, action: PayloadAction<Class>) => {
      state.class = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allClasses = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUnassignedClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnassignedClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        //@ts-expect-error: unassignedClass might not exist on state
        state.unassignedClass = action.payload;
      })
      .addCase(fetchUnassignedClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchClassesByInstructorId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClassesByInstructorId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classes = action.payload;
        state.allClasses = action.payload;
      })
      .addCase(fetchClassesByInstructorId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setClass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setClass.fulfilled, (state, action) => {
        state.isLoading = false;

        const isClassExist = state.classes.some(
          (c) => c?.id === action.payload?.id,
        );
        state.classes = isClassExist
          ? state.classes.map(
              (u) => (u = u?.id == action.payload?.id ? action.payload : u),
            )
          : [action.payload, ...state.classes];

        const isClassExistInAll = state.allClasses.some(
          (c) => c?.id === action.payload?.id,
        );
        state.allClasses = isClassExistInAll
          ? state.allClasses.map(
              (u) => (u = u?.id == action.payload?.id ? action.payload : u),
            )
          : [action.payload, ...state.allClasses];
      })
      .addCase(setClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateClass.pending, () => {
        // state.isLoading = true;
      })
      .addCase(updateClass.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(classActions.resetState, (state) => {
        state.class = undefined;
        state.allClasses = [];
        state.isLoading = false;
        state.error = null;
      })
      .addCase(removeStudentsFromUnassignedClass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeStudentsFromUnassignedClass.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update the unassigned class students after removal
        const studentsToRemove = action.meta.arg; // These are the student IDs to be removed
        state.unassignedClass.students = state.unassignedClass.students?.filter(
          (studentId) => !studentsToRemove.includes(studentId),
        );
      })
      .addCase(removeStudentsFromUnassignedClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addDefaultCase((state) => state);
  },
});

export default classesSlice.reducer;
export const { resetState, setClassSlice } = classesSlice.actions;
export const { actions: classActions } = classesSlice;
