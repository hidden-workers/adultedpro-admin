import { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStudentsOfInstitution,
  fetchUsers,
} from '../../../store/reducers/userSlice';
import { RootState } from '../../../store/store';
import { ChatBox } from './ChatBox';
import { ChatList } from './ChatList';
import { fetchUserApplicationsByEmployerEmail } from '../../../store/reducers/userApplicationsSlice';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import { fetchChats } from '../../../store/reducers/chatSlice';
import CLoader from '../../../common/Loader';
import { useStateContext } from '../../../context/useStateContext';

const Chat = () => {
  /////////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { chats } = useSelector((state: RootState) => state.chat);
  const currentUserId = String(localStorage.getItem('userId'));
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const { page } = useStateContext();

  /////////////////////////////////////////////////////// STATES //////////////////////////////////////////////////
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'userApplications' | 'groups' | 'candidates'
  >('all');
  const [userChats, setUserChats] = useState({
    all: chats,
    userApplications: [],
    groups: [],
    candidates: [],
  });

  /////////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////
  useEffect(() => {
    if (chats?.length > 0) return;
    setIsLoading(true);
    dispatch<any>(fetchChats(currentUserId)).then(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    dispatch<any>(fetchUsers([]));
    dispatch<any>(fetchUserApplicationsByEmployerEmail(authUser?.email));
  }, []);
  useEffect(() => {
    dispatch<any>(fetchStudentsOfInstitution(authUser?.partnerId));
  }, []);
  useEffect(() => {
    const userApplicationChats = chats?.filter(
      (c) => c.isUserApplication || c.chatType == 'IS_JOB_APPLICATION_CHAT',
    );
    const candidateChats = chats?.filter(
      (c) =>
        !c.isUserApplication &&
        c.chatType != 'IS_JOB_APPLICATION_CHAT' &&
        !c.isGroup,
    );
    const groups = chats?.filter((c) => c.isGroup);
    setUserChats({
      all: chats,
      groups,
      userApplications: userApplicationChats,
      candidates: candidateChats,
    });
  }, [chats]);

  return (
    <DefaultLayout>
      <div className="flex flex-col">
        <Breadcrumb pageName="Chat" />

        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <div className="col-span-12 flex w-full items-center justify-between md:gap-6 ">
            {/* All Chats */}
            <div
              onClick={() => setSelectedFilter('all')}
              className={`${selectedFilter == 'all' ? 'bg-gray scale-105 shadow-xl' : 'bg-white scale-100'} col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-blue-500 p-4 text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 `}
            >
              <h3 className="mb-4 text-4xl font-bold text-black dark:text-white">
                {chats.length}
              </h3>
              <p className="text-center font-medium ">All Chats</p>
            </div>

            {/* Applicant or Group Chats */}
            <div
              onClick={() =>
                setSelectedFilter(
                  page == 'Institution' ? 'groups' : 'userApplications',
                )
              }
              className={`${selectedFilter == (page == 'Institution' ? 'groups' : 'userApplications') ? 'bg-gray scale-105 shadow-xl' : 'bg-white scale-100'} col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-green-500 p-4 text-green-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 `}
            >
              <h3 className="mb-4 text-4xl font-bold text-black dark:text-white">
                {page == 'Employer'
                  ? chats?.filter(
                      (c) =>
                        c.isUserApplication ||
                        c.chatType == 'IS_JOB_APPLICATION_CHAT',
                    )?.length
                  : chats?.filter((c) => c.isGroup)?.length}
              </h3>
              <p className="text-center font-medium ">
                {page == 'Institution' ? 'Group' : 'Applicant'} Chats
              </p>
            </div>

            {/* Student Chats */}
            <div
              onClick={() => setSelectedFilter('candidates')}
              className={`${selectedFilter == 'candidates' ? 'bg-gray scale-105 shadow-xl' : 'bg-white scale-100'} col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-red p-4 text-red shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 `}
            >
              <h3 className="mb-4 text-4xl font-bold text-black dark:text-white">
                {
                  chats?.filter(
                    (c) =>
                      !c.isUserApplication &&
                      c.chatType != 'IS_JOB_APPLICATION_CHAT' &&
                      !c.isGroup,
                  ).length
                }
              </h3>
              <p className="text-center font-medium ">Student Chat</p>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-12">
            <div className="h-[calc(110vh-186px)] overflow-hidden sm:h-[calc(110vh-174px)]">
              {isLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <CLoader />
                </div>
              ) : (
                <div className="h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:flex">
                  <ChatList
                    chats={userChats}
                    setChats={setUserChats}
                    selectedFilter={selectedFilter}
                  />
                  <ChatBox />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Chat;
