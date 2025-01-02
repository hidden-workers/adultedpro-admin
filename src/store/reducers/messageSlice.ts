// messagesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, messageCollection, userCollection } from '../../services/firebase';
import { doc, getDocs, setDoc, getDoc, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { BoardMessage, EmailData, User } from '../../interfaces';
import { sendEmail } from './emailSlice';
import { removeUndefinedFields } from '../../utils/functions';
import { BoardMessageTo, UserRolesEnum } from '../../utils/enums';
import { setUserDoc } from './userSlice';
import {
  getInstitueAnnouncementsUrl,
  createAnnouncementUrl,
} from '../../api/Endpoint';
import { axiosInstance } from '../../api/axios';
import {
  transformMessageToFirebase,
  transformMessagesDataToFirebase,
  transformAnnouncementDataToMongo,
} from '../../methods/messages.method';

const setMessageDoc = (messageRef) => {
  let message = undefined;

  if (messageRef.exists()) {
    message = messageRef.data();
  }
  if (!message.contactNumber && messageRef.data().contact) {
    message.contactNumber = messageRef.data().contact;
  }

  return message;
};

export const fetchMessage = createAsyncThunk(
  'messages/fetchMessage',
  async (messageId: any) => {
    const messageDoc = await getDoc(doc(db, 'messages', messageId));
    return setMessageDoc(messageDoc);
  },
);
export const fetchAllMessages = createAsyncThunk(
  'messages/fetchAllMessages',
  async () => {
    const querySnapshot = await getDocs(messageCollection);
    const messages = querySnapshot.docs.map((doc) => setMessageDoc(doc));

    return messages;
  },
);
export const fetchMessagesByPartnerId = createAsyncThunk(
  'messages/fetchMessagesByPartnerId',
  async (partnerId: any) => {
    try {
      const url = getInstitueAnnouncementsUrl(partnerId);
      const response = await axiosInstance.get(url);
      return response.data.announcements;
    } catch (err) {
      console.error('error fetching announcements by partner id', err);
    }
  },
);

export const createMessage = createAsyncThunk(
  'messages/createMessage',
  async (messageData: any, { dispatch }) => {
    try {
      const url = createAnnouncementUrl();
      const transforedData = transformAnnouncementDataToMongo(messageData);
      const response = await axiosInstance.post(url, transforedData);

      if (
        messageData.type === 'Email' ||
        messageData.type === 'EmailAndNotification'
      ) {
        const users = messageData.toEmails;

        // Dispatch sendEmail for each user in the users array
        await Promise.all(
          users.map(async (user: User) => {
            const data: EmailData = {
              to: user.email,
              template: {
                name: 'messageboard',
                data: messageData,
              },
              dateCreated: messageData.dateCreated,
              dateUpdated: messageData.dateUpdated,
              isTest: localStorage.getItem('isTest') === 'true',
            };

            // Dispatch sendEmail action and wait for each email to be sent
            await dispatch<any>(sendEmail(data));
          }),
        );
      }

      return response.data.announcement;
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  },
);

export const setMessage = createAsyncThunk(
  'messages/setMessage',
  async (messageData: any, { rejectWithValue, dispatch }) => {
    try {
      messageData = removeUndefinedFields(messageData);
      if (!messageData.id) {
        messageData.id = uuidv4();
        messageData.dateCreated = new Date();
      }
      messageData.dateUpdated = new Date();
      messageData.isTest = localStorage.getItem('isTest') === 'true';
      const messagesRef = messageCollection;
      await setDoc(doc(messagesRef, messageData.id), messageData, {
        merge: true,
      });

      // Send mail - TODO: have a template
      if (
        messageData.type == 'Email' ||
        messageData.type == 'EmailAndNotification'
      ) {
        let q;
        switch (messageData.to as BoardMessageTo) {
          case 'Admin':
            q = query(
              userCollection,
              where('role', 'array-contains-any', [UserRolesEnum.SchoolAdmin]),
              where('partnerId', '==', messageData.partnerId),
            );
            break;
          case 'Counsellors':
            q = query(
              userCollection,
              where('role', 'array-contains-any', [UserRolesEnum.Counsellor]),
              where('partnerId', '==', messageData.partnerId),
            );
            break;
          default:
            q = query(userCollection, where('id', 'in', messageData?.toIds));
            break;
        }
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => setUserDoc(doc));

        users.map((user: User) => {
          const data: EmailData = {
            to: user.email,
            template: {
              name: 'messageboard',
              data: messageData,
            },
            dateCreated: new Date(),
            dateUpdated: new Date(),
            isTest: localStorage.getItem('isTest') === 'true',
          };
          dispatch<any>(sendEmail(data)).then(() => {});
        });
      }

      return messageData;
    } catch (error) {
      console.error('error.message', error.message);
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  message: undefined,
  allMessages: [],
  messages: [],
  isLoading: false,
  error: null,
};
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    resetState: () => initialState,
    setMessagesSlice: (state, action) => {
      state.messages = action.payload.sort((a, b) => {
        const dateA = a?.dateCreated?.seconds
          ? a?.dateCreated.toDate()
          : new Date(a?.dateCreated);
        const dateB = b?.dateCreated?.seconds
          ? b?.dateCreated.toDate()
          : new Date(b?.dateCreated);
        return dateB - dateA;
      }) as BoardMessage[];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allMessages = action.payload.sort((a, b) => {
          const dateA = a?.dateCreated?.seconds
            ? a?.dateCreated.toDate()
            : new Date(a?.dateCreated);
          const dateB = b?.dateCreated?.seconds
            ? b?.dateCreated.toDate()
            : new Date(b?.dateCreated);
          return dateB - dateA;
        });
      })
      .addCase(fetchAllMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMessagesByPartnerId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByPartnerId.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformMessagesDataToFirebase(action.payload);
        state.messages = transformedData;
        // Sort messages by dateCreated if needed
        state.messages.sort((a, b) => {
          const dateA = new Date(a.dateCreated).getTime();
          const dateB = new Date(b.dateCreated).getTime();
          return dateB - dateA;
        });
      })

      .addCase(fetchMessagesByPartnerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(setMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = state.messages.some(
          (message) => message.id == action.payload.id,
        )
          ? state.messages.map(
              (j) => (j = j.id == action.payload.id ? action.payload : j),
            )
          : [action.payload, ...state.messages];
      })
      .addCase(setMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = transformMessageToFirebase(action.payload);
        state.messages = [transformedData, ...state.messages];
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(fetchMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(messageActions.resetState, (state) => {
        state.message = undefined;
        state.allMessages = [];
        state.messages = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export default messagesSlice.reducer;
export const { setMessagesSlice } = messagesSlice.actions;
export const { actions: messageActions } = messagesSlice;
