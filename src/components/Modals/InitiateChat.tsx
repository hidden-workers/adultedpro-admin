import { Modal } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Chat, Class, LocalStorageAuthUser, User } from '../../interfaces';
import toast from 'react-hot-toast';
import {
  fetchChats,
  setChat,
  setCurrentChatSlice,
} from '../../store/reducers/chatSlice';
import {
  getOtherUserDetail,
  initiateOtherUserDetail,
} from '../../utils/functions';
import { useStateContext } from '../../context/useStateContext';
import {
  fetchClasses,
  fetchClassesByInstructorId,
} from '../../store/reducers/classSlice';
import { ChatTypes, UserRolesEnum } from '../../utils/enums';
import {
  fetchAdminsOfInstitution,
  fetchCounsellorsOfInstitution,
  fetchStudentsOfInstitution,
  fetchTeachersOfInstitution,
  // fetchUsers,
} from '../../store/reducers/userSlice';
import { X } from 'lucide-react';
import { fetchUserEmployers } from '../../store/reducers/employersSlice';

interface Props {
  open: boolean;
  setOpen: any;
  chat?: Chat;
}

const InitiateChat: React.FC<Props> = ({ open, setOpen, chat }) => {
  ///////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const studentRef = useRef();
  const teacherRef = useRef();
  const counsellorRef = useRef();
  const adminRef = useRef();
  const {
    students: fetchedStudents,
    teachers: fetchedTeachers,
    admins: fetchedAdmins,
    counsellors: fetchedCounsellors,
  } = useSelector((state: RootState) => state.user);
  const { userEmployers: fetchedEmployers } = useSelector(
    (state: RootState) => state.employer,
  );
  const { allClasses: fetchedAllClasses, classes: fetchedClasses } =
    useSelector((state: RootState) => state.class);
  const role = String(localStorage.getItem('Role'));
  const { user } = useSelector((state: RootState) => state.user);
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const { setSelectedChat } = useStateContext();
  const { chats } = useSelector((state: RootState) => state.chat);
  const mongoUserId = localStorage.getItem('mongoUserId');
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  ///////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  // const [loading, setLoading] = useState({ chat: false, teachers: false, counsellors: false, students: false, admin: false })
  // const [selectedId, setSelectedId] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [toggle, setToggle] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [type, setType] = useState<
  //   'STUDENT' | 'TEACHER' | 'ADMIN' | 'COUNSELLOR'
  // >('STUDENT');
  // const [userChats, setUserChats] = useState(chats || []);
  // const [students, setStudents] = useState(fetchedStudents)
  // const [teachers, setTeachers] = useState(fetchedTeachers)
  // const [counsellors, setCounsellors] = useState(fetchedCounsellors)
  // const [admins, setAdmins] = useState(fetchedAdmins)
  const [loading, setLoading] = useState({
    chat: false,
    employers: false,
    teachers: false,
    counsellors: false,
    students: false,
    admin: false,
    classes: false,
  });
  const [toggleStudents, setToggleStudents] = useState(false);
  const [toggleCounsellors, setToggleCounsellors] = useState(false);
  const [toggleTeachers, setToggleTeachers] = useState(false);
  const [toggleAdmins, setToggleAdmin] = useState(false);
  const [chatType, setChatType] = useState<ChatTypes>(
    chat ? chat?.chatType : ChatTypes.OneToOne,
  );
  const [groupName, setGroupName] = useState(chat ? chat?.groupName : '');
  const [oneToOneType, setOneToOneType] = useState<
    'STUDENT' | 'TEACHER' | 'ADMIN' | 'COUNSELLOR' | 'EMPLOYER'
  >('STUDENT');
  const [userChats, setUserChats] = useState(chats || []);
  const [students, setStudents] = useState(fetchedStudents);
  const [teachers, setTeachers] = useState(fetchedTeachers);
  const [employers, setEmployers] = useState(fetchedEmployers);
  const [counsellors, setCounsellors] = useState(fetchedCounsellors);
  const [admins, setAdmins] = useState(fetchedAdmins);
  const [classes, setClasses] = useState<Class[]>(
    role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses,
  );
  const [selectedId, setSelectedId] = useState(
    chat
      ? chat?.chatType == ChatTypes.Class
        ? chat?.classId
        : chat?.participants?.find((p) => p != mongoUserId)
      : '',
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    chat
      ? chat?.participantsDetails
          ?.filter(
            (p: User) =>
              p?.id != mongoUserId && p?.role?.includes(UserRolesEnum.Student),
          )
          ?.map((p) => p?.id)
      : [],
  );
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(
    chat
      ? chat?.participantsDetails
          ?.filter(
            (p: User) =>
              p?.id != mongoUserId && p?.role?.includes(UserRolesEnum.Teacher),
          )
          ?.map((p) => p?.id)
      : [],
  );
  const [selectedCounsellorIds, setSelectedCounsellorIds] = useState<string[]>(
    chat
      ? chat?.participantsDetails
          ?.filter(
            (p: User) =>
              p?.id != mongoUserId &&
              p?.role?.includes(UserRolesEnum.Counsellor),
          )
          ?.map((p) => p?.id)
      : [],
  );
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>(
    chat
      ? chat?.participantsDetails
          ?.filter(
            (p: User) =>
              p?.id != mongoUserId &&
              p?.role?.includes(UserRolesEnum.SchoolAdmin),
          )
          ?.map((p) => p?.id)
      : [],
  );

  ///////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  useEffect(() => {
    const handleClickOutside = (event) => {
      // @ts-expect-error: TypeScript may not recognize 'current' as a valid property for this object type.
      if (studentRef?.current && !studentRef?.current?.contains(event.target))
        setToggleStudents(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const handleClickOutside = () => {
      //  // @ts-expect-error: TypeScript may not recognize 'current' as a valid property for this object type.
      // if (teacherRef?.current && !teacherRef?.current?.contains(event.target)) setToggleTeachers(false)
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const handleClickOutside = () => {
      // // @ts-expect-error: TypeScript may not recognize 'current' as a valid property for this object type.
      // if (counsellorRef?.current && !counsellorRef?.current?.contains(event.target)) setToggleCounsellors(false)
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // @ts-expect-error: TypeScript may not recognize 'current' as a valid property for this object type.
      if (adminRef?.current && !adminRef?.current?.contains(event.target))
        setToggleAdmin(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    dispatch<any>(
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      }),
    ).finally(() => setLoading((pre) => ({ ...pre, students: false })));
  }, []);
  useEffect(() => {
    if (fetchedTeachers?.length > 0) return;
    setLoading((pre) => ({ ...pre, teachers: true }));
    dispatch<any>(
      fetchTeachersOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000000,
      }),
    ).then(() => setLoading((pre) => ({ ...pre, teachers: false })));
  }, []);
  useEffect(() => {
    if (fetchedCounsellors?.length > 0) return;
    setLoading((pre) => ({ ...pre, counsellors: true }));
    dispatch<any>(fetchCounsellorsOfInstitution(authUser?.partnerId)).finally(
      () => setLoading((pre) => ({ ...pre, counsellors: false })),
    );
  }, []);
  useEffect(() => {
    if (fetchedAdmins?.length > 0) return;
    setLoading((pre) => ({ ...pre, admins: true }));
    dispatch<any>(fetchAdminsOfInstitution(authUser?.partnerId)).finally(() =>
      setLoading((pre) => ({ ...pre, admins: false })),
    );
  }, []);
  useEffect(() => {
    if (fetchedEmployers?.length > 0) return;
    setLoading((pre) => ({ ...pre, employers: true }));
    dispatch<any>(fetchUserEmployers(role)).finally(() =>
      setLoading((pre) => ({ ...pre, employers: false })),
    );
  }, []);
  useEffect(() => {
    dispatch<any>(fetchChats());
    // dispatch<any>(fetchUsers([]));
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
    setClasses(
      role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses,
    );
  }, [fetchedAllClasses, fetchedClasses]);

  useEffect(() => {
    if (role == UserRolesEnum.SchoolAdmin) setStudents(fetchedStudents);
  }, [fetchedStudents]);
  useEffect(() => {
    setTeachers(fetchedTeachers);
  }, [fetchedTeachers]);
  useEffect(() => {
    setEmployers(fetchedEmployers);
  }, [fetchedEmployers]);
  useEffect(() => {
    setCounsellors(fetchedCounsellors);
  }, [fetchedCounsellors]);
  useEffect(() => {
    setAdmins(fetchedAdmins);
  }, [fetchedAdmins]);
  useEffect(() => {
    setUserChats(chats);
  }, [chats]);
  useEffect(() => {
    setSelectedId('');
  }, [oneToOneType]);
  useEffect(() => {
    setSelectedId('');
    setSelectedStudentIds([]);
    setSelectedTeacherIds([]);
    setSelectedCounsellorIds([]);
    setSelectedAdminIds([]);
    setGroupName('');
  }, [chatType]);
  useEffect(() => {
    setSelectedId('');
  }, [oneToOneType]);
  useEffect(() => {
    if (!chat) return;
    setChatType(chat?.chatType);
    if (chat?.chatType == ChatTypes.Group) {
      setGroupName(chat?.groupName);
      setSelectedStudentIds(
        chat?.participantsDetails
          .filter(
            (p: User) =>
              p?.id != mongoUserId && p?.role?.includes(UserRolesEnum.Student),
          )
          ?.map((p) => p?.id),
      );
      setSelectedTeacherIds(
        chat?.participantsDetails
          .filter(
            (p: User) =>
              p?.id != mongoUserId && p?.role?.includes(UserRolesEnum.Teacher),
          )
          ?.map((p) => p?.id),
      );
      setSelectedCounsellorIds(
        chat?.participantsDetails
          .filter(
            (p: User) =>
              p?.id != mongoUserId &&
              p?.role?.includes(UserRolesEnum.Counsellor),
          )
          ?.map((p) => p?.id),
      );
      setSelectedAdminIds(
        chat?.participantsDetails
          .filter(
            (p: User) =>
              p?.id != mongoUserId &&
              p?.role?.includes(UserRolesEnum.SchoolAdmin),
          )
          ?.map((p) => p?.id),
      );
    } else if (chat?.chatType == ChatTypes.OneToOne) {
      setSelectedId(chat?.participants?.find((p) => p != mongoUserId));
    } else if (chat?.chatType == ChatTypes.Class) {
      setSelectedId(chat?.classId);
    }
  }, [chat, open]);
  ///////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const onCreate = () => {
    if (chatType == ChatTypes.OneToOne) createOneToOneChat();
    else if (chatType == ChatTypes.Group) createGroup();
    else if (chatType == ChatTypes.Class) createClassGroup();
  };
  const createOneToOneChat = () => {
    if (oneToOneType == 'EMPLOYER') {
      createEmployerChat();
      return;
    }

    if (!selectedId) return toast.error('Please select a member.');

    const selectedItem = fetchedStudents?.find((u) => u?.id == selectedId);

    const selectedStudentChat = userChats.filter(
      (chat) =>
        chat?.participants?.some(
          //@ts-expect-error: might give error
          (participant) => participant?._id === selectedId,
        ) && !chat?.isGroup,
    );

    if (selectedStudentChat.length > 0) {
      // If there's already chat going on with this student
      const otherUser = getOtherUserDetail(
        selectedStudentChat[0].participants,
        mongoUserId,
      );
      localStorage.setItem('lastChat', selectedStudentChat[0]?.id);
      setSelectedChat({ ...selectedStudentChat[0], otherUser });
      dispatch(setCurrentChatSlice({ ...selectedStudentChat[0], otherUser }));
      onClose();
    } else {
      const newChatData: Chat = {
        participants: [mongoUserId, selectedId],
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        jobId: '',
        chatType: ChatTypes.OneToOne,
        classId: selectedId,
        role,
        shouldBotStopResponding: true,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        participantsDetails: [user, selectedItem],
        isGroup: false,
        isTest: false,
      };

      setLoading((pre) => ({ ...pre, chat: true }));
      dispatch<any>(setChat(newChatData))
        .then((response) => {
          if (setChat.fulfilled.match(response)) {
            const otherUser = initiateOtherUserDetail(
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
    }
  };

  const createGroup = () => {
    if (!groupName) return toast.error('Name is missing');
    if (
      selectedStudentIds.length == 0 &&
      selectedTeacherIds.length == 0 &&
      selectedCounsellorIds.length == 0 &&
      selectedAdminIds.length == 0
    )
      return toast.error('Atleast one member is required.');

    let selectedIds = [],
      selectedMembers = [],
      selectedStudents = [],
      selectedCounsellors = [],
      selectedTeachers = [],
      selectedAdmins = [];
    selectedStudents = students
      ?.filter((s) => selectedStudentIds?.includes(s?.id))
      ?.map((s) => ({ ...s, role: [UserRolesEnum.Student] }));
    selectedTeachers = teachers
      ?.filter((t) => selectedTeacherIds?.includes(t?.id))
      ?.map((s) => ({ ...s, role: [UserRolesEnum.Teacher] }));
    selectedCounsellors = counsellors
      ?.filter((c) => selectedCounsellorIds?.includes(c?.id))
      ?.map((s) => ({ ...s, role: [UserRolesEnum.Counsellor] }));
    selectedAdmins = admins
      ?.filter((a) => selectedAdminIds?.includes(a?.id))
      ?.map((s) => ({ ...s, role: [UserRolesEnum.SchoolAdmin] }));
    selectedIds = [
      ...(selectedStudentIds || []),
      ...(selectedTeacherIds || []),
      ...(selectedCounsellorIds || []),
      ...(selectedAdminIds || []),
    ];
    selectedMembers = [
      ...(selectedStudents || []),
      ...(selectedTeachers || []),
      ...(selectedCounsellors || []),
      ...(selectedAdmins || []),
    ];

    const newChatData: Chat = {
      id: chat ? chat?.id : '',
      participants: [mongoUserId, ...(selectedIds || [])],
      lastMessage: '',
      lastMessageTimestamp: new Date(),
      jobId: '',
      chatType: chatType,
      classId: selectedId,
      role,
      groupName: groupName,
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
  const createClassGroup = () => {
    if (!selectedId) return toast.error('Please select a class.');

    const selectedClass = classes?.find((c) => c?.id == selectedId);
    const selectedIds = selectedClass?.students;
    const selectedMembers = students?.filter((student) =>
      selectedIds?.includes(student?.id),
    );

    const newChatData: Chat = {
      id: chat ? chat?.id : '',
      participants: [mongoUserId, ...(selectedIds || [])],
      lastMessage: '',
      lastMessageTimestamp: new Date(),
      jobId: '',
      chatType: chatType,
      classId: selectedId,
      role,
      groupName: selectedClass?.name,
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
  const createEmployerChat = () => {
    if (!selectedId) return toast.error('Please select a employer.');
    const selectedEmployer = employers?.find((e) => e?.id == selectedId);
    // const userDocument = users.find((u) => u?.id == selectedEmployer?.userId);
    const userDocument = selectedEmployer?.id;
    const newChatData: Chat = {
      id: chat ? chat?.id : '',
      participants: [mongoUserId, userDocument],
      lastMessage: '',
      lastMessageTimestamp: new Date(),
      jobId: '',
      chatType: ChatTypes.Employer,
      classId: '',
      role,
      groupName: classes.find((c) => c.id == selectedId)?.name,
      shouldBotStopResponding: true,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      participantsDetails: [user, userDocument],
      isGroup: false,
      isTest: false,
    };

    setLoading((pre) => ({ ...pre, chat: true }));
    dispatch<any>(setChat(newChatData))
      .then((response) => {
        if (setChat.fulfilled.match(response)) {
          const otherUser = initiateOtherUserDetail(
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
    setOpen(false);
    setToggleStudents(false);
    setToggleCounsellors(false);
    setToggleTeachers(false);
    setToggleAdmin(false);
    setOneToOneType('STUDENT');
    setChatType(ChatTypes.OneToOne);
    setGroupName('');
    setSelectedStudentIds([]);
    setSelectedTeacherIds([]);
    setSelectedCounsellorIds([]);
    setSelectedAdminIds([]);
    setSelectedId('');
  };
  const onOptionChange = (
    value: string,
    type: 'STUDENT' | 'TEACHER' | 'COUNSELLOR' | 'ADMIN',
  ) => {
    if (type == 'STUDENT')
      setSelectedStudentIds((pre) =>
        pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
      );
    else if (type == 'TEACHER')
      setSelectedTeacherIds((pre) =>
        pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
      );
    else if (type == 'COUNSELLOR')
      setSelectedCounsellorIds((pre) =>
        pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
      );
    else if (type == 'ADMIN')
      setSelectedAdminIds((pre) =>
        pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
      );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="md:px-17.5 max-h-[80vh] overflow-y-auto w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:py-15">
        <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Start Chat
        </h3>

        <div className="flex flex-col gap-4 mb-4 ">
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
              onChange={(e) => setChatType(e.target.value as ChatTypes)}
              value={chatType}
              id="type"
            >
              <option value={ChatTypes.OneToOne}>Individual Chat</option>
              {/* <option value={ChatTypes.Class}>Class</option>
              <option value={ChatTypes.Group}>Group</option> */}
            </select>
          </div>
          {chatType == ChatTypes.OneToOne && (
            <>
              {/* Chat With */}
              <div className="w-full">
                <label
                  htmlFor="oneToOneType"
                  className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                >
                  Chat With
                </label>
                <select
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  name="oneToOneType"
                  onChange={(e) =>
                    setOneToOneType(
                      e.target.value as
                        | 'STUDENT'
                        | 'ADMIN'
                        // | 'TEACHER'
                        // | 'COUNSELLOR'
                        | 'EMPLOYER',
                    )
                  }
                  value={oneToOneType}
                  id="oneToOneType"
                >
                  <option value="STUDENT">Student</option>
                  {/* <option value="TEACHER">Teacher</option> */}
                  {/* <option value="COUNSELLOR">Counsellor</option> */}
                  <option value="EMPLOYER">Employer</option>
                  {role != UserRolesEnum.SchoolAdmin && (
                    <option value="ADMIN">Admin</option>
                  )}
                </select>
              </div>
              {/* Selecting Member */}
              <>
                {oneToOneType === 'STUDENT' && (
                  <div className="w-full">
                    <label
                      htmlFor="selectedId"
                      className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                    >
                      Student <span className="text-red">*</span>
                    </label>
                    <select
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="selectedId"
                      onChange={(e) => {
                        setSelectedId(e.target.value); // Sets the selectedId to the student's ID
                      }}
                      value={selectedId}
                      id="selectedId"
                    >
                      <option value="">Select Student</option>
                      {loading.students && <option value="">Loading...</option>}
                      {students
                        ?.filter((s) => s.approvedByAdmin) // Filters approved students
                        ?.map((s) => (
                          <option value={s.id} key={s.id}>
                            {s.name || s.email} {/* Display name or email */}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                {oneToOneType == 'TEACHER' && (
                  <div className="w-full">
                    <label
                      htmlFor="selectedId"
                      className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                    >
                      Teacher <span className="text-red">*</span>
                    </label>
                    <select
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="selectedId"
                      onChange={(e) => setSelectedId(e.target.value)}
                      value={selectedId}
                      id="selectedId"
                    >
                      <option value="">Select Teacher</option>
                      {loading.teachers && <option value="">Loading...</option>}
                      {teachers.map((c, index) => (
                        <option value={c.id} key={index}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {oneToOneType == 'COUNSELLOR' && (
                  <div className="w-full">
                    <label
                      htmlFor="selectedId"
                      className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                    >
                      Counsellor <span className="text-red">*</span>
                    </label>
                    <select
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="selectedId"
                      onChange={(e) => setSelectedId(e.target.value)}
                      value={selectedId}
                      id="selectedId"
                    >
                      <option value="">Select Counsellor</option>
                      {loading.counsellors && (
                        <option value="">Loading...</option>
                      )}
                      {counsellors.map((c, index) => (
                        <option value={c.id} key={index}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* {oneToOneType == 'ADMIN' && (
                  <div className="">
                    <label
                      htmlFor="member"
                      className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                    >
                      Admin <span className="text-red">*</span>
                    </label>
                    <div className="flex flex-col gap-2.5">
                      <div ref={studentRef} className="w-full relative ">
                        <div
                          onClick={() => setToggleStudents((pre) => !pre)}
                          className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          {selectedId
                            ? users?.find((u) => u?.id == selectedId)?.name
                            : 'Select Admin'}
                        </div>
                        {toggleStudents && (
                          <div className="z-[5] absolute top-full left-0 w-full max-h-40 overflow-y-auto ">
                            {admins?.map((option: User, index: number) => (
                              <div key={index}>
                                <label
                                  className={`${selectedId == option?.id ? 'bg-graydark text-white' : 'bg-gray'} shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white`}
                                >
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    onChange={() => {
                                      setSelectedId(option?.id);
                                      setToggleStudents(false);
                                    }}
                                  />
                                  {option?.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )} */}
                {oneToOneType == 'EMPLOYER' && (
                  <div className="w-full">
                    <label
                      htmlFor="selectedId"
                      className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                    >
                      Employers <span className="text-red">*</span>
                    </label>
                    <select
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="selectedId"
                      onChange={(e) => setSelectedId(e.target.value)}
                      value={selectedId}
                      id="selectedId"
                    >
                      <option value="">Select Employer</option>
                      {loading.employers && (
                        <option value="">Loading...</option>
                      )}
                      {employers?.map(
                        (c, index) =>
                          c.name && (
                            <option value={c.id} key={index}>
                              {c.name}
                            </option>
                          ),
                      )}
                    </select>
                  </div>
                )}
              </>
            </>
          )}
          {chatType == ChatTypes.Group && (
            <>
              {/* Group Name */}
              <div className="flex flex-col items-start">
                <label
                  htmlFor="groupName"
                  className="mb-1 block text-lg font-medium text-black dark:text-white"
                >
                  Group Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              {/* Select Students */}
              <div className="">
                <label
                  htmlFor="member"
                  className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                >
                  Students
                </label>
                <div className="flex flex-col gap-2.5">
                  <div ref={studentRef} className="w-full relative ">
                    <div
                      onClick={() => setToggleStudents((pre) => !pre)}
                      className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      Select Students
                    </div>
                    {toggleStudents && (
                      <div className="z-[5] absolute top-full left-0 w-full max-h-40 overflow-y-auto ">
                        {students?.map((option: User, index: number) => (
                          <div key={index}>
                            <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                              <input
                                className="sr-only"
                                type="checkbox"
                                name="recommend"
                                onChange={() =>
                                  onOptionChange(option?.id, 'STUDENT')
                                }
                              />
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedStudentIds.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedStudentIds.includes(option?.id) ? 'flex' : 'hidden'}`}
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
                  {selectedStudentIds.map((selected, key) => (
                    <span
                      key={key}
                      className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                    >
                      {students?.find((s) => s?.id == selected)?.name}
                      <X
                        onClick={() =>
                          setSelectedStudentIds((pre) =>
                            pre.filter((p) => p != selected),
                          )
                        }
                        className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                      />
                    </span>
                  ))}
                </div>
              </div>
              {/* Select Teachers */}
              <div className="">
                <label
                  htmlFor="member"
                  className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                >
                  Teachers
                </label>
                <div className="flex flex-col gap-2.5">
                  <div ref={teacherRef} className="w-full relative ">
                    <div
                      onClick={() => setToggleCounsellors((pre) => !pre)}
                      className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      Select Teachers
                    </div>
                    {toggleCounsellors && (
                      <div className="z-[5] absolute top-full left-0 w-full max-h-40 overflow-y-auto ">
                        {teachers.map((option: User, index: number) => (
                          <div key={index}>
                            <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                              <input
                                className="sr-only"
                                type="checkbox"
                                name="recommend"
                                onChange={() =>
                                  onOptionChange(option?.id, 'TEACHER')
                                }
                              />
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedTeacherIds.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedTeacherIds.includes(option?.id) ? 'flex' : 'hidden'}`}
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
                  {selectedTeacherIds.map((selected, i) => (
                    <span
                      key={i}
                      className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                    >
                      {teachers.find((s) => s?.id == selected)?.name}
                      <X
                        onClick={() =>
                          setSelectedTeacherIds((pre) =>
                            pre.filter((p) => p != selected),
                          )
                        }
                        className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                      />
                    </span>
                  ))}
                </div>
              </div>
              {/* Select Counsellors */}
              <div className="">
                <label
                  htmlFor="member"
                  className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                >
                  Counsellors
                </label>
                <div className="flex flex-col gap-2.5">
                  <div ref={counsellorRef} className="w-full relative ">
                    <div
                      onClick={() => setToggleTeachers((pre) => !pre)}
                      className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      Select Counsellors
                    </div>
                    {toggleTeachers && (
                      <div className="z-[5] absolute top-full left-0 w-full max-h-40 overflow-y-auto ">
                        {counsellors.map((option: User, index: number) => (
                          <div key={index}>
                            <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                              <input
                                className="sr-only"
                                type="checkbox"
                                name="recommend"
                                onChange={() =>
                                  onOptionChange(option?.id, 'COUNSELLOR')
                                }
                              />
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedCounsellorIds.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedCounsellorIds.includes(option?.id) ? 'flex' : 'hidden'}`}
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
                  {selectedCounsellorIds.map((selected, i) => (
                    <span
                      key={i}
                      className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                    >
                      {counsellors.find((s) => s?.id == selected)?.name}
                      <X
                        onClick={() =>
                          setSelectedCounsellorIds((pre) =>
                            pre.filter((p) => p != selected),
                          )
                        }
                        className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                      />
                    </span>
                  ))}
                </div>
              </div>
              {/* Select Admins */}
              {role != UserRolesEnum.SchoolAdmin && (
                <div className="">
                  <label
                    htmlFor="member"
                    className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
                  >
                    Admins
                  </label>
                  <div className="flex flex-col gap-2.5">
                    <div ref={adminRef} className="w-full relative ">
                      <div
                        onClick={() => setToggleAdmin((pre) => !pre)}
                        className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        Select Admin
                      </div>
                      {toggleAdmins && (
                        <div className="z-[5] absolute top-full left-0 w-full max-h-40 overflow-y-auto ">
                          {admins.map((option: User, index: number) => (
                            <div key={index}>
                              <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                <input
                                  className="sr-only"
                                  type="checkbox"
                                  name="recommend"
                                  onChange={() =>
                                    onOptionChange(option?.id, 'ADMIN')
                                  }
                                />
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedAdminIds.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                                >
                                  <span
                                    className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedAdminIds.includes(option?.id) ? 'flex' : 'hidden'}`}
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
                    {selectedAdminIds.map((selected, i) => (
                      <span
                        key={i}
                        className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                      >
                        {admins.find((s) => s?.id == selected)?.name}
                        <X
                          onClick={() =>
                            setSelectedAdminIds((pre) =>
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
            </>
          )}
          {chatType == ChatTypes.Class && (
            <div className="w-full">
              <label
                htmlFor="selectedId"
                className="mb-1 block text-lg font-medium text-black dark:text-white text-start"
              >
                Select Class <span className="text-red">*</span>
              </label>
              <select
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                name="selectedId"
                onChange={(e) => setSelectedId(e.target.value)}
                value={selectedId}
                id="selectedId"
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
              {loading.chat ? 'Starting Chat...' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InitiateChat;
