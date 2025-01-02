import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Tooltip } from '@mui/material';
import { RootState } from '../../../store/store';
import {
  fetchMessages,
  sendMessage,
  setCurrentChatMessagesSlice,
  setCurrentChatSlice,
  setChatsSlice,
  setChat,
} from '../../../store/reducers/chatSlice';
import { getOtherUserDetail, maskEmail } from '../../../utils/functions';
import { useStateContext } from '../../../context/useStateContext';
import { updateUserApplication } from '../../../store/reducers/userApplicationsSlice';
import { ChatTypes, UserApplicationStatus } from '../../../utils/enums';
import { UserApplication } from '../../../interfaces';
import { Send, ArrowLeft } from 'lucide-react';
import { TakeOverDialogue } from './TakeOverDialogue';
import { useLocation } from 'react-router-dom';
import InitiateChat from '../../../components/Modals/InitiateChat';
import ViewUserProfile from '../../../components/Modals/ViewUserProfile';
import { MessageComponent } from './components/MessageComponent';

export const MobileChatBox = ({ goBack }: { goBack: () => void }) => {
  ///////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const scrollRef = useRef(null);
  const {
    selectedChat,
    setSelectedChat,
    page,
    chatMessageInput,
    setChatMessageInput,
  } = useStateContext();
  const { users } = useSelector((state: RootState) => state.user);
  const { userApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const { chats, currentChatMessages } = useSelector(
    (state: RootState) => state.chat,
  );
  const rejectMessage = `Thank you for applying${selectedChat?.otherUser?.name ? ` ${selectedChat?.otherUser?.name}!` : '!'} Enjoyed our conversation but it looks like you might not be the right fit for this position. Please feel free to browse our other positions and apply again. Thanks!`;
  const inviteToInterviewMessage =
    'It looks like you might be a good fit. Are you available for an interview?';
  const lastChatId = localStorage.getItem('lastChat')
    ? String(localStorage.getItem('lastChat'))
    : null;
  const mongoUserId = localStorage.getItem('mongoUserId');
  ///////////////////////////////////////////////////// STATES ////////////////////////////////////////////////////
  const [findedUserApplication, setFindedUserApplication] =
    useState<UserApplication | null>(null);
  const [openTakeOverModal, setOpenTakeOverModal] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);

  ///////////////////////////////////////////////////// USE EFFECTS ////////////////////////////////////////////////////
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [selectedChat]);
  useEffect(() => {
    if ((lastChatId && !selectedChat) || !selectedChat?.otherUser) {
      const finded = chats?.find((c) => c?.id == lastChatId);
      if (!finded) return;
      const otherUser = getOtherUserDetail(finded?.participants, mongoUserId);
      // setSelectedChat({ ...finded, otherUser });
      dispatch(setCurrentChatSlice({ ...finded, otherUser }));
    }
  }, [lastChatId, selectedChat, chats, users, mongoUserId]);

  useEffect(() => {
    const findedApplication = userApplications?.find(
      (u: UserApplication) =>
        u?.jobId == selectedChat?.jobId &&
        selectedChat?.participants?.some(
          //@ts-expect-error: might give error
          (participant) => participant?._id === u?.applicant?.id,
        ),
    );
    setFindedUserApplication(findedApplication);
  }, [userApplications, selectedChat]);
  useEffect(() => {
    if (selectedChat) {
      setLoadingMessages(true);
      dispatch<any>(fetchMessages(selectedChat.id)).then(
        setLoadingMessages(false),
      );
    } else if (lastChatId) {
      setLoadingMessages(true);
      dispatch<any>(fetchMessages(lastChatId)).then(setLoadingMessages(false));
    }
  }, [selectedChat, dispatch, pathname]);
  useEffect(() => {
    scrollToBottom();
  }, [currentChatMessages]);

  ///////////////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////////////
  const onSendMessage = (inputMessage?: string) => {
    const msgInput = inputMessage ? inputMessage : chatMessageInput;

    if (msgInput.trim() == '') return;

    const newMessage = {
      chatId: selectedChat?.id,
      senderId: mongoUserId,
      content: msgInput,
      createdAt: new Date(),
      readBy: [{ readAt: new Date(), userId: mongoUserId }],
      isEmployerResponse: page == 'Employer',
    };

    dispatch(
      setCurrentChatMessagesSlice({
        messages: [...currentChatMessages, newMessage],
        chatId: selectedChat?.id,
      }),
    );

    // Update last message of chat
    dispatch(
      setChatsSlice(
        chats.map(
          (c) =>
            (c =
              c.id == selectedChat.id
                ? {
                    ...c,
                    lastMessage: msgInput,
                    lastMessageTimestamp: new Date(),
                  }
                : c),
        ),
      ),
    );
    const newChat = chats.map((c) =>
      c?.id === selectedChat?.id
        ? {
            ...c,
            lastMessage: msgInput,
            lastMessageTimestamp: new Date().toISOString(),
          }
        : c,
    );
    const updatedSelectedChat = newChat.find((c) => c?.id === selectedChat?.id);
    // Create message in db
    dispatch<any>(
      sendMessage({
        chatId: selectedChat.id,
        messageData: newMessage,
        chatData: updatedSelectedChat,
      }),
    ).then((response) => {
      if (sendMessage.fulfilled.match(response)) {
        dispatch<any>(fetchMessages(selectedChat.id));
      }
    });

    // in case of employer sending the first message by himself
    if (!selectedChat.shouldBotStopResponding) {
      const { otherUser, ...rest } = selectedChat;
      dispatch<any>(setChat({ ...rest, shouldBotStopResponding: true })).then(
        () => {
          setSelectedChat({ ...selectedChat, shouldBotStopResponding: true });
          dispatch(setCurrentChatSlice({ ...selectedChat, otherUser }));
        },
      );

      const selectedApplication = userApplications.filter(
        (a) => a?.jobId == selectedChat?.jobId,
      )[0];
      dispatch<any>(
        updateUserApplication({
          id: selectedApplication.id,
          data: UserApplicationStatus.Chatting,
        }),
      );
    }

    scrollToBottom();
    setChatMessageInput('');
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      setTimeout(() => {
        scrollContainer.scroll({
          top: scrollContainer.scrollHeight - scrollContainer.clientHeight,
          behavior: 'smooth',
        });
      }, 20);
    }
  };

  const onReject = async () => {
    dispatch<any>(
      updateUserApplication({
        id: findedUserApplication.id,
        data: UserApplicationStatus?.Disqualified,
      }),
    ).then(() => {
      onSendMessage(rejectMessage);
    });
  };
  const onInviteToInterview = async () => {
    dispatch<any>(
      updateUserApplication({
        id: findedUserApplication.id,
        data: UserApplicationStatus?.Interviewing,
      }),
    ).then(() => {
      onSendMessage(inviteToInterviewMessage);
    });
  };
  const onKeyUp = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default Enter key behavior (form submission or new line)
      onSendMessage(); // Call the sendMessageHandler when Enter is pressed
    }
  };
  ///////////////////////////////////////////////////// COMPONENTS ////////////////////////////////////////////////////

  if (!currentChatMessages) {
    return <div>Loading messages...</div>;
  }

  return (
    <>
      {page == 'Employer' && (
        <TakeOverDialogue
          open={openTakeOverModal}
          setOpen={setOpenTakeOverModal}
        />
      )}
      <InitiateChat
        open={openAddMemberModal}
        setOpen={setOpenAddMemberModal}
        chat={selectedChat}
      />

      {!selectedChat?.id ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-3xl font-semibold ">Select a conversation</p>
        </div>
      ) : chats.length == 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-3xl font-semibold ">No current conversation</p>
        </div>
      ) : (
        <div className="flex flex-col h-screen w-full bg-white border-l border-stroke dark:border-strokedark">
          {/* <!-- ====== Chat Box Start --> */}
          <div className="sticky top-0 border-b border-stroke px-6 py-4.5 dark:border-strokedark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <ArrowLeft size={30} onClick={goBack} />
                <div
                  onClick={() => {
                    setShowViewProfileModal(true);
                  }}
                  className="h-13 w-13 overflow-hidden rounded-full cursor-pointer"
                >
                  {selectedChat?.otherUser?.photo_url &&
                  selectedChat?.chatType !== ChatTypes.Group &&
                  selectedChat?.chatType !== ChatTypes.Class ? (
                    <img
                      src={selectedChat?.otherUser?.photo_url}
                      alt="avatar"
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black capitalize text-white ">
                      {selectedChat?.groupName?.charAt(0) ||
                        selectedChat?.otherUser?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="w-max font-medium text-black dark:text-white ">
                    <span
                      onClick={() => {
                        setShowViewProfileModal(true);
                      }}
                      className="cursor-pointer"
                    >
                      {selectedChat?.groupName ||
                        selectedChat?.otherUser?.name ||
                        maskEmail(selectedChat?.otherUser?.email)}
                    </span>
                    {(selectedChat?.chatType == ChatTypes.Class ||
                      selectedChat?.chatType == ChatTypes.Group) && (
                      <span
                        onClick={() => setOpenAddMemberModal(true)}
                        className="cursor-pointer ml-2 text-sm text-body"
                      >
                        ({selectedChat.participants.length + ' Members'})
                      </span>
                    )}
                  </h5>
                  <Tooltip placement="top" title="Job Title">
                    <p className="max-w-[300px] text-sm truncate whitespace-nowrap overflow-hidden text-ellipsis">
                      {typeof selectedChat?.jobId === 'string'
                        ? selectedChat.jobTitle
                        : selectedChat?.jobId?.title}
                    </p>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* New row for buttons */}
            {page == 'Employer' &&
              (selectedChat?.isUserApplication ||
                selectedChat?.chatType == 'IS_JOB_APPLICATION_CHAT' ||
                findedUserApplication) && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    onClick={() => onReject()}
                    className="flex w-full sm:w-auto items-center justify-center rounded-md bg-red px-2 py-2 text-xs sm:text-sm text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-red/75"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onInviteToInterview()}
                    className="flex w-full sm:w-auto items-center justify-center rounded-md bg-primary px-2 py-2 text-xs sm:text-sm text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-primary/75"
                  >
                    Invite to interview
                  </button>
                </div>
              )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2">
            {loadingMessages
              ? Array(5)
                  .fill('')
                  ?.map((_, index) => <MessageComponent.Skeleton key={index} />)
              : [...(currentChatMessages || [])] // Create a shallow copy to avoid mutating the original array
                  .sort(
                    (a, b) =>
                      new Date(a?.createdAt)?.getTime() -
                      new Date(b?.createdAt)?.getTime(),
                  )
                  .map((msg, index) => (
                    <MessageComponent
                      key={index}
                      message={msg}
                      // currentUserId={currentUserId}
                    />
                  ))}
          </div>
          <div className="sticky bottom-0 border-t border-stroke bg-white px-6 py-5 dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between space-x-4.5">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={
                    selectedChat?.shouldBotStopResponding ||
                    page === 'Institution'
                      ? 'Type something here'
                      : 'Click Chat with Candidate to begin chat'
                  }
                  disabled={
                    !selectedChat?.shouldBotStopResponding &&
                    page === 'Employer'
                  }
                  className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  onKeyUp={onKeyUp}
                />
              </div>
              {selectedChat?.shouldBotStopResponding ||
              page == 'Institution' ? (
                <button
                  type="button"
                  title="Send Message"
                  onClick={() => {
                    onSendMessage();
                  }}
                  className="flex h-13 w-full max-w-13 items-center justify-center rounded-md bg-primary text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-primary/75"
                >
                  <Send />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpenTakeOverModal(true);
                  }}
                  disabled={selectedChat?.shouldBotStopResponding}
                  className="w-max-content flex h-13 min-w-[11rem] items-center justify-center rounded-md bg-black px-4 py-2.5 text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-black/75"
                >
                  Chat with candidate
                </button>
              )}
            </div>
          </div>
          {/* <!-- ====== Chat Box End --> */}
        </div>
      )}
      <ViewUserProfile
        showViewProfileModal={showViewProfileModal}
        selectedChat={selectedChat}
        setShowViewProfileModal={setShowViewProfileModal}
      />
    </>
  );
};
