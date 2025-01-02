import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, eventCollection } from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
  updateDoc,
  deleteDoc,
  limit as queryLimit,
} from 'firebase/firestore';
import { Event, EventFile } from '../../interfaces';
import { axiosInstance } from '../../api/axios';
import {
  getEventByOrganizerUrl,
  getRequestedEventsByPartnerIdUrl,
  createEventUrl,
  updateEventUrl,
  getJoinedEventsByEmployerUrl,
  getEventParticipantsUrl,
  addEventParticipantsUrl,
} from '../../api/Endpoint';

import { removeUndefinedFields } from '../../utils/functions';
import {
  transformEventDataToMongo,
  transformEventDataToFirebase,
} from '../../methods/events.method';

const mongoInstituteId = localStorage.getItem('mongoInstituteId');

//replacing fetchEventsByPartnerId with fetchEventsByOrganizer
export const fetchEventsByOrganizerId = createAsyncThunk(
  'events/fetchEventByOrganizer',
  async ({
    organizerType,
    organizerId,
  }: {
    organizerType: string;
    organizerId: string;
  }) => {
    const url = getEventByOrganizerUrl(organizerType, organizerId);
    const response = await axiosInstance.get(url);
    return response.data;
  },
);
export const fetchEventsParticipants = createAsyncThunk(
  'events/fetchEventsParticipants',
  async ({
    eventId,
    page,
    limit,
  }: {
    eventId: string;
    page: number;
    limit: number;
  }) => {
    const url = getEventParticipantsUrl(eventId, page, limit);
    const response = await axiosInstance.get(url);
    // Transform the data to group by candidate_id, branch_id, and institute_id
    const transformedResponse = {
      candidates: response.data.participants
        .map((p) => p.candidate_id)
        .filter((c) => c !== null),
      branches: response.data.participants
        .map((p) => p.branch_id)
        .filter((b) => b !== null),
      institutes: response.data.participants
        .map((p) => p.institute_id)
        .filter((i) => i !== null),
    };
    return transformedResponse;
  },
);
export const addEventsParticipants = createAsyncThunk(
  'events/addEventsParticipants',
  async ({
    eventId,
    participantId,
    participantStatus,
  }: {
    eventId: string;
    participantId: string;
    participantStatus: string;
  }) => {
    const url = addEventParticipantsUrl();
    const response = await axiosInstance.post(url, {
      eventId,
      participantId,
      participantStatus,
    });
    return response.data.participants;
  },
);

//mongo create event
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (
    {
      eventData,
      organizerType,
      organizerId,
    }: {
      eventData: Event;
      organizerType: string;
      organizerId: string;
    },
    thunkAPI,
  ) => {
    const transformedEventData = transformEventDataToMongo(eventData);
    const url = createEventUrl();
    const response = await axiosInstance.post(url, {
      ...transformedEventData,
      organizer_id: organizerId,
      organizer_type: organizerType,
    });

    thunkAPI.dispatch<any>(
      addEventsParticipants({
        eventId: response.data.event.id,
        participantId: organizerId,
        participantStatus: response.data.event.creater_role,
      }),
    );

    // Check if requestedEmployerIds is not empty and iterate over them
    if (
      eventData.requestedEmployerIds &&
      eventData.requestedEmployerIds.length > 0
    ) {
      eventData.requestedEmployerIds.forEach((participantId: string) => {
        thunkAPI.dispatch<any>(
          addEventsParticipants({
            eventId: response.data.event.id,
            participantId,
            participantStatus: 'employer',
          }),
        );
      });
    }

    return response.data;
  },
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({
    eventData,
    eventId,
    organizerType,
    organizerId,
  }: {
    eventData: Event;
    eventId: string;
    organizerType: string;
    organizerId: string;
  }) => {
    const transformedEventData = transformEventDataToMongo(eventData);
    const url = updateEventUrl(eventId);
    const response = await axiosInstance.patch(url, {
      ...transformedEventData,
      organizer_id: organizerId,
      organizer_type: organizerType,
    });

    return response.data;
  },
);

export const fetchEventsByRequestedPartnerId = createAsyncThunk(
  'events/fetchRequestedEventsByPartnerId',
  async ({
    instituteId,
    page,
    limit,
  }: {
    instituteId: string;
    page: number;
    limit: number;
  }) => {
    const url = getRequestedEventsByPartnerIdUrl(instituteId, page, limit);

    const response = await axiosInstance.get(url);
    return response.data;
  },
);

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const eventRef = collection(db, 'events');
      const eventQuery = query(eventRef, orderBy('eventDate', 'asc'), limit(6));
      const querySnapshot = await getDocs(eventQuery);

      const latestEvents: Event[] = [];
      querySnapshot.forEach((doc) => {
        latestEvents.push(doc.data() as Event);
      });

      return latestEvents;
    } catch (error) {
      console.error('Error fetching new event!', error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const fetchJoinedEventsByEmployer = createAsyncThunk<
  Event[],
  { employerId: string; page: number; limit: number }
>(
  'events/fetchJoinedEventsByEmployer',
  async ({ employerId, page, limit }, { rejectWithValue }) => {
    try {
      const url = getJoinedEventsByEmployerUrl(employerId, page, limit);

      const response = await axiosInstance.get(url);
      return response.data.events;
    } catch (error) {
      console.error('Error fetching events by employer:', error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const fetchInvitedEventsForEmployer = createAsyncThunk(
  'events/fetchInvitedEventsForEmployer',
  async ({
    employerId,
    page,
    limit,
  }: {
    employerId: string;
    page: number;
    limit: number;
  }) => {
    const url = getJoinedEventsByEmployerUrl(employerId, page, limit);

    const response = await axiosInstance.get(url);
    return response.data;
  },
);
export const fetchInvitedEventsForPartner = createAsyncThunk<
  Event[],
  { id: string; email: string },
  { rejectValue: string }
>(
  'events/fetchInvitedEventsForPartner',
  async ({ id, email }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Id is missing.');

      const eventRef = collection(db, 'events');
      const eventQuery = query(eventRef, where('partnerId', '==', id));
      const querySnapshot = await getDocs(eventQuery);
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data() as Event;
        if (eventData.createrEmail !== email) {
          events.push(eventData);
        }
      });
      return events;
    } catch (error) {
      console.error(
        'Error fetching invited events for partner: ',
        error.message,
      );
      return rejectWithValue(error.message);
    }
  },
);

export const fetchEventsByEmployerIdApi = async (employerId) => {
  if (!employerId) throw new Error('employerId is missing.');

  const eventRef = collection(db, 'events');
  const eventQuery = query(eventRef, where('employerId', '==', employerId));
  const querySnapshot = await getDocs(eventQuery);

  const events: Event[] = [];
  querySnapshot.forEach((doc) => {
    const eventData = doc.data() as Event;
    // Ensure the event data includes an id, either from the event data or from the document id
    events.push({ ...eventData, id: eventData.id || doc.id });
  });
  return events;
};

export const fetchEventsByPartnerIdApi = async (employerId) => {
  if (!employerId) throw new Error('employerId is missing.');

  const eventRef = collection(db, 'events');
  const eventQuery = query(eventRef, where('partnerId', '==', employerId));
  const querySnapshot = await getDocs(eventQuery);

  const events: Event[] = [];
  querySnapshot.forEach((doc) => {
    const eventData = doc.data() as Event;
    // Ensure the event has an id, either from the data or from the document id
    events.push({ ...eventData, id: eventData.id || doc.id });
  });

  return events;
};

export const deleteEventApi = async (_id) => {
  if (_id && _id.length > 0) {
    const docRef = doc(eventCollection, _id);
    await deleteDoc(docRef);
  }
};

export const fetchEventsByEmployerId = createAsyncThunk<any, string>(
  'events/fetchEventsByEmployerId',
  async (employerId, { rejectWithValue }) => {
    try {
      const events = await fetchEventsByEmployerIdApi(employerId);
      return events;
    } catch (error) {
      console.error('Error fetching events by employerId:', error.message);
      return rejectWithValue(error.message);
    }
  },
);

interface FetchEventsByCreatorEmailParams {
  email: string;
  limit?: number;
}

export const fetchEventsByCreaterEmail = createAsyncThunk<
  Event[],
  FetchEventsByCreatorEmailParams
>(
  'events/fetchEventsByCreaterEmail',
  async ({ email, limit }, { rejectWithValue }) => {
    try {
      if (!email) throw new Error('Email is missing.');

      const eventRef = collection(db, 'events');
      let eventQuery = query(eventRef, where('createrEmail', '==', email));
      if (limit) {
        eventQuery = query(eventQuery, queryLimit(limit));
      }
      const querySnapshot = await getDocs(eventQuery);
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push(doc.data() as Event);
      });

      return events;
    } catch (error) {
      console.error('Error fetching events by creater email:', error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchSchoolEvents = createAsyncThunk<Event[]>(
  'events/fetchSchoolEvents',
  async () => {
    try {
      const eventRef = collection(db, 'events');
      const eventQuery = query(eventRef, where('partnerId', '!=', ''));
      const querySnapshot = await getDocs(eventQuery);

      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push(doc.data() as Event);
      });

      return events;
    } catch (error) {
      console.error(
        'Error fetching school events by employer ID:',
        error.message,
      );
    }
  },
);
export const fetchEventsByRequestedPartnerName = createAsyncThunk<
  Event[],
  string
>(
  'events/fetchEventsByRequestedPartnerName',
  async (partnerName, { rejectWithValue }) => {
    try {
      if (!partnerName) throw new Error('PartnerName is missing.');

      const eventRef = collection(db, 'events');
      const eventQuery = query(
        eventRef,
        where('requestedPartner.name', '==', partnerName),
      );
      const querySnapshot = await getDocs(eventQuery);

      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push(doc.data() as Event);
      });
      return events;
    } catch (error) {
      console.error('Error fetching events by partner Name:', error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const fetchLatestEvent = createAsyncThunk(
  'events/fetchLatestEvent',
  async (_, { rejectWithValue }) => {
    try {
      const eventRef = collection(db, 'events');
      const eventQuery = query(eventRef, orderBy('eventDate', 'asc'), limit(1));
      const querySnapshot = await getDocs(eventQuery);

      let latestEvent: Event | undefined;
      querySnapshot.forEach((doc) => {
        latestEvent = doc.data() as Event;
      });

      return latestEvent;
    } catch (error) {
      console.error('Error fetching new event!', error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const setEventApi = async (eventData) => {
  try {
    if (!eventData.id) {
      eventData.id = uuidv4();
      eventData.dateCreated = new Date();
    }
    eventData.dateUpdated = new Date();
    eventData = removeUndefinedFields(eventData);
    eventData.isTest = localStorage.getItem('isTest') === 'true';
    const eventRef = collection(db, 'events');
    await setDoc(doc(eventRef, eventData.id), eventData, { merge: true });
    return eventData;
  } catch (error) {
    console.error('Error in setEventApi:', error);
    throw error;
  }
};

export const setEvent = createAsyncThunk<any, Event>(
  'events/setEvent',
  async (eventData: Event, { rejectWithValue }) => {
    try {
      eventData = await setEventApi(eventData);
      return eventData;
    } catch (error) {
      console.error('Error Setting Event', error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const bulkUploadEvents = createAsyncThunk(
  'events/bulkUploadEvents',
  async (events: EventFile[], { rejectWithValue }) => {
    try {
      const batch = writeBatch(db);
      const eventRef = collection(db, 'bulk-events');

      events.forEach((event) => {
        const eventDocRef = doc(eventRef, event.id);
        batch.set(eventDocRef, event);
      });

      await batch.commit();
      return events;
    } catch (error) {
      console.error('Error uploading events:', error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const fetchBulkEvents = createAsyncThunk<EventFile[]>(
  'events/fetchBulkEvents',
  async (_, { rejectWithValue }) => {
    try {
      const eventRef = collection(db, 'bulk-events');
      const querySnapshot = await getDocs(eventRef);

      const events: EventFile[] = [];
      querySnapshot.forEach((doc) => {
        events.push(doc.data() as EventFile);
      });

      return events;
    } catch (error) {
      console.error('Error fetching bulk events:', error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const fetchBulkEventById = createAsyncThunk<EventFile, string>(
  'events/fetchBulkEventById',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const eventRef = doc(db, 'bulk-events', eventId);
      const docSnapshot = await getDoc(eventRef);

      if (!docSnapshot.exists()) {
        throw new Error('Event not found');
      }

      return docSnapshot.data() as EventFile;
    } catch (error) {
      console.error('Error fetching bulk event:', error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const updateBulkEvent = createAsyncThunk<EventFile, EventFile>(
  'events/updateBulkEvent',
  async (updatedEvent: EventFile, { rejectWithValue }) => {
    try {
      const eventRef = doc(db, 'bulk-events', updatedEvent.id);

      const eventUpdate: Partial<EventFile> = {
        program: updatedEvent.program,
        eventType: updatedEvent.eventType,
        class: updatedEvent.class,
        days: updatedEvent.days,
        startTime: updatedEvent.startTime,
        endTime: updatedEvent.endTime,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate,
      };

      await updateDoc(eventRef, eventUpdate);

      return updatedEvent;
    } catch (error) {
      console.error('Error updating bulk event:', error.message);
      return rejectWithValue(error.message);
    }
  },
);

const sortEvents = (events: Event[]) => {
  return events?.sort((a, b) => {
    const aDate = a?.dateCreated?.seconds
      ? new Date(a.dateCreated.seconds * 1000)
      : new Date(a?.dateCreated);
    const bDate = b?.dateCreated?.seconds
      ? new Date(b.dateCreated.seconds * 1000)
      : new Date(b?.dateCreated);
    return bDate.getTime() - aDate.getTime();
  });
};

interface Participant {
  id: string;
  name: string;
  email: string;
  city?: string;
  state?: string;
}
interface EventState {
  event: Event | undefined;
  events: Event[];
  joinedEvents: Event[];
  schoolEvents: Event[]; // All School Events - For Employer page
  invitedEvents: Event[]; // For employer
  requestedEventsByEmployers: Event[]; // For institution
  requestedEventsByEmployersWithPartnerName: Event[];
  isLoading: boolean;
  error: string | null;
  bulkEvents: EventFile[];
  bulkEvent: EventFile | null;
  isBulkEventsLoading: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  employerEvents: [];
  employerParticipants: Participant[];
  candidateParticipants: Participant[];
  instituteParticipants: Participant[];
}

const initialState: EventState = {
  event: undefined,
  events: [],
  schoolEvents: [],
  joinedEvents: [],
  requestedEventsByEmployers: [],
  requestedEventsByEmployersWithPartnerName: [],
  invitedEvents: [],
  isLoading: false,
  error: null,
  bulkEvents: [],
  bulkEvent: null,
  isBulkEventsLoading: null,
  status: 'idle',
  employerEvents: [],
  employerParticipants: [],
  candidateParticipants: [],
  instituteParticipants: [],
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    resetState: () => initialState,
    setEventsSlice: (state, action) => {
      state.events = sortEvents(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = sortEvents(action.payload);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJoinedEventsByEmployer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.joinedEvents = action.payload;
      })
      .addCase(fetchEventsByOrganizerId.fulfilled, (state, action) => {
        state.isLoading = false;
        const sortedEvents = sortEvents(action.payload.events);
        state.events = sortedEvents.map((event: any) =>
          transformEventDataToFirebase(event),
        );
        // state.events = sortEvents(action.payload.events);
      })
      .addCase(fetchEventsByEmployerId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEventsByEmployerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employerEvents = action.payload;
      })
      .addCase(fetchEventsByEmployerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEventsByCreaterEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = sortEvents(action.payload);
      })
      .addCase(fetchInvitedEventsForEmployer.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedData = action?.payload?.events?.map((event) =>
          transformEventDataToFirebase(event?.event_id),
        );
        state.invitedEvents = transformedData;
      })
      .addCase(fetchInvitedEventsForPartner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitedEvents = sortEvents(action.payload);
      })
      .addCase(fetchSchoolEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schoolEvents = sortEvents(action.payload);
      })
      .addCase(fetchEventsByRequestedPartnerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requestedEventsByEmployers = sortEvents(action.payload.events);
      })
      .addCase(fetchEventsByRequestedPartnerName.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventsByRequestedPartnerName.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requestedEventsByEmployersWithPartnerName = action.payload;
      })
      .addCase(fetchEventsByRequestedPartnerName.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchLatestEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.event = action.payload;
      })
      .addCase(setEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const authUser = localStorage.getItem('auth')
          ? { ...JSON.parse(localStorage.getItem('auth')) }
          : null;
        if (
          action.payload?.createrEmail != authUser?.email &&
          action.payload?.partnerId != authUser?.partnerId
        )
          return;

        const isEventAlreadyExist = state.events.some(
          (event) => event?.id === action.payload?.id,
        );
        state.events = isEventAlreadyExist
          ? state.events.map(
              (e) => (e = e?.id == action.payload?.id ? action.payload : e),
            )
          : [action.payload, ...state.events];

        const isSchoolEvent = action.payload.partnerId != '' ? true : false;
        if (isSchoolEvent) {
          const isSchoolEventAlreadyExist = state.schoolEvents.some(
            (event) => event?.id === action.payload?.id,
          );
          state.schoolEvents = isSchoolEventAlreadyExist
            ? state.schoolEvents.map(
                (e) => (e = e?.id == action.payload?.id ? action.payload : e),
              )
            : [action.payload, ...state.schoolEvents];
        }
      })
      .addCase(setEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const authUser = localStorage.getItem('auth')
          ? { ...JSON.parse(localStorage.getItem('auth')) }
          : null;
        const transformedEvent = transformEventDataToFirebase(
          action.payload.event,
        );
        if (
          transformedEvent?.createrEmail != authUser?.email &&
          transformedEvent?.partnerId != mongoInstituteId
        )
          return;

        const isEventAlreadyExist = state.events.some(
          (event) => event?.id === transformedEvent?.id,
        );
        state.events = isEventAlreadyExist
          ? state.events.map(
              (e) => (e = e?.id == transformedEvent?.id ? transformedEvent : e),
            )
          : [transformedEvent, ...state.events];

        const isSchoolEvent = transformedEvent.partnerId != '' ? true : false;
        if (isSchoolEvent) {
          const isSchoolEventAlreadyExist = state.schoolEvents.some(
            (event) => event?.id === transformedEvent?.id,
          );
          state.schoolEvents = isSchoolEventAlreadyExist
            ? state.schoolEvents.map(
                (e) =>
                  (e = e?.id == transformedEvent?.id ? transformedEvent : e),
              )
            : [transformedEvent, ...state.schoolEvents];
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const authUser = localStorage.getItem('auth')
          ? { ...JSON.parse(localStorage.getItem('auth')) }
          : null;
        const transformedEvent = transformEventDataToFirebase(
          action.payload.updatedEvent,
        );
        if (
          transformedEvent?.createrEmail != authUser?.email &&
          transformedEvent?.partnerId != mongoInstituteId
        )
          return;

        const isEventAlreadyExist = state.events.some(
          (event) => event?.id === transformedEvent?.id,
        );
        state.events = isEventAlreadyExist
          ? state.events.map(
              (e) => (e = e?.id == transformedEvent?.id ? transformedEvent : e),
            )
          : [transformedEvent, ...state.events];

        const isSchoolEvent = transformedEvent.partnerId != '' ? true : false;
        if (isSchoolEvent) {
          const isSchoolEventAlreadyExist = state.schoolEvents.some(
            (event) => event?.id === transformedEvent?.id,
          );
          state.schoolEvents = isSchoolEventAlreadyExist
            ? state.schoolEvents.map(
                (e) =>
                  (e = e?.id == transformedEvent?.id ? transformedEvent : e),
              )
            : [transformedEvent, ...state.schoolEvents];
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEventsParticipants.pending, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchEventsParticipants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employerParticipants = action.payload?.branches;
        state.candidateParticipants = action.payload?.candidates;
        state.instituteParticipants = action.payload?.institutes;
      })
      .addCase(fetchEventsParticipants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(bulkUploadEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkUploadEvents.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(bulkUploadEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBulkEvents.pending, (state) => {
        state.isBulkEventsLoading = true;
      })
      .addCase(fetchBulkEvents.fulfilled, (state, action) => {
        state.isBulkEventsLoading = false;
        state.bulkEvents = action.payload;
      })
      .addCase(fetchBulkEvents.rejected, (state, action) => {
        state.isBulkEventsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(eventActions.resetState, (state) => {
        state.event = undefined;
        state.events = [];
        state.schoolEvents = [];
        state.invitedEvents = [];
        state.isLoading = false;
        state.error = null;
        state.bulkEvents = [];
        state.isBulkEventsLoading = false;
      })
      .addCase(fetchBulkEventById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBulkEventById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bulkEvent = action.payload;
      })
      .addCase(fetchBulkEventById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateBulkEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBulkEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedEvent = action.payload;
        state.bulkEvents = state.bulkEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event,
        );
      })
      .addCase(updateBulkEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default eventSlice.reducer;
export const { setEventsSlice } = eventSlice.actions;
export const { actions: eventActions } = eventSlice;
