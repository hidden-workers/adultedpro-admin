import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { markAllMessagesAsRead } from '../../store/reducers/chatSlice';
import { getOtherUserDetail, maskEmail } from '../../utils/functions';
import { Chat, User, Employer } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import { SquareArrowUpRight } from 'lucide-react';
import { Tooltip } from '@mui/material';
import {
  fetchDashboardChats,
  setCurrentChatSlice,
} from '../../store/reducers/chatSlice';
import CLoader from '../../common/CLoader';

const DashboardChat = () => {
  /////////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const navigate = useNavigate();
  const { dashboardChats } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { setSelectedChat, page } = useStateContext();

  const mongoUserId = localStorage.getItem('mongoUserId');
  /////////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////////
  const [userChats, setUserChats] = useState(dashboardChats || []);
  const [isLoading, setIsLoading] = useState(false);
  /////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////

  useEffect(() => {
    if (userChats.length > 0) return;
    setIsLoading(true);
    dispatch<any>(fetchDashboardChats()).then(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    setUserChats(dashboardChats);
  }, [dashboardChats]);
  /////////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onMessageClick = (chat: Chat, otherUser: User | Employer) => {
    dispatch<any>(
      markAllMessagesAsRead({ chatId: chat?.id, userId: user?.id }),
    );
    localStorage.setItem('lastChat', chat?.id);
    setSelectedChat({ ...chat, otherUser });
    dispatch(setCurrentChatSlice({ ...chat, otherUser }));
  };

  return (
    <div className="relative min-h-[14rem] h-full overflow-y-auto rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-5.5 xl:pb-1">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
          Recent Chats
          <Tooltip
            placement="top"
            title="In this section, you can view recent chats between students and administrators, as well as between administrators and other school staff or employers."
          >
            <p className="ml-2 cursor-pointer border border-black text-black font-bold rounded-full w-4 h-4 flex items-center justify-center text-xs">
              i
            </p>
          </Tooltip>
          <Tooltip placement="top" title="View All">
            <SquareArrowUpRight
              onClick={() =>
                navigate(
                  page === 'Employer' ? '/employer/chat' : '/institution/chat',
                )
              }
              className="h-5 w-5 cursor-pointer text-black/60"
            />
          </Tooltip>
        </h4>
      </div>

      <div className="flex flex-col h-fit">
        <div className="grid grid-cols-1 gap-2">
          {isLoading ? (
            <div className="flex justify-center items-center w-full h-full absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <CLoader size="lg" />
            </div>
          ) : userChats.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center py-16 absolute top-[70%] left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <span className="text-center text-xl">
                No Current Conversation
              </span>
            </div>
          ) : (
            userChats.slice(0, 6).map((chat, index) => {
              const otherUser: User | Employer = getOtherUserDetail(
                chat.participants,
                mongoUserId,
              );
              const lastMessage =
                chat.lastMessage.slice(0, 30) || 'No messages yet';
              return (
                <Link
                  to={
                    page === 'Employer' ? '/employer/chat' : '/institution/chat'
                  }
                  className="flex text-sm items-center gap-2 overflow-hidden truncate px-3 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
                  onClick={() => onMessageClick(chat, otherUser)}
                  key={index}
                >
                  <div className="relative rounded-full w-11 h-11">
                    {otherUser?.photoUrl && !chat?.groupName ? (
                      <img
                        src={otherUser?.photoUrl}
                        alt="profile"
                        className="h-11 w-11 rounded-full object-cover object-center"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black capitalize text-white">
                        {chat?.groupName?.charAt(0) ||
                          otherUser?.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between w-full truncate">
                    <div>
                      <h5 className="font-medium text-black dark:text-white truncate">
                        {chat?.groupName ||
                          otherUser?.name ||
                          maskEmail(otherUser?.email) ||
                          'No Name'}
                      </h5>
                      <p className="text-sm text-black dark:text-white truncate">
                        {lastMessage}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardChat;
