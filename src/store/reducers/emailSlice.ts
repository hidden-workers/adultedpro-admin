import { doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { EmailData, Event } from '../../interfaces';
import { emailCollection } from '../../services/firebase';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const findEmailsByEmailAndTitle = createAsyncThunk<
  any[],
  { email: string; title: string }
>('emailsData/findEmailsByEmailAndTitle', async ({ email, title }) => {
  try {
    const q = query(
      emailCollection,
      where('to', '==', email),
      where('template.data.title', '==', title),
    );
    const querySnapshot = await getDocs(q);
    const emails = [];
    querySnapshot.forEach((doc) => {
      emails.push(doc.data() as EmailData);
    });
    return emails;
  } catch (err) {
    console.error(err);
  }
});

export const sendEventEmailToAdmin = async (
  eventData: Event,
): Promise<void> => {
  try {
    const data: EmailData = {
      to: 'support@adultedpro.com',
      template: {
        name: 'event-notification',
        data: {
          ...eventData,
          eventDate: eventData?.eventDate?.seconds
            ? eventData?.eventDate?.toDate()
            : new Date(eventData?.eventDate),
          eventFrom: eventData?.eventFrom?.seconds
            ? eventData?.eventFrom?.toDate()
            : new Date(eventData?.eventFrom),
          eventTo: eventData?.eventTo?.seconds
            ? eventData?.eventTo?.toDate()
            : new Date(eventData?.eventTo),
          dateCreated: eventData?.dateCreated?.seconds
            ? eventData?.dateCreated?.toDate()
            : new Date(eventData?.dateCreated),
          dateUpdated: eventData?.dateUpdated?.seconds
            ? eventData?.dateUpdated?.toDate()
            : new Date(eventData?.dateUpdated),
        },
      },
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };

    await sendEmail(data);
  } catch (e) {
    console.error('exception', e);
  }
};

export const sendEmail = createAsyncThunk(
  'sendEmail',
  async (data: EmailData) => {
    try {
      const docId = uuidv4();
      data.dateCreated = new Date();
      data.dateUpdated = new Date();
      data.isTest = localStorage.getItem('isTest') === 'true';
      await setDoc(doc(emailCollection, docId), data, { merge: true });

      return data;
    } catch (e) {
      console.error('exception', e);
    }
  },
);
