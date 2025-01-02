import { useEffect, useState } from 'react';
import { Employer } from '../../interfaces';
import Avatar from '../Avatars/Avatar';
import { IconButton, Tooltip } from '@mui/material';
import CLoader from '../../common/CLoader';
import { MessageCircle } from 'lucide-react';
import { Chat } from '../../interfaces';
import {
  fetchChats,
  setChat,
  setCurrentChatSlice,
} from '../../store/reducers/chatSlice';
import { fetchUsers } from '../../store/reducers/userSlice';
import { fetchEmployers } from '../../store/reducers/employersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getOtherUserDetail } from '../../utils/functions';
import { useStateContext } from '../../context/useStateContext';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { ChatTypes } from '../../utils/enums';

const EngagedEmployers: React.FC<{ employers: Employer[] }> = ({
  employers,
}) => {
  ///////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUserId = String(localStorage.getItem('userId'));
  const { setSelectedChat } = useStateContext();
  const { chats } = useSelector((state: RootState) => state.chat);
  const role = String(localStorage.getItem('Role'));
  const { user: loggedUser, users } = useSelector(
    (state: RootState) => state.user,
  ); // TODO: this should be changed into userApplicants

  ///////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////////
  const [clickedItemId, setClickedItemId] = useState({ message: '' });
  const [userChats, setUserChats] = useState(chats || []);

  ///////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchChats());
    dispatch<any>(fetchUsers([]));
    dispatch<any>(fetchEmployers());
  }, []);
  useEffect(() => {
    setUserChats(chats);
  }, [chats]);
  const mongoUserId = localStorage.getItem('mongoUserId');
  ///////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////////
  const onChatWithEmployer = (employer: Employer) => {
    const findedUser = users.find((user) => employer?.userId == user?.id);
    setClickedItemId((pre) => ({ ...pre, message: employer?.id }));
    const selectedEmployerChat = userChats.filter((chat) =>
      chat?.participants?.find((pId) => pId == findedUser?.id),
    );
    if (selectedEmployerChat.length > 0) {
      // If there's already chat going on with this student
      const otherUser = getOtherUserDetail(
        selectedEmployerChat[0].participants,
        mongoUserId,
      );
      localStorage.setItem('lastChat', selectedEmployerChat[0]?.id);
      setSelectedChat({ ...selectedEmployerChat[0], otherUser });
      dispatch(setCurrentChatSlice({ ...selectedEmployerChat[0], otherUser }));

      navigate('/institution/chat');
    } else {
      // If there's no chat with this student, create one
      const newChatData: Chat = {
        participants: [currentUserId, findedUser?.id],
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        jobId: '',
        role,
        chatType: ChatTypes.Employer,
        shouldBotStopResponding: true,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        isGroup: false,
        participantsDetails: [
          {
            // @ts-expect-error: TypeScript may not recognize 'isEmployer' as a valid property for this object type.
            isEmployer: true,
            id: currentUserId ?? '',
            name: loggedUser?.name || 'Institution',
            userId: currentUserId,
            email: loggedUser.email,
            photoUrl: loggedUser?.photoUrl,
          },
          {
            // @ts-expect-error: TypeScript may not recognize 'isEmployer' as a valid property for this object type.

            isEmployer: false,
            id: findedUser?.id ?? '',
            name: findedUser?.name ?? findedUser?.email,
            email: findedUser?.email,
          },
        ],
      };
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
            setClickedItemId((pre) => ({ ...pre, message: '' }));
            navigate('/institution/chat');
          } else {
            console.error('Failed to create chat:', response.error);
          }
        })
        .catch((error) => {
          console.error('Failed to dispatch setChat action:', error);
        });
    }
  };

  return (
    <div className="w-full col-span-12 rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12">
      <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
        Engaged Employers:
      </h3>

      <div>
        {employers?.length == 0 && (
          <div className="flex h-[17rem] w-full items-center justify-center">
            <p className="text-2xl font-semibold ">No Engaged Employers</p>
          </div>
        )}
        {employers?.map((employer, key) => (
          <div
            key={key}
            className="flex items-center gap-5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
          >
            <div className="flex items-center justify-center relative h-20 w-20 rounded-full">
              <Avatar
                src={employer?.photoUrl}
                initial={employer?.name?.charAt(0)}
              />
            </div>

            <div className="flex flex-1 items-center justify-between h-full ">
              <div>
                <h5 className="font-medium text-black dark:text-white">
                  {employer.name}
                </h5>
                <p>
                  <span className="text-sm text-black dark:text-white">
                    {employer.tagLine}
                  </span>
                </p>
              </div>
              <Tooltip title="Chat" placement="top">
                <IconButton
                  onClick={() => onChatWithEmployer(employer)}
                  disabled={clickedItemId.message == employer?.id}
                >
                  {clickedItemId.message == employer?.id ? (
                    <CLoader size="xs" />
                  ) : (
                    <MessageCircle className="text-gray-icon" />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngagedEmployers;
