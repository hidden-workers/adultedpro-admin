import { EmailData, LocalStorageAuthUser, Todo } from '../../interfaces';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import CLoader from '../../common/CLoader';
import { RootState } from '../../store/store';
import {
  deleteTodo,
  fetchTodoes,
  setTodo,
} from '../../store/reducers/todoSlice';
import { IconButton, Tooltip } from '@mui/material';
import { Check, Pencil, Trash } from 'lucide-react';
import CreateTodo from '../Modals/CreateTodo';
import { fetchUserById, updateUser } from '../../store/reducers/userSlice';
import {
  findEmailsByEmailAndTitle,
  sendEmail,
} from '../../store/reducers/emailSlice';

const DueTodos = () => {
  /////////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const { todoes: fetchedTodoes } = useSelector(
    (state: RootState) => state.todo,
  );
  const dispatch = useDispatch();
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;

  /////////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////////
  const [approving, setApproving] = useState('');
  const [loading, setLoading] = useState(false);
  const [dueTodoes, setDueTodoes] = useState(fetchedTodoes);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [clickedItemId, setClickedItemId] = useState({
    markAsDone: '',
    delete: '',
  });

  /////////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////////
  useEffect(() => {
    if (fetchedTodoes?.length > 0) return;
    setLoading(true);
    dispatch<any>(fetchTodoes(authUser?.id)).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const now = new Date();

    const lastThreeDays = new Date(now);
    lastThreeDays.setDate(lastThreeDays.getDate() - 3);

    // LAST THREE DAYS
    const lastDueTodoes = fetchedTodoes?.filter((todo) => {
      const dueDate = todo?.dueDateTime?.seconds
        ? new Date(todo?.dueDateTime?.seconds * 1000)
        : new Date(todo?.dueDateTime);
      return dueDate < new Date() && dueDate > lastThreeDays;
    });
    setDueTodoes(lastDueTodoes);

    // ONE DAY AHEAD
    const oneDayAhead = new Date(now);
    oneDayAhead.setDate(now.getDate() + 1);

    const oneDaysAheadTodoes = fetchedTodoes?.filter((todo) => {
      const dueDate = todo?.dueDateTime?.seconds
        ? new Date(todo?.dueDateTime?.seconds * 1000)
        : new Date(todo?.dueDateTime);
      return dueDate > new Date() && dueDate < oneDayAhead;
    });

    // THREE DAYS AHEAD
    const threeDaysAhead = new Date(now);
    threeDaysAhead.setDate(now.getDate() + 3);

    const threeDaysAheadTodoes = fetchedTodoes?.filter((todo) => {
      const dueDate = todo?.dueDateTime?.seconds
        ? new Date(todo?.dueDateTime?.seconds * 1000)
        : new Date(todo?.dueDateTime);
      return dueDate > new Date() && dueDate < threeDaysAhead;
    });

    // Sending reminder for 1 and 3 days ahead todoes
    [...oneDaysAheadTodoes, ...threeDaysAheadTodoes].map((todo) => {
      dispatch<any>(
        findEmailsByEmailAndTitle({
          email: authUser?.email,
          title: todo?.title,
        }),
      ).then(({ payload }) => {
        // If no reminder sent, send one.
        if (payload.length == 0) {
          const emailData: EmailData = {
            dateCreated: new Date(),
            dateUpdated: new Date(),
            template: {
              data: todo,
              name: 'due-soon-todo',
            },
            to: authUser?.email,
          };
          dispatch<any>(sendEmail(emailData));
        }
      });
    });
  }, [fetchedTodoes]);

  /////////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onMarkAsDone = (todo: Todo) => {
    setClickedItemId((pre) => ({ ...pre, markAsDone: todo?.id }));
    dispatch<any>(setTodo({ ...todo, completed: true })).finally(() => {
      setClickedItemId((pre) => ({ ...pre, message: '' }));
    });
  };
  const onDelete = (todo: Todo) => {
    setClickedItemId((pre) => ({ ...pre, delete: todo?.id }));
    dispatch<any>(deleteTodo(todo?.id)).then(() => {
      setClickedItemId((pre) => ({ ...pre, delete: '' }));
    });
  };
  const onOpenUpdateModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setOpenCreateModal(true);
  };
  const onApprove = (userId: string) => {
    setApproving(userId);
    dispatch<any>(fetchUserById(userId)).then(({ payload }) => {
      if (!payload) return;
      const newObj = { ...payload, approvedByAdmin: true };
      dispatch<any>(updateUser(newObj))
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
    <>
      <CreateTodo
        open={openCreateModal}
        setOpen={setOpenCreateModal}
        todo={selectedTodo}
      />

      <div className="relative h-full min-h-[12rem] w-full overflow-y-auto rounded-sm border border-stroke bg-white px-3 pb-2.5 pt-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-5.5 xl:pb-1">
        <div className="mb-4 flex items-center justify-between ">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Due Todos
          </h4>
        </div>

        <div className="grid w-full grid-cols-12 gap-4 md:gap-4">
          <div className="col-span-12 space-y-4 xl:col-span-12 ">
            <div className="overflow-hidden rounded-[10px]">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  <div className="grid grid-cols-12 bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7">
                    <div className="col-span-3">
                      <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                        Title
                      </h5>
                    </div>
                    <div className="col-span-5">
                      <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                        Descriotion
                      </h5>
                    </div>
                    <div className="col-span-2">
                      <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                        Due
                      </h5>
                    </div>
                    <div className="col-span-2">
                      <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                        Actions
                      </h5>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-boxdark">
                    {loading ? (
                      <div className="flex h-[12rem] w-full items-center justify-center ">
                        <CLoader size="lg" />
                      </div>
                    ) : dueTodoes?.length == 0 ? (
                      <div className="flex h-[12rem] w-full items-center justify-center">
                        <p className="text-3xl font-semibold ">No Due Todo</p>
                      </div>
                    ) : (
                      dueTodoes.map((todo: Todo, index: number) => {
                        return (
                          <div
                            key={index}
                            className={`grid grid-cols-12 border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7`}
                          >
                            <div className="col-span-3">
                              <p className="text-center text-[#637381] dark:text-bodydark">
                                {todo?.title}
                              </p>
                            </div>
                            <div className="col-span-5">
                              <p className="text-center text-[#637381] dark:text-bodydark">
                                {todo?.description}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-center text-[#637381] dark:text-bodydark">
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
                              <div className="flex w-full items-center justify-center">
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
                                      className="w-max-content flex h-fit items-center justify-center rounded-md bg-primary px-2 py-1 text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-primary/75"
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
                                    <Tooltip title="Update" placement="top">
                                      <IconButton
                                        type="button"
                                        onClick={() => onOpenUpdateModal(todo)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </IconButton>
                                    </Tooltip>
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
    </>
  );
};

export default DueTodos;
