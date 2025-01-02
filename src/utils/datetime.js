export const formatDate = (timestamp) => {
  if (timestamp?.seconds) {
    const date = new Date(
      timestamp?.seconds * 1000 + timestamp?.nanoseconds / 1000000,
    );
    return date.toLocaleDateString();
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};
// export const parseDate = (date) => {
//   if (typeof date === 'string') {
//     // Handle ISO 8601 string
//     return new Date(date);
//   } else if (typeof date === 'object') {
//     if (date.seconds !== undefined) {
//       // Handle Firestore Timestamp object with seconds and nanoseconds
//       return new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
//     } else if (date.nanoseconds !== undefined) {
//       // Handle Firestore Timestamp object with nanoseconds (if seconds are missing)
//       return new Date(date.nanoseconds / 1000000);
//     }
//   }
//   return new Date(0); // Default to epoch if date format is not recognized
// };
export const parseDate = (date) => {
  if (date instanceof Date) {
    // If it's already a JavaScript Date object, return it directly
    return date;
  } else if (typeof date === 'string') {
    // Check if it's a valid ISO 8601 date string (e.g., "2024-11-06T11:30:00.000Z")
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  } else if (typeof date === 'object') {
    if (date.seconds !== undefined) {
      // Handle Firestore Timestamp object with seconds and nanoseconds
      return new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
    } else if (date.nanoseconds !== undefined) {
      // Handle Firestore Timestamp object with nanoseconds only
      return new Date(date.nanoseconds / 1000000);
    }
  }
  // Return an invalid date fallback if no valid format was matched
  return new Date(0);
};

export default parseDate;
