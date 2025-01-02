import { Modal } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Chat, Class, LocalStorageAuthUser, User } from '../../interfaces';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { setChat, setCurrentChatSlice } from '../../store/reducers/chatSlice';
import { getOtherUserDetail } from '../../utils/functions';
import { useStateContext } from '../../context/useStateContext';
import {
  fetchClasses,
  fetchClassesByInstructorId,
} from '../../store/reducers/classSlice';
import { ChatTypes, UserRolesEnum } from '../../utils/enums';
import { fetchEmployers } from '../../store/reducers/employersSlice';
import { fetchUsers } from '../../store/reducers/userSlice';

interface Props {
  open: boolean;
  setOpen: any;
  chat?: Chat;
}

const AddMembersToGroupChat: React.FC<Props> = ({ open, setOpen, chat }) => {
  ///////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const studentsRef = useRef();
  const { students } = useSelector((state: RootState) => state.user);
  const { classes: fetchedClasses, allClasses: fetchedAllClasses } =
    useSelector((state: RootState) => state.class);
  const currentUserId = String(localStorage.getItem('userId'));
  const role = String(localStorage.getItem('Role'));
  const { user } = useSelector((state: RootState) => state.user);
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const { setSelectedChat } = useStateContext();
  const mongoUserId = localStorage.getItem('mongoUserId');
  ///////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  const [name, setName] = useState('');
  const [loading, setLoading] = useState({ chat: false, classes: false });
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [toggle, setToggle] = useState(false);
  const [type, setType] = useState<'GENERAL' | 'CLASS'>(
    chat?.groupType || 'GENERAL',
  );
  const [classes, setClasses] = useState<Class[]>(fetchedClasses);

  ///////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchEmployers());
    dispatch<any>(fetchUsers([]));
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        studentsRef?.current &&
        !studentsRef?.current?.contains(event.target)
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
    if (chat) {
      setName(chat?.groupName);
      setSelectedValues(chat.participants.filter((p) => p != user?.id));
      setType(chat?.groupType);
      setSelectedClassId(chat?.classId || '');
    }
  }, [chat, open]);
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
    setClasses(
      role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses,
    );
  }, [fetchedAllClasses, fetchedClasses]);

  ///////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const onCreate = () => {
    if (!name) return toast.error('Name is missing');
    if (type == 'GENERAL' && selectedValues.length == 0)
      return toast.error('Members are missing');
    if (type == 'CLASS' && !selectedClassId)
      return toast.error('Please select a class.');

    let selectedIds = [],
      selectedMembers = [];
    if (type == 'CLASS') {
      selectedIds = classes?.find((c) => c?.id == selectedClassId)?.students;
      selectedMembers = students?.filter((student) =>
        selectedIds?.includes(student?.id),
      );
    } else {
      selectedIds = selectedValues;
      selectedMembers = students?.filter((student) =>
        selectedIds?.includes(student?.id),
      );
    }

    const newChatData: Chat = {
      id: chat ? chat?.id : '',
      participants: [currentUserId, ...(selectedIds || [])],
      lastMessage: '',
      lastMessageTimestamp: new Date(),
      jobId: '',
      chatType: type == 'CLASS' ? ChatTypes.Class : ChatTypes.Group,
      groupType: type,
      classId: selectedClassId,
      role,
      groupName: name,
      shouldBotStopResponding: true,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      participantsDetails: [user, ...selectedMembers],
      isGroup: true,
      isTest: false,
    };

    setLoading((pre) => ({ ...pre, chat: true }));
    dispatch<any>(setChat(newChatData))
      .then((response) => {
        if (setChat.fulfilled.match(response)) {
          const otherUser = getOtherUserDetail(
            response.payload.participants,
            mongoUserId,
          );
          localStorage.setItem('lastChat', response.payload?.id);
          setSelectedChat({ ...response.payload, otherUser });
          dispatch(setCurrentChatSlice({ ...response.payload, otherUser }));
          onClose();
        } else {
          toast.error('Something went wrong!');
          console.error('Failed to create chat:', response.error);
        }
      })
      .catch((error) => {
        console.error('Failed to dispatch setChat action:', error);
      })
      .finally(() => {
        setLoading((pre) => ({ ...pre, chat: false }));
      });
  };
  const onClose = () => {
    setName('');
    setOpen(false);
    setToggle(false);
    setType('GENERAL');
    setSelectedClassId('');
    setSelectedValues([]);
  };
  const onOptionChange = (value: string) => {
    setSelectedValues((pre) =>
      pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:py-15">
        <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Create Group
        </h3>

        <div className="flex flex-col gap-4 mb-4 ">
          {/* Group Name */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="name"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Group Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group Name"
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
              onChange={(e) => setType(e.target.value as 'GENERAL' | 'CLASS')}
              value={type}
              id="type"
            >
              <option value="GENERAL">General</option>
              <option value="CLASS">Class</option>
            </select>
          </div>
          {/* Select Members */}
          {type == 'GENERAL' && (
            <div className="">
              <label
                htmlFor="member"
                className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
              >
                Select Member <span className="text-red">*</span>
              </label>
              <div className="flex flex-col gap-2.5">
                <div ref={studentsRef} className="w-full relative ">
                  <div
                    onClick={() => setToggle((pre) => !pre)}
                    className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    Members
                  </div>
                  {toggle && (
                    <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto ">
                      {students.map((option: User, index: number) => (
                        <div key={index}>
                          <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                            <input
                              className="sr-only"
                              type="checkbox"
                              name="recommend"
                              onChange={() => onOptionChange(option?.id)}
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
                    {students.find((s) => s?.id == selected)?.name}
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
          {type == 'CLASS' && (
            <div className="w-full">
              <label
                htmlFor="selectedClassId"
                className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
              >
                Select Class <span className="text-red">*</span>
              </label>
              <select
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                name="selectedClassId"
                onChange={(e) => setSelectedClassId(e.target.value)}
                value={selectedClassId}
                id="selectedClassId"
              >
                <option value="">Select Class</option>
                {loading.classes && <option value="">Loading...</option>}
                {classes.map((c, index) => (
                  <option value={c.id} key={index}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="-mx-3 flex flex-wrap gap-y-4">
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.chat}
              onClick={onClose}
              className="block w-full rounded border border-stroke bg-gray disabled:cursor-not-allowed p-3 text-center font-medium text-black transition dark:border-strokedark dark:bg-meta-4 "
            >
              Cancel
            </button>
          </div>
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.chat}
              onClick={onCreate}
              className="block w-full rounded border border-black bg-black hover:bg-black/90 disabled:bg-black/90 disabled:cursor-not-allowed p-3 text-center font-medium text-white transition "
            >
              {loading.chat ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddMembersToGroupChat;
