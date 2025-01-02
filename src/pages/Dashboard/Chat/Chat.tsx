import { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentsOfInstitution } from '../../../store/reducers/userSlice';
import { RootState } from '../../../store/store';
import { ChatBox } from './ChatBox';
import { ChatList } from './ChatList';
import { MobileChatBox } from './MobileChatBox';
import { fetchUserApplicationsByEmployerEmail } from '../../../store/reducers/userApplicationsSlice';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import { fetchChats } from '../../../store/reducers/chatSlice';
import CLoader from '../../../common/Loader';
import useMobile from '../../../hooks/useMobile';
import { useStateContext } from '../../../context/useStateContext';
import { getOtherUserDetail } from '../../../utils/functions';

import { User, Employer } from '../../../interfaces';

const Chat = () => {
  /////////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { chats } = useSelector((state: RootState) => state.chat);
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  const mongoUserId = localStorage.getItem('mongoUserId');
  /////////////////////////////////////////////////////// STATES //////////////////////////////////////////////////
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'userApplications' | 'groups' | 'candidates' | 'institute'
  >('all');
  const [allChats, setAllChats] = useState({
    all: chats,
    userApplications: [],
    groups: [],
    candidates: [],
    institute: [],
  });
  const [userChats, setUserChats] = useState({
    all: chats,
    userApplications: [],
    groups: [],
    candidates: [],
    institute: [],
  });
  const [isMobile] = useMobile();
  const { selectedChat, setSelectedChat } = useStateContext();
  /////////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////
  useEffect(() => {
    if (chats?.length > 0) return;
    setIsLoading(true);
    dispatch<any>(fetchChats()).then(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    dispatch<any>(fetchUserApplicationsByEmployerEmail(authUser?.email));
  }, []);
  useEffect(() => {
    dispatch<any>(
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      }),
    );
  }, []);
  //////////////////////// when we want to add group or employer we will change getOutherUserDetail function and this reduce
  useEffect(() => {
    const filteredChats = chats?.reduce((acc, chat) => {
      const otherUser: User | Employer = getOtherUserDetail(
        chat?.participants,
        mongoUserId,
      );

      // Add the user to the chat object
      acc.push({
        ...chat,
        user: otherUser,
      });

      return acc;
    }, []);

    const userApplicationChats = filteredChats?.filter(
      (c) =>
        c.isUserApplication ||
        c.chatType == 'IS_JOB_APPLICATION_CHAT' ||
        c.chatType == 'IS_STUDENT_CHAT',
    );
    const candidateChats = filteredChats?.filter(
      (c) =>
        !c.isUserApplication &&
        c.chatType != 'IS_JOB_APPLICATION_CHAT' &&
        !c.isGroup,
    );
    const instituteChats = filteredChats?.filter(
      (c) => c?.chatType?.toLowerCase() == 'employer'.toLowerCase(),
    );
    const groups = filteredChats?.filter((c) => c.isGroup);
    setUserChats({
      all: filteredChats,
      groups,
      userApplications: userApplicationChats,
      candidates: candidateChats,
      institute: instituteChats,
    });
    setAllChats({
      all: filteredChats,
      groups,
      userApplications: userApplicationChats,
      candidates: candidateChats,
      institute: instituteChats,
    });
  }, [chats]);

  const renderMobileView = () => {
    if (selectedChat) {
      return (
        <div className="h-screen bg-white">
          <MobileChatBox goBack={() => setSelectedChat(null)} />
        </div>
      );
    }

    return (
      <div className="h-screen bg-white">
        <ChatList
          allChats={allChats}
          chats={userChats}
          setChats={setUserChats}
          selectedFilter={selectedFilter}
        />
      </div>
    );
  };
  const renderDesktopView = () => (
    <div className="h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex flex-col xl:flex-row">
      <div className="w-full xl:w-1/4 bg-white sm:bg-white border-b border-stroke dark:border-strokedark xl:border-b-0 xl:border-r xl:bg-transparent flex-shrink-0">
        <ChatList
          allChats={allChats}
          chats={userChats}
          setChats={setUserChats}
          selectedFilter={selectedFilter}
        />
      </div>
      <div className="w-full xl:w-3/4 bg-white sm:bg-white xl:bg-transparent">
        <ChatBox />
      </div>
    </div>
  );
  return (
    <DefaultLayout>
      <div className="flex flex-col">
        {!isMobile && <Breadcrumb pageName="Chat" />}

        <div>
          {!isMobile && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-7 md:gap-6 2xl:gap-7.5 mb-4">
              <div
                onClick={() => setSelectedFilter('all')}
                className={`${selectedFilter == 'all' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-blue-500  text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2 `}
              >
                <p className="text-xs text-center font-medium">All Chats</p>
                <h3 className="text-xs font-bold text-black dark:text-white">
                  {allChats?.all?.length}
                </h3>
              </div>
              <div
                onClick={() => setSelectedFilter('candidates')}
                className={`${selectedFilter == 'candidates' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-blue-500  text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2 `}
              >
                <p className="text-xs text-center font-medium">Student Chat</p>
                <h3 className="text-xs font-bold text-black dark:text-white">
                  {allChats?.candidates?.length}
                </h3>
              </div>
              <div
                onClick={() => setSelectedFilter('institute')}
                className={`${selectedFilter == 'institute' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-blue-500  text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2 `}
              >
                <p className="text-xs text-center font-medium">
                  institute Chat
                </p>
                <h3 className="text-xs font-bold text-black dark:text-white">
                  {allChats?.institute?.length}
                </h3>
              </div>
            </div>
            // <div className="col-span-12 flex w-full items-center justify-between md:gap-6 ">
            //   {/* All Chats */}
            //   <div
            //     onClick={() => setSelectedFilter('all')}
            //     className={`${selectedFilter == 'all' ? 'bg-gray sm:scale-100 md:scale-105 shadow-xl' : 'bg-white sm:scale-100 md:scale-100'} col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-blue-500 p-3 sm:p-4 md:p-6 xl:p-7.5 text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark`}
            //   >
            //     <h3 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
            //       {chats.length}
            //     </h3>
            //     <p className="text-center text-sm sm:text-base md:text-lg font-medium">
            //       All Chats
            //     </p>
            //   </div>

            //   <div
            //     onClick={() => setSelectedFilter('candidates')}
            //     className={`${selectedFilter == 'candidates' ? 'bg-gray sm:scale-100 md:scale-105 shadow-xl' : 'bg-white sm:scale-100 md:scale-100'} col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-red p-3 sm:p-4 md:p-6 xl:p-7.5 text-red shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark`}
            //   >
            //     <h3 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
            //       {
            //         chats?.filter(
            //           (c) =>
            //             !c.isUserApplication &&
            //             c.chatType != 'IS_JOB_APPLICATION_CHAT' &&
            //             !c.isGroup,
            //         ).length
            //       }
            //     </h3>
            //     <p className="text-center text-sm sm:text-base md:text-lg font-medium">
            //       Student Chat
            //     </p>
            //   </div>
            // </div>
          )}

          <div className="col-span-12 xl:col-span-12">
            <div className="h-[calc(110vh-186px)] overflow sm:h-[calc(110vh-174px)]">
              {isLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <CLoader />
                </div>
              ) : isMobile ? (
                renderMobileView()
              ) : (
                renderDesktopView()
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Chat;
