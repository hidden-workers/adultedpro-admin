import { Todo } from '../interfaces';
export interface fetchedTodo {
  completed: boolean;
  createdAt: string; // ISO string format for date
  description: string;
  dueDateTime: string | null;
  firebaseId: string;
  id: string;
  isTest: boolean;
  title: string;
  type: 'normal' | 'pending-teacher' | 'pending-student';
  updatedAt: string; // ISO string format for date
  userId: string;
  pendingUserId: string;
}

export const transformTodoDataToFirebase = (data: fetchedTodo): Todo => ({
  id: data.id,
  title: data.title,
  description: data.description,
  completed: data.completed,
  userId: data.userId,
  type: data.type,
  dateCreated: data.createdAt,
  pendingUserId: data.pendingUserId,
  dateUpdated: data.updatedAt,
  dueDateTime: data.dueDateTime,
  isTest: data.isTest,
});
