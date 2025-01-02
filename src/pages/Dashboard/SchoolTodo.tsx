import 'flatpickr/dist/flatpickr.min.css';
import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout.tsx';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  deleteTodo,
  fetchTodoes,
  // getUserTodos,
  updateTodo,
} from '../../store/reducers/todoSlice.ts';
import { IconButton, Tooltip } from '@mui/material';
import { Plus } from 'lucide-react';
import CreateTodo from '../../components/Modals/CreateTodo.tsx';
import UpdateTodo from '../../components/Modals/UpdateTodo.tsx';
import { Todo } from '../../interfaces/index.ts';
import { Check, Pencil, Trash } from 'lucide-react';
import CLoader from '../../common/CLoader.tsx';
import {
  fetchUserById,
  updateMongoUser,
} from '../../store/reducers/userSlice.ts';
import { extractDateTimeFromTimestamp } from '../../utils/functions.ts';
import ReminderTicker from './TodoReminder.tsx';
import useMobile from '../../hooks/useMobile';

const SchoolTodo: React.FC = () => {
  const { todoes: fetchedTodoes } = useSelector(
    (state: RootState) => state.todo,
  );
  const dispatch = useDispatch();

  const [todoes, setTodoes] = useState(fetchedTodoes);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [clickedItemId, setClickedItemId] = useState({
    markAsDone: '',
    delete: '',
  });
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState('');
  const [isMobile] = useMobile();
  ///////////////////////////////////////////////////// USE EFFECTS ////////////////////////////////////////////////////////
  useEffect(() => {
    if (fetchedTodoes?.length > 0) return;
    setLoading(true);
    dispatch<any>(fetchTodoes()).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (fetchedTodoes?.length > 0) {
      const sortedTodoes = [...fetchedTodoes].sort((a, b) => {
        return (
          new Date(b?.dateCreated as string).getTime() -
          new Date(a?.dateCreated as string).getTime()
        );
      });
      setTodoes(sortedTodoes);
    }
  }, [fetchedTodoes]);

  const onOpenCreateModal = () => {
    setSelectedTodo(null);
    setOpenCreateModal(true);
  };
  const onOpenUpdateModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setOpenUpdateModal(true);
  };
  const onMarkAsDone = (todo: Todo) => {
    setClickedItemId((pre) => ({ ...pre, markAsDone: todo?.id }));
    dispatch<any>(updateTodo({ ...todo, completed: true })).finally(() => {
      setClickedItemId((pre) => ({ ...pre, message: '' }));
    });
  };
  const onDelete = (todo: Todo) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this todo?',
    );

    if (isConfirmed) {
      setClickedItemId((pre) => ({ ...pre, delete: todo?.id }));
      dispatch<any>(deleteTodo(todo?.id)).then(() => {
        setClickedItemId((pre) => ({ ...pre, delete: '' }));
      });
    }
  };

  const onApprove = (userId: string) => {
    setApproving(userId);
    dispatch<any>(fetchUserById(userId)).then(({ payload }) => {
      if (!payload) return;
      const newObj = { ...payload, approvedByAdmin: true };
      dispatch<any>(updateMongoUser({ userId: newObj.id, userData: newObj }))
        .then(() => {
          dispatch<any>(
            deleteTodo(
              fetchedTodoes.find((todo) => todo.pendingUserId == userId)?.id,
            ),
          );
        })
        .finally(() => setApproving(''));
    });
  };
  return (
    <DefaultLayout>
      <CreateTodo
        open={openCreateModal}
        setOpen={setOpenCreateModal}
        todo={selectedTodo}
      />
      <UpdateTodo
        open={openUpdateModal}
        setOpen={setOpenUpdateModal}
        todo={selectedTodo}
      />
      <ReminderTicker todos={todoes} />
      <div className="flex flex-col gap-2">
        <div className="mb-4">
          <Breadcrumb pageName="Todo" />
          <p className={`${isMobile ? 'text-[14px]' : 'text-[17px]'}`}>
            Your todo tasks will appear here.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex w-full items-center justify-end">
            <Tooltip title="Create Todo" placement="top">
              <IconButton type="button" onClick={onOpenCreateModal}>
                <Plus />
              </IconButton>
            </Tooltip>
          </div>

          <div className="grid w-full grid-cols-12 gap-4 md:gap-4">
            <div className="col-span-12 space-y-4 xl:col-span-12 ">
              <div className="overflow-hidden rounded-[10px]">
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-[1170px]">
                    <div className="grid grid-cols-12 bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7">
                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                          Title
                        </h5>
                      </div>
                      <div className="col-span-3">
                        <h5 className="text-center font-bold text-base text-[#1C2434] dark:text-bodydark">
                          Description
                        </h5>
                      </div>
                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-base text-[#1C2434] dark:text-bodydark">
                          Due
                        </h5>
                      </div>
                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-base text-[#1C2434] dark:text-bodydark">
                          Status
                        </h5>
                      </div>
                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-base text-[#1C2434] dark:text-bodydark">
                          Actions
                        </h5>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-boxdark">
                      {loading ? (
                        <div className="flex h-[17rem] w-full items-center justify-center">
                          <CLoader size="lg" />
                        </div>
                      ) : todoes?.length == 0 ? (
                        <div className="flex h-[17rem] w-full items-center justify-center">
                          <p className="text-3xl font-semibold ">No Todo</p>
                        </div>
                      ) : (
                        todoes.map((todo: Todo, index: number) => {
                          return (
                            <div
                              key={index}
                              className={`grid grid-cols-12 border-t text-sm border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7
                                  ${
                                    !todo.completed &&
                                    (todo?.dueDateTime?.seconds
                                      ? todo?.dueDateTime?.toDate()
                                      : new Date(todo?.dueDateTime)) <
                                      new Date() &&
                                    'bg-red/10'
                                  }
                                  `}
                            >
                              <div className="col-span-2">
                                <p className="text-center text-[#637381] text-sm dark:text-bodydark">
                                  {todo?.title}
                                </p>
                              </div>
                              <div className="col-span-3">
                                <p className="text-center text-[#637381] text-sm dark:text-bodydark">
                                  {todo?.description}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-center text-[#637381] text-sm dark:text-bodydark">
                                  {todo?.dueDateTime
                                    ? extractDateTimeFromTimestamp(
                                        todo?.dueDateTime,
                                      )?.date
                                    : ''}
                                  {'\n'}{' '}
                                  {todo?.dueDateTime
                                    ? extractDateTimeFromTimestamp(
                                        todo?.dueDateTime,
                                      )?.time
                                    : ''}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-center text-[#637381] text-sm dark:text-bodydark">
                                  {todo.completed ? 'Completed' : 'Pending'}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <div className="flex w-full items-center text-sm justify-center">
                                  {todo.type == 'pending-student' ||
                                  todo.type == 'pending-teacher' ? (
                                    <div className="flex w-full justify-end">
                                      <button
                                        onClick={() =>
                                          onApprove(todo?.pendingUserId)
                                        }
                                        disabled={
                                          approving == todo?.pendingUserId
                                        }
                                        className="w-max-content flex text-sm h-fit items-center justify-center rounded-md bg-primary px-2 py-1 text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-primary/75"
                                      >
                                        {approving == todo?.pendingUserId
                                          ? 'Loading...'
                                          : 'Approve'}
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {!todo.completed && (
                                        <Tooltip
                                          title="Mark As Completed"
                                          placement="top"
                                        >
                                          <IconButton
                                            type="button"
                                            onClick={() => onMarkAsDone(todo)}
                                          >
                                            {clickedItemId?.markAsDone ==
                                            todo?.id ? (
                                              <CLoader size="xs" />
                                            ) : (
                                              <Check className="h-4 w-4" />
                                            )}
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      {!todo.completed &&
                                        (todo?.dueDateTime?.seconds
                                          ? todo?.dueDateTime.toDate()
                                          : new Date(todo?.dueDateTime)) >
                                          new Date() && (
                                          <Tooltip
                                            title="Update"
                                            placement="top"
                                          >
                                            <IconButton
                                              type="button"
                                              onClick={() =>
                                                onOpenUpdateModal(todo)
                                              }
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </IconButton>
                                          </Tooltip>
                                        )}

                                      <Tooltip title="Delete" placement="top">
                                        <IconButton
                                          type="button"
                                          onClick={() => onDelete(todo)}
                                        >
                                          {clickedItemId?.delete == todo?.id ? (
                                            <CLoader size="xs" />
                                          ) : (
                                            <Trash className="h-4 w-4" />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SchoolTodo;
