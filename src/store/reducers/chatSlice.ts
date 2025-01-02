import {
    createSlice,
    createAsyncThunk,
    unwrapResult,
    PayloadAction,
  } from '@reduxjs/toolkit';
  import { chatCollection, db, jobCollection } from '../../services/firebase';
  import {
    collection,
    doc,
    getDocs,
    setDoc,
    getDoc,
    query,
    where,
    updateDoc,
    arrayUnion,
    orderBy,
    writeBatch,
    onSnapshot,
    deleteDoc,
  } from 'firebase/firestore';
  
  import {
    getUserChatsUrl,
    findChatMessagesUrl,
    sendMessagesUrl,
    createChatUrl,
    getStudentEmployerUrl,
    updateChatUrl,
  } from '../../api/Endpoint';
  import { axiosInstance } from '../../api/axios';
  import { Chat, Job, Message } from '../../interfaces';
  import { removeUndefinedFields } from '../../utils/functions';
  import { RootState } from '../store';
  import {
    transformChatDataToFirebase,
    transformChatDataToMongo,
    createChatDataToMongo,
  } from '../../methods/chats.method';
  
  interface ChatState {
    chats: Chat[];
    dashboardChats: Chat[];
    currentChat: Chat | null;
    currentChatMessages: Message[];
    totalUnreadCount: number;
    isLoading: boolean;
    error: string | null;
    studentEmployerChatModal: boolean;
    studentEmployerChat: Chat[];
    selectedEmployerChat: any;
  }
  
  const initialState: ChatState = {
    chats: [],
    dashboardChats: [],
    currentChat: null,
    currentChatMessages: [],
    totalUnreadCount: 0,
    isLoading: false,
    error: null,
    studentEmployerChatModal: false,
    selectedEmployerChat: [],
    studentEmployerChat: [],
  };
  
  // To filter id missmatched chats
  export const filterInvalidChats = createAsyncThunk('filterChats', async () => {
    try {
      const chatsSnapshot = await getDocs(chatCollection);
      const invalidChats = [];
  
      chatsSnapshot.forEach((doc) => {
        const chat = doc.data();
        const participants = chat.participants || [];
        const participantsDetail = chat.participantsDetail || [];
  
        const invalidParticipantsDetail = participantsDetail.filter(
          (detail) => !participants.includes(detail.userId),
        );
  
        if (invalidParticipantsDetail.length > 0) {
          invalidChats.push({
            id: doc.id,
            ...chat,
            invalidParticipantsDetail,
          });
        }
      });
  
      return invalidChats;
    } catch (error) {
      console.error('Error filtering chats:', error);
    }
  });
  
  // Utility function to format chat data
  const setChatDoc = (chatRef: any): Chat | undefined => {
    if (chatRef.exists()) {
      const chatData: Chat = { ...chatRef.data(), id: chatRef.id };
      return chatData;
    }
    return undefined;
  };
  
  export const fetchChatsByParticipantUserIdApi = async (participantUserId) => {
    let allChats = [];
    const q = query(
      chatCollection,
      where('participants', 'array-contains', participantUserId),
    );
  
    const querySnapshot = await getDocs(q);
    allChats = querySnapshot.docs
      .map((doc) => {
        const chat = setChatDoc(doc);
        if (chat) {
          return { ...chat, id: chat.id || doc.id } as Chat;
        }
        return undefined;
      })
      .filter((c): c is Chat => c !== undefined);
  
    return allChats;
  };
  // Fetch all chats for a student-employer
  export const fetchStudentChats = createAsyncThunk(
    'chats/fetchChats',
    async (userId: string, { rejectWithValue }) => {
      if (!userId) return [];
  
      try {
        const q = query(
          chatCollection,
          where('participants', 'array-contains', userId),
          orderBy('lastMessageTimestamp', 'desc'),
        );
  
        const fetchChats = new Promise<Chat[]>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
              try {
                const chats = snapshot.docs.map((doc) => setChatDoc(doc));
                const filteredChats = chats.filter(
                  (chat) => chat !== undefined,
                ) as Chat[];
  
                const chatsWithJobsPromises = filteredChats.map(async (chat) => {
                  if (chat.jobId) {
                    const jobDoc = await getDoc(doc(jobCollection, chat.jobId));
                    const jobData = jobDoc.data() as Job | undefined;
                    if (jobData) return { ...chat, jobTitle: jobData.title };
                  }
                  return chat;
                });
  
                const chatsWithJobs = await Promise.all(chatsWithJobsPromises);
  
                resolve(chatsWithJobs);
              } catch (error) {
                reject(error);
              }
            },
            (error) => {
              reject(error);
            },
          );
  
          return () => {
            if (unsubscribe) {
              unsubscribe();
            }
          };
        });
  
        return fetchChats;
      } catch (error) {
        console.error('Chat fetch error:', error);
        return rejectWithValue(error.message);
      }
    },
  );
  
  export const fetchDashboardChats = createAsyncThunk(
    'chats/fetchDashboardChats',
    async () => {
      const url = getUserChatsUrl(6);
      const response = await axiosInstance.get<any>(url);
      return response.data.chats;
    },
  );
  export const fetchStudentEmployerChats = createAsyncThunk(
    'chats/fetchStudentEmployerChats',
    async ({ studentId, jobId }: { studentId: string; jobId: string }) => {
      const url = getStudentEmployerUrl(studentId, jobId, 100000, 1);
      const response = await axiosInstance.get<any>(url);
      return response.data.chats;
    },
  );
  export const fetchChats = createAsyncThunk('chats/fetchChats', async () => {
    const url = getUserChatsUrl(100000);
    const response = await axiosInstance.get<any>(url);
    return response?.data?.chats;
  });
  
  export const fetchMessages = createAsyncThunk(
    'chats/fetchMessages',
    async (chatId: string, { dispatch }) => {
      const url = findChatMessagesUrl(chatId);
      const response = await axiosInstance.get<any>(url);
      const messages = response?.data?.messages;
      // Dispatching the action to update the slice
      dispatch(setCurrentChatMessagesSlice({ chatId, messages }));
      return response.data;
    },
  );
  
  export const handleNewMessage = createAsyncThunk(
    'chats/handleNewMessage',
    async (
      {
        chat,
        message,
        isNewChat,
      }: { chat: any; message: any; isNewChat: boolean },
      { dispatch },
    ) => {
      const transformedData = transformChatDataToFirebase(chat);
      const chatId = transformedData?.id;
  
      if (isNewChat) {
        // Adding  new chat
        dispatch(chatsSlice.actions.addNewChat(transformedData));
      } else {
        // Updating existing chat
        dispatch(chatsSlice.actions.updateChat(transformedData));
  
        // Dispatch action to update current chat messages
        dispatch(setCurrentChatMessagesSlice({ chatId, messages: message }));
      }
  
      return { chatId, message, isNewChat };
    },
  );
  
  export const setChat = createAsyncThunk(
    'chats/setChat',
    async (data: Chat, { rejectWithValue }) => {
      try {
        const url = createChatUrl();
        const chatData = createChatDataToMongo(data);
        const response = await axiosInstance.post<any>(url, { chatData });
        return response?.data?.chat;
      } catch (error) {
        console.error(error);
        return rejectWithValue(error.message);
      }
    },
  );
  
  export const updateChat = createAsyncThunk(
    'chats/updateChat',
    async ({ data, id }: { data: any; id: string }) => {
      try {
        const url = updateChatUrl(id);
        const chatData = createChatDataToMongo(data);
        const response = await axiosInstance.patch<any>(url, { chatData });
        return response?.data?.chat;
      } catch (error) {
        console.error(error);
      }
    },
  );
  
  //fetch chat for multiple user ids
  export const fetchAllChats = createAsyncThunk(
    'chats/fetchChats',
    async (userIds: string[], { dispatch }) => {
      try {
        if (!userIds || userIds.length === 0) return [];
  
        // Create a query for each user ID and combine the results
        const queries = userIds.map((userId) =>
          query(
            chatCollection,
            where('participants', 'array-contains', userId),
            orderBy('lastMessageTimestamp', 'desc'),
          ),
        );
  
        // Create an array of unsubscribe functions
        const unsubscribeFunctions: (() => void)[] = [];
  
        // Fetch chats for each query
        const chatsWithJobsPromises = queries.map(async (q) => {
          return new Promise<Chat[]>((resolve, reject) => {
            const unsubscribe = onSnapshot(
              q,
              async (snapshot) => {
                const chats = snapshot.docs.map((doc) => setChatDoc(doc));
                const filteredChats = chats.filter(
                  (chat) => chat !== undefined,
                ) as Chat[];
  
                // Fetch job details for each chat
                const chatsWithJobsPromises = filteredChats.map(async (chat) => {
                  if (chat.jobId) {
                    const jobDoc = await getDoc(doc(jobCollection, chat.jobId));
                    const jobData = jobDoc.data() as Job | undefined;
                    if (jobData) return { ...chat, jobTitle: jobData.title };
                  }
                  return chat;
                });
  
                // Wait for all job details to be fetched
                const chatsWithJobs = await Promise.all(chatsWithJobsPromises);
                resolve(chatsWithJobs);
              },
              reject,
            );
  
            unsubscribeFunctions.push(unsubscribe);
          });
        });
  
        // Fetch chats for all user IDs
        const allChats = await Promise.all(chatsWithJobsPromises);
        const combinedChats = allChats.flat();
        // Update the state with the fetched chats
        dispatch(setChatsSlice(combinedChats));
        return combinedChats;
      } catch (error) {
        console.error('chat get error ', error);
        throw error;
      }
    },
  );
  
  export const deleteMessageApi = async (_chatId, _messageId) => {
    if (_chatId && _chatId.length > 0 && _messageId && _messageId.length > 0) {
      const docRef = doc(chatCollection, _chatId, 'messages', _messageId);
      await deleteDoc(docRef);
    }
  };
  
  export const deleteChatApi = async (_chatId) => {
    if (_chatId && _chatId.length > 0) {
      const docRef = doc(chatCollection, _chatId);
      await deleteDoc(docRef);
    }
  };
  
  export const fetchMessagesApi = async (chatId, senderId) => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, where('senderId', '==', senderId));
  
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs
        .map((doc) => {
          // Combine the document data with the chatId and doc.id
          const message = { id: doc.id, chatId: chatId, ...doc.data() };
          // Return the message object if it is not undefined
          return message;
        })
        .filter((message) => message !== undefined);
  
      return messages;
    } catch (error) {
      console.error('fetch chat messages error', error);
      throw error;
    }
  };
  
  export const deleteEmptyChats = createAsyncThunk<Chat[], Chat[]>(
    'chats/deleteEmptyChats',
    async (selectedEmployerChat) => {
      const chatIdsToDelete: string[] = [];
      const allMessages: any[] = [];
  
      for (let i = 0; i < selectedEmployerChat.length; i++) {
        const chat = selectedEmployerChat[i];
        const chatId = chat.id;
  
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
  
        if (!messagesSnapshot.empty) {
          const messages = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allMessages.push(...messages);
        } else {
          if (i < selectedEmployerChat.length - 1) {
            chatIdsToDelete.push(chatId);
          }
        }
      }
  
      const lastChat = selectedEmployerChat[selectedEmployerChat.length - 1];
  
      // Delete the marked chats
      for (const chatId of chatIdsToDelete) {
        await deleteDoc(doc(db, 'chats', chatId));
      }
  
      const newChat = {
        id: lastChat.id,
        ...lastChat,
        messages: allMessages,
      };
  
      const messagesCollectionRef = collection(
        db,
        'chats',
        lastChat.id,
        'messages',
      );
      for (const message of allMessages) {
        const updatedMessage = {
          ...message,
          chatId: lastChat.id,
        };
  
        // Use setDoc or addDoc depending on your needs
        await setDoc(
          doc(messagesCollectionRef, updatedMessage.id),
          updatedMessage,
        ); // Ensure unique IDs for each message
      }
  
      // Return the new chat with the messages included
      return [newChat];
    },
  );
  
  export const fetchStudentEmployerMessages = createAsyncThunk(
    'chats/fetchStudentEmployerMessages',
    async ({ chatId }: { chatId: string }) => {
      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp'));
  
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        return messages;
      } catch (error) {
        console.error('fetch chat messages error', error);
        throw error;
      }
    },
  );
  export const getUnreadMessageCount = createAsyncThunk(
    'chats/getUnreadMessageCount',
    async ({ chatId, userId }: { chatId: string; userId: string }) => {
      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
  
        // Query to fetch all messages
        const allMessagesQuery = query(messagesRef);
  
        // Query to fetch messages read by the user
        const readMessagesQuery = query(
          messagesRef,
          where('readBy', 'array-contains', userId.trim()),
        );
  
        // Execute both queries
        const allMessagesSnapshot = await getDocs(allMessagesQuery);
        const readMessagesSnapshot = await getDocs(readMessagesQuery);
  
        // Calculate unread messages count
        const totalMessagesCount = allMessagesSnapshot.docs.length;
        const readMessagesCount = readMessagesSnapshot.docs.length;
        const unreadMessagesCount = totalMessagesCount - readMessagesCount;
  
        return unreadMessagesCount;
      } catch (error) {
        console.error('Error in count', error);
        throw error;
      }
    },
  );
  
  export const fetchUnreadCounts = createAsyncThunk(
    'chats/fetchUnreadCounts',
    async (userId: string, { dispatch, getState }) => {
      try {
        const state = getState() as RootState;
        const { chats } = state.chat;
  
        let totalUnreadCount = 0;
  
        const unreadCountsPromises = chats.map(async (chat) => {
          try {
            const resultAction = await dispatch(
              getUnreadMessageCount({ chatId: chat.id, userId }),
            );
            const unreadCount = unwrapResult(resultAction);
            return unreadCount;
          } catch (error) {
            console.error(
              `Error fetching unread count for chat ${chat.id}`,
              error,
            );
            return 0;
          }
        });
  
        const unreadCounts = await Promise.all(unreadCountsPromises);
        totalUnreadCount = unreadCounts.reduce((acc, count) => acc + count, 0);
  
        return totalUnreadCount;
      } catch (error) {
        console.error('Error fetching unread counts', error);
        throw error;
      }
    },
  );
  
  // Fetch a specific chat by ID
  export const fetchChat = createAsyncThunk(
    'chats/fetchChat',
    async (chatId: string) => {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      return setChatDoc(chatDoc);
    },
  );
  
  export const setChatApi = async (chatData) => {
    chatData.id = chatData.id || doc(chatCollection).id;
  
    chatData = removeUndefinedFields(chatData);
    chatData.isTest = localStorage.getItem('isTest') === 'true';
    const chatRef = doc(chatCollection, chatData.id);
    await setDoc(chatRef, chatData, { merge: true });
    return chatData;
  };
  
  // Add a message to a chat
  export const sendMessage = createAsyncThunk(
    'chats/sendMessage',
    async (
      {
        chatId,
        messageData,
        chatData,
      }: { chatId: string; messageData: any; chatData: any },
      { rejectWithValue },
    ) => {
      try {
        const url = sendMessagesUrl(chatId);
        const transformedChatData = transformChatDataToMongo(chatData);
        const response = await axiosInstance.post<any>(url, {
          messageData,
          chatData: transformedChatData,
        });
  
        return response.data.message;
      } catch (error: any) {
        console.error('Error sending message:', error);
  
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Failed to send message',
        );
      }
    },
  );
  
  // Mark a single message as read
  export const markMessageAsRead = createAsyncThunk(
    'chats/markMessageAsRead',
    async (
      {
        chatId,
        messageId,
        userId,
      }: { chatId: string; messageId: string; userId: string },
      { rejectWithValue },
    ) => {
      try {
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        await updateDoc(messageRef, {
          readBy: arrayUnion(userId),
        });
        return { messageId, userId };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    },
  );
  
  export const setChatMessageApi = async (message) => {
    try {
      const messageRef = doc(db, 'chats', message.chatId, 'messages', message.id);
      delete message.chatId;
      delete message.id;
      await updateDoc(messageRef, {
        ...message,
      });
      return { ...message };
    } catch (error) {
      console.log('error', error);
    }
  };
  
  // Mark all messages in a single chat as read
  export const markAllMessagesAsRead = createAsyncThunk(
    'chats/markAllMessagesAsRead',
    async (
      { chatId, userId }: { chatId: string; userId: string },
      { rejectWithValue },
    ) => {
      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, where('readBy', 'not-in', [userId]));
        const querySnapshot = await getDocs(q);
  
        // Begin a batch write
        const batch = writeBatch(db);
  
        querySnapshot.forEach((doc) => {
          const messageDocRef = doc.ref;
          batch.update(messageDocRef, {
            readBy: arrayUnion(userId),
          });
        });
  
        // Commit the batch
        await batch.commit();
  
        return { chatId, userId };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    },
  );
  
  const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
      resetState: () => initialState,
      // For static data
      setCurrentChatMessagesSlice: (state, action) => {
        if (state.currentChat?.id == action.payload?.chatId)
          state.currentChatMessages = action.payload.messages;
      },
      setStudentEmployerChatModal(state, action: PayloadAction<boolean>) {
        state.studentEmployerChatModal = action.payload;
      },
      setCurrentChatSlice: (state, action) => {
        state.currentChat = action.payload;
      },
      // For static data
      setChatsSlice: (state, action: { payload: Chat[] }) => {
        state.chats = action.payload?.sort((a, b) => {
          const aTimestamp = a?.lastMessageTimestamp?.seconds
            ? a?.lastMessageTimestamp?.toDate()
            : new Date(a?.lastMessageTimestamp);
          const bTimestamp = b?.lastMessageTimestamp?.seconds
            ? b?.lastMessageTimestamp?.toDate()
            : new Date(b?.lastMessageTimestamp);
          return bTimestamp?.getTime() - aTimestamp?.getTime();
        });
      },
      addNewChat: (state, action: PayloadAction<any>) => {
        // Add new chat to the beginning of the chats array
        state.chats = [action.payload, ...state.chats];
      },
      updateChat: (state, action: PayloadAction<any>) => {
        // Update existing chat by matching the ID
        state.chats = state.chats.map((chat) =>
          chat.id === action.payload.id ? action.payload : chat,
        );
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchChats.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchChats.fulfilled, (state, action) => {
          state.isLoading = false;
          const transformedData = action.payload.map((chat) =>
            transformChatDataToFirebase(chat),
          );
          state.chats = transformedData;
        })
        .addCase(fetchChats.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })
  
        .addCase(fetchDashboardChats.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchDashboardChats.fulfilled, (state, action) => {
          state.isLoading = false;
          const transformedData = action.payload.map((chat) =>
            transformChatDataToFirebase(chat),
          );
          state.dashboardChats = transformedData;
        })
        .addCase(fetchDashboardChats.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })
  
        .addCase(fetchStudentEmployerChats.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchStudentEmployerChats.fulfilled, (state, action) => {
          state.isLoading = false;
          const transformedData = action.payload.map((chat) =>
            transformChatDataToFirebase(chat),
          );
          state.studentEmployerChat = transformedData;
        })
        .addCase(fetchStudentEmployerChats.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })
        .addCase(setChat.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(setChat.fulfilled, (state, action) => {
          state.isLoading = false;
          const transformedData = transformChatDataToFirebase(action.payload);
  
          const isChatAlreadyExists = state.chats.some(
            (chat) => chat?.id === transformedData?.id,
          );
          if (!isChatAlreadyExists) {
            state.chats = [transformedData, ...state.chats].sort((a, b) => {
              const aTimestamp = a.lastMessageTimestamp.seconds
                ? a.lastMessageTimestamp.toDate()
                : new Date(a.lastMessageTimestamp);
              const bTimestamp = b?.lastMessageTimestamp.seconds
                ? b.lastMessageTimestamp.toDate()
                : new Date(b.lastMessageTimestamp);
              return bTimestamp.getTime() - aTimestamp.getTime();
            });
          }
        })
        .addCase(setChat.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })
  
        .addCase(updateChat.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(updateChat.fulfilled, (state, action) => {
          state.isLoading = false;
          const transformedData = transformChatDataToFirebase(action.payload);
          const existingChatIndex = state.chats.findIndex(
            (chat) => chat?.id === transformedData?.id,
          );
          if (existingChatIndex !== -1) {
            // Update the existing chat
            state.chats[existingChatIndex] = transformedData;
          } else {
            // Add the new chat
            state.chats = [transformedData, ...state.chats];
          }
        })
        .addCase(updateChat.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })
        .addCase(fetchMessages.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchMessages.fulfilled, (state) => {
          state.isLoading = false;
        })
        .addCase(fetchMessages.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })
        .addCase(chatActions.resetState, (state) => {
          state.chats = [];
          state.currentChatMessages = [];
          state.isLoading = false;
          state.error = null;
        })
        .addCase(fetchUnreadCounts.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(
          fetchUnreadCounts.fulfilled,
          (state, action: PayloadAction<number>) => {
            state.totalUnreadCount = action.payload;
            state.isLoading = false;
          },
        )
        .addCase(fetchUnreadCounts.rejected, (state, action) => {
          state.error = action.error.message || 'Failed to fetch unread counts';
          state.isLoading = false;
        });
    },
  });
  
  export default chatsSlice.reducer;
  export const {
    setCurrentChatSlice,
    setChatsSlice,
    setCurrentChatMessagesSlice,
  } = chatsSlice.actions;
  export const { setStudentEmployerChatModal } = chatsSlice.actions;
  export const { actions: chatActions } = chatsSlice;
  