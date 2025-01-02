import { Modal } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Chat, Class, Job, LocalStorageAuthUser, User } from '../../interfaces';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchClasses,
  fetchClassesByInstructorId,
} from '../../store/reducers/classSlice';
import { ChatTypes, UserRolesEnum } from '../../utils/enums';
import {
  fetchStudentsOfInstitution,
  fetchUsers,
} from '../../store/reducers/userSlice';
import {
  fetchChats,
  sendMessage,
  setChat,
} from '../../store/reducers/chatSlice';

interface Props {
  open: boolean;
  setOpen: any;
  job: Job;
}

const AnnounceJobModal: React.FC<Props> = ({ open, setOpen, job }) => {
  ///////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const dropdownRef = useRef<any>();
  const { classes: fetchedClasses, allClasses: fetchedAllClasses } =
    useSelector((state: RootState) => state.class);
  const { students: fetchedStudents } = useSelector(
    (state: RootState) => state.user,
  );
  const { chats: fetchedChats } = useSelector((state: RootState) => state.chat);
  const { user, users } = useSelector((state: RootState) => state.user);
  const currentUserId = String(localStorage.getItem('userId'));
  const role = String(localStorage.getItem('Role'));
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;

  ///////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  const [message, setMessage] =
    useState(`Please check this job out. I think this is a great fit for you:
${job?.title}
${job?.employerName}`);
  const [loading, setLoading] = useState({
    submit: false,
    classes: false,
    groups: false,
    students: false,
    users: false,
  });
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [toggle, setToggle] = useState(false);
  const [type, setType] = useState<'Groups' | 'Students' | 'Classes'>('Groups');
  const [searchValue, setSearchValue] = useState('');
  const [students, setStudents] = useState<User[]>(fetchedStudents);
  const [classes, setClasses] = useState<Class[]>(
    role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses,
  );
  const [groups, setGroups] = useState<Chat[]>(
    fetchedChats?.filter((c) => c?.isGroup),
  );

  ///////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownRef?.current &&
        !dropdownRef?.current?.contains(event.target)
      ) {
        setToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    setMessage(`Please check this job out. I think this is a great fit for you:
${job?.title}
${job?.employerName}`);
  }, [job]);
  useEffect(() => {
    if (users?.length > 0) return;
    setLoading((pre) => ({ ...pre, users: true }));
    dispatch<any>(fetchUsers([])).finally(() =>
      setLoading((pre) => ({ ...pre, users: false })),
    );
  }, []);
  useEffect(() => {
    if (
      (role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses)
        ?.length > 0
    )
      return;
    setLoading((pre) => ({ ...pre, classes: true }));

    if (role === UserRolesEnum.SchoolAdmin) {
      dispatch<any>(fetchClasses(authUser?.partnerId)).finally(() =>
        setLoading((pre) => ({ ...pre, classes: false })),
      );
    } else {
      dispatch<any>(fetchClassesByInstructorId(authUser?.id)).finally(() =>
        setLoading((pre) => ({ ...pre, classes: false })),
      );
    }
  }, []);
  useEffect(() => {
    if (fetchedStudents?.length > 0) return;
    setLoading((pre) => ({ ...pre, students: true }));
    dispatch<any>(fetchStudentsOfInstitution(authUser?.partnerId)).finally(() =>
      setLoading((pre) => ({ ...pre, students: false })),
    );
  }, []);
  useEffect(() => {
    if (fetchedChats?.length > 0) return;
    setLoading((pre) => ({ ...pre, groups: true }));
    dispatch<any>(fetchChats(authUser?.id)).finally(() =>
      setLoading((pre) => ({ ...pre, groups: false })),
    );
  }, []);
  useEffect(() => {
    if (role != UserRolesEnum.SchoolAdmin) {
      const studentIds = fetchedClasses
        ?.map((c) => c?.students)
        .flat()
        .filter((s) => s);
      setStudents(fetchedStudents?.filter((s) => studentIds?.includes(s?.id)));
    }
  }, [fetchedStudents, fetchedClasses]);
  useEffect(() => {
    if (role == UserRolesEnum.SchoolAdmin) setStudents(fetchedStudents);
  }, [fetchedStudents]);
  useEffect(() => {
    setClasses(
      role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses,
    );
  }, [fetchedAllClasses, fetchedClasses]);
  useEffect(() => {
    setGroups(fetchedChats?.filter((c) => c?.isGroup));
  }, [fetchedChats]);
  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue]);
  useEffect(() => {
    setSelectedValues([]);
  }, [type]);

  ///////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const onSend = () => {
    if (!message) return toast.error('Message is missing');
    if (selectedValues.length == 0) return toast.error(`${type} are missing`);

    // let selectedIds = [], selectedMembers = []

    if (type == 'Classes') {
      const selectedClasses = (
        role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses
      )?.filter((c) => selectedValues?.includes(c?.id));
      selectedClasses.map((c) => {
        const findedGroup = fetchedChats?.find(
          (chat) => chat?.classId == c?.id,
        );
        if (findedGroup) {
          // If class group already exists
          setLoading((pre) => ({ ...pre, submit: true }));
          onSendMessage(findedGroup?.id);
        } else {
          // Create a new class group
          const classStudents = users.filter((u) =>
            c?.students?.includes(u?.id),
          );

          const newChatData: Chat = {
            id: '',
            participants: [currentUserId, ...(c?.students || [])],
            lastMessage: '',
            lastMessageTimestamp: new Date(),
            jobId: '',
            chatType: ChatTypes.Group,
            groupType: 'CLASS',
            isGroup: true,
            classId: c?.id,
            role,
            groupName: c?.name,
            shouldBotStopResponding: true,
            dateCreated: new Date(),
            dateUpdated: new Date(),
            participantsDetails: [user, ...(classStudents || [])],
          };
          setLoading((pre) => ({ ...pre, submit: true }));
          dispatch<any>(setChat(newChatData))
            .then(({ payload }) => {
              onSendMessage(payload?.id);
            })
            .catch(() => {
              toast.error('Something went wrong!');
            });
        }
      });
      onClose();
    } else if (type == 'Groups') {
      const selectedGroups = fetchedChats?.filter((c) =>
        selectedValues?.includes(c?.id),
      );
      selectedGroups.map((g) => {
        setLoading((pre) => ({ ...pre, submit: true }));
        onSendMessage(g?.id);
      });
      onClose();
    } else if (type == 'Students') {
      const selectedStudents = users?.filter((s) =>
        selectedValues?.includes(s?.id),
      );
      selectedStudents.map((s) => {
        const findedChat = fetchedChats.find((chat) => {
          return (
            chat?.participants?.includes(s?.id) &&
            chat?.participants?.length == 2
          );
        });
        if (findedChat) {
          setLoading((pre) => ({ ...pre, submit: true }));
          onSendMessage(findedChat?.id);
        } else {
          // If there's no chat with this student, create one
          const newChatData: Chat = {
            participants: [currentUserId, s?.id],
            lastMessage: '',
            lastMessageTimestamp: new Date(),
            jobId: '',
            role: role,
            chatType: ChatTypes.OneToOne,
            shouldBotStopResponding: false,
            dateCreated: new Date(),
            dateUpdated: new Date(),
            isGroup: false,
            participantsDetails: [user, s],
          };
          setLoading((pre) => ({ ...pre, submit: true }));
          dispatch<any>(setChat(newChatData))
            .then(({ payload }) => onSendMessage(payload.id))
            .catch(() => {
              toast.error('Something went wrong!');
            });
        }
      });
      onClose();
    }
  };
  const onSendMessage = (chatId?: string) => {
    if (message.trim() == '') return;

    const newMessage = {
      senderId: currentUserId,
      text: message,
      timestamp: new Date(),
      readBy: [currentUserId],
      isEmployerResponse: false,
    };

    dispatch<any>(sendMessage({ chatId: chatId, messageData: newMessage }))
      .then(() => {
        setLoading((pre) => ({ ...pre, submit: false }));
      })
      .catch(() => {
        toast.error('Failed to send message.');
      });
  };
  const onClose = () => {
    setMessage('');
    setOpen(false);
    setToggle(false);
    setType('Groups');
    setSelectedValues([]);
  };
  const onOptionChange = (
    value: string,
    type: 'students' | 'classes' | 'groups',
  ) => {
    if (value == 'all') {
      const items =
        type == 'students' ? students : type == 'groups' ? groups : classes;
      setSelectedValues((pre) =>
        pre.length == items?.length ? [] : items?.map((c) => c?.id),
      );
    } else
      setSelectedValues((pre) =>
        pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
      );
  };
  const onSearch = (value: string) => {
    if (type == 'Students') {
      let studentsToSearch = [];
      if (role == UserRolesEnum.SchoolAdmin) {
        studentsToSearch = fetchedStudents;
      } else {
        const studentIds = fetchedClasses
          ?.map((c) => c?.students)
          .flat()
          .filter((s) => s);
        studentsToSearch = fetchedStudents?.filter((s) =>
          studentIds?.includes(s?.id),
        );
      }
      setStudents(
        studentsToSearch.filter((s) =>
          s?.name?.toLowerCase()?.includes(value?.toLowerCase()),
        ),
      );
    } else if (type == 'Classes') {
      const classesToSearch =
        role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses;
      setClasses(
        classesToSearch.filter((c) =>
          c?.name?.toLowerCase()?.includes(value?.toLowerCase()),
        ),
      );
    } else if (type == 'Groups') {
      const groupsToSearch = fetchedChats?.filter((c) => c?.isGroup);
      setGroups(
        groupsToSearch.filter((g) =>
          g?.groupName?.toLowerCase()?.includes(value?.toLowerCase()),
        ),
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="overflow-y-auto max-h-[80vh] md:px-17.5 w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:py-15">
        <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Announce Job
        </h3>

        <div className="flex flex-col gap-4 mb-4 ">
          {/* Message */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="message"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Message <span className="text-red">*</span>
            </label>
            <textarea
              rows={3}
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Type */}
          <div className="w-full">
            <label
              htmlFor="type"
              className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
            >
              Type
            </label>

            <select
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              name="type"
              onChange={(e) =>
                setType(e.target.value as 'Groups' | 'Students' | 'Classes')
              }
              value={type}
              id="type"
            >
              <option value="Groups">Groups</option>
              <option value="Students">Students</option>
              <option value="Classes">Classes</option>
            </select>
          </div>

          {type == 'Groups' && (
            <div className="">
              <label className="mb-2.5 block text-black font-medium dark:text-white text-start">
                Groups <span className="text-red">*</span>
              </label>
              <div className="flex flex-col gap-2.5">
                <div ref={dropdownRef} className="w-full relative ">
                  <div
                    onClick={() => setToggle((pre) => !pre)}
                    className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    Groups
                  </div>
                  {toggle && (
                    <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto  ">
                      <div className="p-2 bg-gray ">
                        <input
                          type="text"
                          placeholder="Search groups"
                          value={searchValue}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      </div>
                      {role == UserRolesEnum.SchoolAdmin && (
                        <div>
                          <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                            <input
                              className="sr-only"
                              type="checkbox"
                              name="recommend"
                              onChange={() => onOptionChange('all', 'groups')}
                            />
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues?.length == groups?.length ? 'border-primary' : 'border-body'}`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues?.length == groups?.length ? 'flex' : 'hidden'}`}
                              />
                            </span>
                            All
                          </label>
                        </div>
                      )}
                      {groups?.map((option: Chat, index: number) => (
                        <div key={index}>
                          <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                            <input
                              className="sr-only"
                              type="checkbox"
                              name="recommend"
                              onChange={() =>
                                onOptionChange(option?.id, 'groups')
                              }
                            />
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues.includes(option?.id) ? 'flex' : 'hidden'}`}
                              />
                            </span>
                            {option?.groupName}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                {selectedValues.map((selected, i) => (
                  <span
                    key={i}
                    className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                  >
                    {groups?.find((s) => s?.id == selected)?.groupName}
                    <X
                      onClick={() =>
                        setSelectedValues((pre) =>
                          pre.filter((p) => p != selected),
                        )
                      }
                      className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {type == 'Classes' && (
            <div className="">
              <label className="mb-2.5 block text-black font-medium dark:text-white text-start">
                Classes <span className="text-red">*</span>
              </label>
              <div className="flex flex-col gap-2.5">
                <div ref={dropdownRef} className="w-full relative ">
                  <div
                    onClick={() => setToggle((pre) => !pre)}
                    className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    Select Classes
                  </div>
                  {toggle && (
                    <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto  ">
                      <div className="p-2 bg-gray ">
                        <input
                          type="text"
                          placeholder="Search classes"
                          value={searchValue}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      </div>
                      {role == UserRolesEnum.SchoolAdmin && (
                        <div>
                          <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                            <input
                              className="sr-only"
                              type="checkbox"
                              name="recommend"
                              onChange={() => onOptionChange('all', 'classes')}
                            />
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues?.length == classes?.length ? 'border-primary' : 'border-body'}`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues?.length == classes?.length ? 'flex' : 'hidden'}`}
                              />
                            </span>
                            All
                          </label>
                        </div>
                      )}
                      {classes.map((c: Class, index: number) => (
                        <div key={index}>
                          <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                            <input
                              className="sr-only"
                              type="checkbox"
                              name="recommend"
                              onChange={() => onOptionChange(c?.id, 'classes')}
                            />
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues.includes(c?.id) ? 'border-primary' : 'border-body'}`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues.includes(c?.id) ? 'flex' : 'hidden'}`}
                              />
                            </span>
                            {c?.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                {selectedValues.map((selected, i) => (
                  <span
                    key={i}
                    className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                  >
                    {classes.find((s) => s?.id == selected)?.name}
                    <X
                      onClick={() =>
                        setSelectedValues((pre) =>
                          pre.filter((p) => p != selected),
                        )
                      }
                      className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {type == 'Students' && (
            <div className="">
              <label className="mb-2.5 block text-black font-medium dark:text-white text-start">
                Students <span className="text-red">*</span>
              </label>
              <div className="flex flex-col gap-2.5">
                <div ref={dropdownRef} className="w-full relative ">
                  <div
                    onClick={() => setToggle((pre) => !pre)}
                    className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    Students
                  </div>
                  {toggle && (
                    <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto  ">
                      <div className="p-2 bg-gray ">
                        <input
                          type="text"
                          placeholder="Search students"
                          value={searchValue}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      </div>
                      {role == UserRolesEnum.SchoolAdmin && (
                        <div>
                          <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                            <input
                              className="sr-only"
                              type="checkbox"
                              name="recommend"
                              onChange={() => onOptionChange('all', 'students')}
                            />
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues?.length == students?.length ? 'border-primary' : 'border-body'}`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues?.length == students?.length ? 'flex' : 'hidden'}`}
                              />
                            </span>
                            All
                          </label>
                        </div>
                      )}
                      {students
                        ?.filter((s) => s?.approvedByAdmin)
                        ?.map((option: User, index: number) => (
                          <div key={index}>
                            <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                              <input
                                className="sr-only"
                                type="checkbox"
                                name="recommend"
                                onChange={() =>
                                  onOptionChange(option?.id, 'students')
                                }
                              />
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues.includes(option?.id) ? 'flex' : 'hidden'}`}
                                />
                              </span>
                              {option?.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                {selectedValues.map((selected, i) => (
                  <span
                    key={i}
                    className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                  >
                    {students?.find((s) => s?.id == selected)?.name}
                    <X
                      onClick={() =>
                        setSelectedValues((pre) =>
                          pre.filter((p) => p != selected),
                        )
                      }
                      className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                    />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="-mx-3 flex flex-wrap gap-y-4">
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.submit}
              onClick={onClose}
              className="block w-full rounded border border-stroke bg-gray disabled:cursor-not-allowed p-3 text-center font-medium text-black transition dark:border-strokedark dark:bg-meta-4 "
            >
              Cancel
            </button>
          </div>
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.submit}
              onClick={onSend}
              className="block w-full rounded border border-black bg-black hover:bg-black/90 disabled:bg-black/90 disabled:cursor-not-allowed p-3 text-center font-medium text-white transition "
            >
              {loading.submit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AnnounceJobModal;
