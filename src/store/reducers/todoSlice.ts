import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doc, setDoc } from 'firebase/firestore';
import { todoCollection } from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from '../../interfaces';
import { axiosInstance } from '../../api/axios';
import {
  getTodoForUserUrl,
  removeSingleTodoUrl,
  updateSingleTodoUrl,
  createTodoUrl,
} from '../../api/Endpoint';
import { transformTodoDataToFirebase } from '../../methods/todos.method';
import { fetchedTodo } from '../../methods/todos.method';
interface TodoState {
  todo?: Todo;
  todoes: any[];
  isLoading: boolean;
  error: string | null;
}

export const fetchTodoes = createAsyncThunk(
  'institution/getTodoForUserUrl',
  async () => {
    const url = getTodoForUserUrl();
    const response = await axiosInstance.get(url);
    return response.data;
  },
);

export const setTodoDoc = (todoDoc: any): Todo | undefined => {
  let newTodo: Todo | undefined = undefined;
  if (todoDoc.exists()) {
    newTodo = todoDoc.data() as Todo;
  }

  return newTodo;
};

export const setTodo = createAsyncThunk<Todo | any, Todo>(
  'todoes/setTodo',
  async (todoData) => {
    if (!todoData?.id) {
      todoData.id = uuidv4();
      todoData.dateCreated = new Date();
    }
    todoData.dateUpdated = new Date();
    todoData.isTest = localStorage.getItem('isTest') === 'true';
    try {
      const docRef = doc(todoCollection, todoData.id);
      await setDoc(docRef, todoData, { merge: true });

      return todoData;
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  },
);
export const createTodo = createAsyncThunk<Todo, any>(
  'todoes/updateTodo',
  async (todoData) => {
    const url = createTodoUrl();
    const response = await axiosInstance.post(url, todoData);
    return response.data.todo;
  },
);

export const updateTodo = createAsyncThunk<fetchedTodo, any>(
  'todoes/updateTodo',
  async (todoData) => {
    const url = updateSingleTodoUrl(todoData.id);
    const response = await axiosInstance.put(url, todoData);
    return response.data.todo;
  },
);

export const deleteTodo = createAsyncThunk(
  'todoes/deleteTodo',
  async (todoId: string) => {
    const url = removeSingleTodoUrl(todoId);
    const response = await axiosInstance.delete(url);
    return response.data;
  },
);

const initialState: TodoState = {
  todo: undefined,
  todoes: [],
  isLoading: false,
  error: null,
};

const todoesSlice = createSlice({
  name: 'todoes',
  initialState,
  reducers: {
    resetState: (state) => {
      state.todo = undefined;
      state.todoes = [];
      state.isLoading = false;
      state.error = null;
    },
    setTodoSlice: (state, action: PayloadAction<Todo>) => {
      state.todo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodoes.fulfilled, (state, action) => {
        const transformedData = action.payload.todos.map(
          transformTodoDataToFirebase,
        );
        state.isLoading = false;
        state.todoes = transformedData;
      })
      .addCase(fetchTodoes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setTodo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setTodo.fulfilled, (state, action) => {
        state.isLoading = false;

        const userId = String(localStorage.getItem('userId'));
        const isPersonalReminder = userId == action.payload?.userId;
        if (!isPersonalReminder) return;

        const isTodoExist = state.todoes.some(
          (c) => c?.id === action.payload?.id,
        );
        state.todoes = isTodoExist
          ? state.todoes.map(
              (u) => (u = u?.id == action.payload?.id ? action.payload : u),
            )
          : [action.payload, ...state.todoes];
      })
      .addCase(setTodo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateTodo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformTodoDataToFirebase(action.payload);
        const isTodoExist = state.todoes.some(
          (c) => c?.id === transformedData?.id,
        );
        state.todoes = isTodoExist
          ? state.todoes.map((u) =>
              u.id === transformedData.id ? transformedData : u,
            )
          : [transformedData, ...state.todoes];
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.todoes = state.todoes.filter(
          (todo) => todo?.id != action.payload.todo.id,
        );
      })
      .addCase(todoActions.resetState, (state) => {
        state.todo = undefined;
        state.todoes = [];
        state.isLoading = false;
        state.error = null;
      })
      .addDefaultCase((state) => state);
  },
});

export default todoesSlice.reducer;
export const { resetState, setTodoSlice } = todoesSlice.actions;
export const { actions: todoActions } = todoesSlice;
