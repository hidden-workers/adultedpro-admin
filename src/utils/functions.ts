import { signOut } from 'firebase/auth';
import axios from 'axios';
import { auth } from '../services/firebase';
import { employerActions } from '../store/reducers/employersSlice';
import { jobActions } from '../store/reducers/jobSlice';
import { chatActions } from '../store/reducers/chatSlice';
import { eventActions } from '../store/reducers/eventSlice';
import { userActions } from '../store/reducers/userSlice';
import { userApplicationActions } from '../store/reducers/userApplicationsSlice';
import { partnerActions } from '../store/reducers/partnerSlice';
import { authActions } from '../store/reducers/authSlice';
import { classActions } from '../store/reducers/classSlice';
import { todoActions } from '../store/reducers/todoSlice';
import { Timestamp } from 'firebase/firestore';
import { PusherClient } from '../methods/pusher';

export const truncate = (text: string | undefined, maxLength: number): string => {
  if (!text) {
    return '';
  }
  // Trim spaces from the start of the text
  const trimmedText = text.trimStart();
  if (trimmedText.length > maxLength) {
    return trimmedText.slice(0, maxLength) + '...';
  }
  return trimmedText;
};
export const formatChatTimestamp = (timestamp) => {
  if (!timestamp) return { date: 'Invalid date', time: '' };

  let dateObject;
  if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
    // If the timestamp is a Firebase Timestamp object
    dateObject = timestamp.toDate();
  } else if (
    typeof timestamp === 'string' ||
    typeof timestamp === 'number' ||
    timestamp instanceof Date
  ) {
    // If the timestamp is a string, number, or JavaScript Date object
    dateObject = new Date(timestamp);
  } else {
    return { date: 'Invalid date', time: '' };
  }

  if (isNaN(dateObject.getTime())) {
    return { date: 'Invalid date', time: '' };
  }

  const formattedDate = dateObject.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = dateObject.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    // second: 'numeric',
    hour12: true,
  });
  return { date: formattedDate, time: formattedTime };
};

export const extractDateTimeFromTimestamp = (timestamp: any) => {
  if (!timestamp) return { date: 'Invalid date', time: '' };

  let dateObject: Date | null = null;

  if (timestamp?.seconds && typeof timestamp.seconds === 'number') {
    dateObject = new Date(timestamp.seconds * 1000);
  } else if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
    dateObject = timestamp.toDate();
  } else if (
    typeof timestamp === 'string' ||
    typeof timestamp === 'number' ||
    timestamp instanceof Date
  ) {
    dateObject = new Date(timestamp);
  }

  // Return invalid date if the dateObject was not properly set or is invalid
  if (!dateObject || isNaN(dateObject.getTime())) {
    return { date: 'Invalid date', time: '' };
  }

  // Format the date to MM/DD/YYYY
  const formattedDate = dateObject.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  // Format the time to hh:mm:ss AM/PM
  const formattedTime = dateObject.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  return { date: formattedDate, time: formattedTime };
};

export const getDateFromTimestamp = (timestamp) => {
  if (timestamp instanceof Date) {
    return timestamp;
  } else if (
    timestamp &&
    typeof timestamp === 'object' &&
    'seconds' in timestamp &&
    typeof timestamp.seconds === 'number'
  ) {
    return new Date(timestamp.seconds * 1000); // Convert to JavaScript Date
  } else if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000);
  } else {
    console.error('Unexpected timestamp format:', timestamp);
    return new Date(0); // Return epoch time as a fallback
  }
};

export const getOtherUserDetail = (
  chatParticipants: any[],
  currentUserId: string,
) => {
  if (!currentUserId)
    currentUserId = String(localStorage.getItem('mongoUserId'));

  // Find the other participant by excluding the current user
  const otherParticipant = chatParticipants?.find((participant) => {
    return String(participant?._id) !== currentUserId;
  });
  if (otherParticipant) {
    return otherParticipant;
  }

  return null;
};

export const initiateOtherUserDetail = (
  chatParticipants: any[],
  currentUserId: string,
) => {
  if (!currentUserId)
    currentUserId = String(localStorage.getItem('mongoUserId'));
  // Find the other participant by excluding the current user
  const otherParticipant = chatParticipants?.find((participant) => {
    return String(participant?.userId?._id) !== currentUserId;
  });
  if (otherParticipant) {
    return otherParticipant.userId;
  }

  return null;
};

export const addLatLong = async (job) => {
  const apiKey = 'AIzaSyAsStHmbfEb90JiFTDExHOx-4Ge_zxn9nU'; // TODO: api key to .env
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${job.zipCode}&key=${apiKey}`,
    );
    const { results } = data;
    if (results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      job._geoloc = {
        lat: lat,
        lng: lng,
      };
      return job;
    } else {
      console.error('*Invalid zip code', data);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const maskEmail = (email: string) => {
  if (!email) return;

  // Split the email into local part and domain part
  const [localPart, domainPart] = email.split('@');
  if (!localPart || !domainPart) return email;

  // Split the domain part into subdomains
  const domainParts = domainPart.split('.');
  const lastDomain = domainParts.pop(); // Get the last part (e.g., com, org)

  // Create the masked domain
  const maskedDomain = `**.${lastDomain.slice(-4)}`;

  // Mask the local part
  let maskedLocalPart =
    localPart.slice(0, -3).replace(/./g, '*') + localPart.slice(-3);
  maskedLocalPart = maskedLocalPart.slice(-6);

  // Return the masked email
  return `${maskedLocalPart}@${maskedDomain}`;
};

export const removeUndefinedFields = (obj: any): any => {
  const newObj: any = {};

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }

  return newObj;
};

export const sortArrayByField = (array: any[], field: string) => {
  return array.sort((a, b) => {
    if (typeof a[field] === 'string' && typeof b[field] === 'string') {
      // Sort alphabetically
      return a[field].localeCompare(b[field]);
    } else if (typeof a[field] === 'number' && typeof b[field] === 'number') {
      // Sort numerically
      return a[field] - b[field];
    } else if (a[field] instanceof Date && b[field] instanceof Date) {
      // Sort by date
      return a[field].getTime() - b[field].getTime();
    } else {
      return 0;
    }
  });
};

export function differenceInDays(date1, date2) {
  if (!date1) return undefined;
  if (!date2) return undefined;

  date1 = date1.seconds ? date1.toDate() : new Date(date1);
  date2 = date2.seconds ? date2.toDate() : new Date(date2);

  const differenceInMs = date1.getTime() - date2.getTime();
  return Math.abs(differenceInMs / (1000 * 60 * 60 * 24));
}

export const convertToPng = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const pngFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.png'),
            {
              type: 'image/png',
            },
          );

          resolve(pngFile);
        } else {
          reject(new Error('Image conversion failed'));
        }
      }, 'image/png');
    };

    reader.readAsDataURL(file);
  });
};

export const logout = async (dispatch) => {
  dispatch(employerActions.resetState());
  dispatch(jobActions.resetState());
  dispatch(chatActions.resetState());
  dispatch(eventActions.resetState());
  dispatch(userActions.resetState());
  dispatch(userApplicationActions.resetState());
  dispatch(authActions.resetState());
  dispatch(partnerActions.resetState());
  dispatch(classActions.resetState());
  dispatch(todoActions.resetState());
  await PusherClient?.getInstance?.disconnect?.();
  localStorage.clear();
  signOut(auth);
};
