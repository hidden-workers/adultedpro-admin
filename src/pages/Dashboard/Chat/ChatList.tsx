import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  getUnreadMessageCount,
  markAllMessagesAsRead,
  setCurrentChatSlice,
  fetchMessages,
} from '../../../store/reducers/chatSlice';
import { Chat } from '../../../interfaces';
import { useStateContext } from '../../../context/useStateContext';
import { Plus, Search } from 'lucide-react';
import { IconButton, Tooltip } from '@mui/material';
import InitiateChat from '../../../components/Modals/InitiateChat';
import { fetchEmployers } from '../../../store/reducers/employersSlice';
import { fetchUsers } from '../../../store/reducers/userSlice';
import useMobile from '../../../hooks/useMobile';
import { ChatItem } from './components/ChatItem';
//////////////////////////////////////////////// COMPONENTS //////////////////////////////////////////////////////////

export const ChatList = ({
  allChats,
  chats,
  setChats,
  selectedFilter,
}: {
  allChats: any;
  chats: {
    all: Chat[];
    groups: Chat[];
    userApplications: Chat[];
    candidates: Chat[];
    institute: Chat[];
  };
  setChats: any;
  selectedFilter:
    | 'all'
    | 'userApplications'
    | 'groups'
    | 'candidates'
    | 'institute';
}) => {
  //////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { selectedChat, page, setSelectedChat } = useStateContext();
  const currentUserId = String(localStorage.getItem('userId'));
  //////////////////////////////////////////////// STATES //////////////////////////////////////////////////////////
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [openInitiateChatModal, setOpenInitiateChatModal] = useState(false);

  //////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchEmployers());
    dispatch<any>(fetchUsers([]));
  }, []);
  useEffect(() => {
    // Getting unread counts
    if (chats[selectedFilter] && chats[selectedFilter]?.length > 0) {
      const promises = chats[selectedFilter]?.map((chat) => {
        return dispatch<any>(
          getUnreadMessageCount({ chatId: chat?.id, userId: currentUserId }),
        ).then((response) => {
          if (getUnreadMessageCount.fulfilled.match(response)) {
            return { chatId: chat?.id, count: response?.payload };
          }
          return null; // Return null if the promise is rejected or doesn't match the fulfilled action
        });
      });

      Promise.all(promises).then((results) => {
        const newUnreadCounts = {};
        results.forEach((result) => {
          if (result) newUnreadCounts[result?.chatId] = result?.count;
        });
        setUnreadCounts((pre) => ({ ...pre, ...newUnreadCounts }));
      });
    }
  }, [chats[selectedFilter], currentUserId]);
  //////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////////
  const onChatClick = (chat: Chat, otherUser) => {
    unreadCounts[chat?.id] = 0;
    localStorage.setItem('lastChat', chat?.id);

    setSelectedChat({ ...chat, otherUser });
    dispatch(setCurrentChatSlice({ ...chat, otherUser }));
    dispatch<any>(
      markAllMessagesAsRead({ chatId: chat?.id, userId: currentUserId }),
    );
    dispatch<any>(fetchMessages(chat.id));
  };
  const onSearch = () => {
    if (searchQuery?.trim() === '') {
      setChats(allChats);
      return;
    }

    const lowercasedQuery = searchQuery?.toLowerCase();
    const filteredChats = allChats[selectedFilter]?.reduce((acc, chat) => {
      if (chat?.user?.name?.toLowerCase()?.includes(lowercasedQuery)) {
        acc.push(chat);
      }

      return acc;
    }, []);

    setChats((pre) => ({ ...pre, [selectedFilter]: filteredChats }));
  };

  //////////////////////////////////////////////// COMPONENTS //////////////////////////////////////////////////////////

  //////////////////////////////////////////////// RENDER //////////////////////////////////////////////////////////
  const [isMobile] = useMobile();
  return (
    <>
      <InitiateChat open={openAddMemberModal} setOpen={setOpenAddMemberModal} />
      <InitiateChat
        open={openInitiateChatModal}
        setOpen={setOpenInitiateChatModal}
      />

      <div
        className={`h-full flex-col ${isMobile ? 'bg-white min-h-screen' : 'bg-whiter/75 dark:bg-black'} xl:flex`}
      >
        <div className="flex justify-between items-center sticky border-b border-stroke px-6 py-10 dark:border-strokedark">
          <h3 className="text-lg font-medium text-black dark:text-white 2xl:text-xl">
            Chat
            <span className="rounded-md border-[.5px] border-stroke bg-gray-2 px-2 py-0.5 text-base font-medium text-black dark:border-strokedark dark:bg-boxdark-2 dark:text-white 2xl:ml-4">
              {chats[selectedFilter]?.length}
            </span>
          </h3>
          {page == 'Institution' && (
            <Tooltip title="Start Chat" placement="top">
              <IconButton
                type="button"
                onClick={() => setOpenAddMemberModal(true)}
              >
                <Plus />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <div
          className={`flex flex-col gap-y-4 overflow-auto p-5 relative ${isMobile ? 'bg-white' : ''}`}
        >
          <div className="w-full space-y-2 ">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearch();
              }}
              className="sticky mb-7"
            >
              <input
                type="text"
                className="w-full rounded border border-stroke bg-gray-2 py-2.5 pl-5 pr-10 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyUp={(e) => {
                  e.preventDefault();
                  onSearch();
                }}
              />
              <button
                type="button"
                title="Search"
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <Search />
              </button>
            </form>
          </div>

          <div className="no-scrollbar max-h-full space-y-2.5 overflow-auto">
            {chats[selectedFilter]?.length == 0 && (
              <span className="block w-full text-center">
                {searchQuery?.length > 0
                  ? 'No chat matches your search criteria.'
                  : 'No conversation.'}
              </span>
            )}
            {chats[selectedFilter]?.map((chat, index) => (
              <ChatItem
                key={index}
                chat={chat}
                unreadCounts={unreadCounts}
                onChatClick={onChatClick}
                selectedChat={selectedChat}
              />
            ))}
          </div>

          {/* <Tooltip title='Initiate Chat' placement='top' >
            <button type='button' onClick={() => setOpenInitiateChatModal(true)} className="bg-primary text-white rounded-full p-3 absolute bottom-4 right-4 ">
              <MessageSquarePlus /> <span className='hidden' >hidden</span>
            </button>
          </Tooltip> */}
        </div>
      </div>
    </>
  );
};
