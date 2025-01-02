import { Chat } from '../interfaces';

interface fetchedChats {
  _id: '';
  id: '';
  job_id: '';
  last_message: '';
  type: '';
  participants: [];
  groupName: '';
  groupPhoto: '';
  shouldBotStopResponding: boolean;
  role: '';
  createdAt: Date;
  updatedAt: Date;
  lastMessageTimestamp: Date;
}

export function transformChatDataToFirebase(data: fetchedChats): Chat {
  const validGroupType = (type: string): 'GENERAL' | 'CLASS' => {
    if (type === 'CLASS') return 'CLASS';
    return 'GENERAL'; // Default to 'GENERAL' if type is empty or invalid
  };
  return {
    id: data?._id ?? data?.id,
    jobId: data?.job_id,
    chatType: data?.type as Chat['chatType'],
    groupType: validGroupType(data?.type),
    lastMessage: data?.last_message,
    groupName: data?.groupName,
    lastMessageTimestamp: data?.lastMessageTimestamp,
    participants: data?.participants?.map((p: any) =>
      p?.userId != null ? p?.userId : p?._id,
    ),
    participantsDetails: data?.participants,
    role: data?.role,
    shouldBotStopResponding: data?.shouldBotStopResponding,
    isGroup: data?.groupName !== '',
    dateCreated: data?.createdAt,
    dateUpdated: data?.updatedAt,
  };
}

export function transformChatDataToMongo(data: any) {
  return {
    _id: data?._id ?? data?.id,
    job_id: data?.jobId,
    type: data?.chatType,
    last_message: data?.lastMessage,
    groupName: data?.groupName,
    lastMessageTimestamp: data?.lastMessageTimestamp,
    participants: data?.participants?.map((p: any) => ({
      userId: p?._id ?? p,
    })),
    role: data?.role,
    shouldBotStopResponding: data?.shouldBotStopResponding,
    createdAt: data?.dateCreated,
    updatedAt: data?.dateUpdated,
  };
}
export function createChatDataToMongo(data: any) {
  return {
    job_id: data?.jobId === '' ? null : data?.jobId,
    type: data?.chatType,
    last_message: data?.lastMessage,
    groupName: data?.groupName,
    lastMessageTimestamp: data?.lastMessageTimestamp,
    participants: data?.participants?.map((p: any) => ({
      userId: p,
    })),
    role: data?.role,
    shouldBotStopResponding: data?.shouldBotStopResponding,
    createdAt: data?.dateCreated,
    updatedAt: data?.dateUpdated,
  };
}
