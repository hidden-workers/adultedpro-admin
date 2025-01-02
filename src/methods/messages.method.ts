import { BoardMessage } from '../interfaces';
interface MongoMessages {
  _id: '';
  firebaseId: '';
  isTest: boolean;
  description: '';
  institute_id: '';
  to: '';
  toIds: [];
  title: '';
  type: '';
  toEmails: [];
  createdAt: '';
  updatedAt: '';
}

export const transformMessageToFirebase = (data: MongoMessages) => ({
  id: data?._id,
  title: data?.title,
  description: data?.description,
  to: data?.to,
  toIds: data?.toIds,
  type: data?.type,
  partnerId: data?.institute_id,
  dateCreated: data?.createdAt,
  dateUpdated: data?.updatedAt,
  isTest: data?.isTest,
});
export const transformMessagesDataToFirebase = (data: MongoMessages[]): any[] =>
  data.map((message) => ({
    id: message?._id,
    title: message?.title,
    description: message?.description,
    to: message?.to,
    toIds: message?.toIds,
    type: message?.type,
    partnerId: message?.institute_id,
    dateCreated: message?.createdAt,
    dateUpdated: message?.updatedAt,
    isTest: message?.isTest,
  }));

export const transformAnnouncementDataToMongo = (data: BoardMessage) => ({
  firebaseId: data?.id,
  isTest: data?.isTest,
  description: data?.description,
  institute_id: data?.partnerId,
  to: data?.to,
  toIds: data?.toIds,
  title: data?.title,
  type: data?.type,
  toEmails: data?.toEmails,
});
