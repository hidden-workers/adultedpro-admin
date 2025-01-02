import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  doc,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './src/services/firebase';

///////////////// this is script for the chats to delete the duplicate data
// export const consolidateChats = async () => {

//   const chatsRef = collection(db, 'chats');
//   const chatsSnapshot = await getDocs(chatsRef);

//   const allChats = await Promise.all(
//     chatsSnapshot.docs.map(async (chatDoc) => {
//       const chatData = chatDoc.data();
//       const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
//       const messagesSnapshot = await getDocs(messagesRef);

//       const messages = messagesSnapshot.docs.map((msgDoc) => ({
//         id: msgDoc.id,
//         ...msgDoc.data(),
//       }));

//       return {
//         id: chatDoc.id,
//         ...chatData,
//         messages,
//       };
//     }),
//   );

//   const participantMap: { [key: string]: any[] } = {};

//   allChats.forEach((chat: any) => {

//     let participantIds = '';

//     if (chat.participantsDetails && Array.isArray(chat.participantsDetails)) {

//       participantIds = chat.participantsDetails
//         .map((p: any) => p.id.toString())
//         .sort()
//         .join(',');
//     } else if (chat.participants && Array.isArray(chat.participants)) {
//       participantIds = chat.participants.sort().join(',');
//     }

//     if (participantIds) {
//       if (!participantMap[participantIds]) {
//         participantMap[participantIds] = [];
//       }
//       participantMap[participantIds].push(chat);
//     }
//   });

//   const chatIdsToDelete = new Set<string>();

//   for (const ids in participantMap) {
//     const chatGroup = participantMap[ids];

//     if (chatGroup.length > 1) {
//       const firstChat = chatGroup[0];
//       const messagesToConsolidate: any[] = [];

//       for (let i = 1; i < chatGroup.length; i++) {
//         const chatToDelete = chatGroup[i];
//         messagesToConsolidate.push(...chatToDelete.messages);
//         chatIdsToDelete.add(chatToDelete.id); // Mark for deletion
//       }

//       const uniqueMessages = Array.from(
//         new Set(messagesToConsolidate.map((msg) => msg.id)),
//       ).map((id) => messagesToConsolidate.find((msg) => msg.id === id)!);

//       // const firstChatRef = doc(db, 'chats', firstChat.id);
//       // await updateDoc(firstChatRef, {
//       //   messages: uniqueMessages,
//       // });

//       const messagesRef = collection(db, 'chats', firstChat.id, 'messages');
//       for (const message of uniqueMessages) {
//         const messageRef = doc(messagesRef, message.id);
//         await setDoc(messageRef, message);
//       }
//     }
//   }
//   for (const chatId of chatIdsToDelete) {
//     await deleteDoc(doc(db, 'chats', chatId));
//     console.log(`Deleted chat with ID: ${chatId}`);
//   }

//   console.log('Consolidation complete. Chats and messages have been updated.');
// }

// Run the script
// consolidateChats().catch(console.error);

// script to add user for employer
export const createUserFromEmployer = async (employer) => {
  try {
    // Step 1: Check if employer.userId exists
    if (employer.userId && employer.userId !== '') {
      return;
    }

    // Step 2: Get program from programs collection based on employer's program name
    let programData = null;
    if (employer.program) {
      const programsRef = collection(db, 'programs');
      const programsQuery = query(
        programsRef,
        where('name', '==', employer.program),
      );
      const programSnapshot = await getDocs(programsQuery);

      if (!programSnapshot.empty) {
        programData = programSnapshot.docs[0].data();
      }
    }

    // console.log('employer name in here', employer,  programData)
    // Step 3: Create a new user with the specified fields
    const newUserId = doc(collection(db, 'users')).id; // Generate a new document ID for the user
    const currentDate = new Date().toISOString();
    const newUserData = {
      email: employer?.email,
      dateCreated: currentDate,
      dateUpdated: currentDate,
      addressLine1: employer?.addressLine1 ?? '',
      addressLine2: employer?.addressLine2 ?? '',
      city: employer?.city ?? '',
      country: employer?.country ?? '',
      bio: employer?.bio ?? '',
      name: employer?.contactName
        ? employer?.contactName
        : (employer?.name ?? ''),
      program: programData || {}, // Program object fetched from programs collection
      role: employer?.role || [],
      partnerId: employer?.partnerId ?? '',
      state: employer?.state ?? '',
      tagLine: employer?.tagLine ?? '',
      status: employer?.status ?? '',
      zipCode: employer?.zipCode ?? '',
      visitedBy: employer?.visitedBy || [],
      photoUrl: employer?.photoUrl || '',
      phone: employer?.contactNumber ?? '',
      // Missing fields with default values
      approvedByAdmin: true,
      lastSignedIn: currentDate,
      interesetedIn: '',
      isLegalTermsAccepted: false,
      isTest: '',
      isEmployer: true,
    };

    // Save the new user to Firestore

    await setDoc(doc(db, 'users', newUserId), {
      ...newUserData,
      id: newUserId,
    });

    // Step 4: Update the employer document to include the new userId
    const employerRef = doc(db, 'employers', employer.id);
    await updateDoc(employerRef, {
      userId: newUserId,
    });
  } catch (error) {
    console.error('Error creating user or updating employer:', error);
  }
};

// createUserForEmployer(exampleEmployer);
/////////////// get all users and run the script once for all

async function createUserForAllEmployers() {
  try {
    const employersRef = collection(db, 'employers');
    const employersSnapshot = await getDocs(employersRef);

    for (const employerDoc of employersSnapshot.docs) {
      const employer = employerDoc.data();

      let programData = null;
      if (employer.program) {
        const programsRef = collection(db, 'programs');
        const programsQuery = query(
          programsRef,
          where('name', '==', employer.program),
        );
        const programSnapshot = await getDocs(programsQuery);

        if (!programSnapshot.empty) {
          programData = programSnapshot.docs[0].data();
        }
      }

      const newUserId = doc(collection(db, 'users')).id; // Generate a new document ID for the user
      const currentDate = new Date().toISOString();

      const newUserData = {
        email: employer?.email,
        dateCreated: currentDate,
        dateUpdated: currentDate,
        addressLine1: employer?.addressLine1 ?? '',
        addressLine2: employer?.addressLine2 ?? '',
        city: employer?.city ?? '',
        country: employer?.country ?? '',
        bio: employer?.bio ?? '',
        name: employer?.contactName
          ? employer?.contactName
          : (employer?.name ?? ''),
        program: programData || {}, // Program object fetched from programs collection
        role: employer?.role || [],
        partnerId: employer?.partnerId ?? '',
        state: employer?.state ?? '',
        tagLine: employer?.tagLine ?? '',
        status: employer?.status ?? '',
        zipCode: employer?.zipCode ?? '',
        visitedBy: employer?.visitedBy || [],
        photoUrl: employer?.photoUrl || '',
        phone: employer?.contactNumber ?? '',
        // Missing fields with default values
        approvedByAdmin: true,
        lastSignedIn: currentDate,
        interesetedIn: '',
        isLegalTermsAccepted: false,
        isTest: '',
        isEmployer: true,
      };
      // Save the new user to Firestore
      await setDoc(doc(db, 'users', newUserId), newUserData);

      // Step 5: Update the employer document to include the new userId
      const employerRef = doc(db, 'employers', employerDoc.id);
      await updateDoc(employerRef, {
        userId: newUserId,
      });
    }
  } catch (error) {
    console.error('Error processing employers:', error);
  }
}

// createUserForAllEmployers().catch(console.error);

/////////duplicate employers
export const removeDuplicateEmployers = async () => {
  try {
    // Step 1: Get all employers from the Firestore 'employers' collection
    const employersRef = collection(db, 'employers');
    const employersSnapshot = await getDocs(employersRef);

    // Step 2: Create a map to track duplicates based on branchLocation, zipCode, city, and name
    const duplicateMap: { [key: string]: any[] } = {};

    employersSnapshot.docs.forEach((employerDoc) => {
      const employer = employerDoc.data();
      const branchLocation = employer.branchLocation;
      const zipCode = employer.zipCode;
      const city = employer.city;
      const name = employer.name;

      // Check if each field exists and build the unique key accordingly
      const keyParts = [];
      if (branchLocation) keyParts.push(branchLocation);
      if (zipCode) keyParts.push(zipCode);
      if (city) keyParts.push(city);
      if (name) keyParts.push(name);

      // If none of the fields exist, skip this employer
      if (keyParts.length === 0) {
        return;
      }

      // Create a unique key by joining the available parts
      const uniqueKey = keyParts.join('-');

      // Add the employer to the map
      if (!duplicateMap[uniqueKey]) {
        duplicateMap[uniqueKey] = [];
      }
      duplicateMap[uniqueKey].push({
        id: employerDoc.id,
        ...employer,
      });
    });

    // Step 3: Loop through the map and keep only the first record, delete the rest
    for (const employers of Object.values(duplicateMap)) {
      if (employers.length > 1) {
        // Keep the first record and delete the rest
        const [firstEmployer, ...duplicates] = employers;

        for (const duplicate of duplicates) {
          const employerRef = doc(db, 'employers', duplicate.id);
          await deleteDoc(employerRef);
          console.log(`Deleted duplicate employer with ID: ${duplicate.id}`);
        }
      }
    }

    console.log('Duplicate employers removed successfully');
  } catch (error) {
    console.error('Error removing duplicate employers:', error);
  }
};

// Run the script
// getDuplicateEmployers().catch(console.error);
