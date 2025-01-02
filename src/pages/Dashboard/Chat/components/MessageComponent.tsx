import { useSelector } from 'react-redux';
import { useStateContext } from '../../../../context/useStateContext';
import { formatChatTimestamp } from '../../../../utils/functions';
import { Message } from '../../../../interfaces';
import { RootState } from '../../../../store/store';
import Bot from '../../../../assets/Bot.png';

export const MessageComponent = ({ message }: { message: Message }) => {
  const { selectedChat } = useStateContext();
  const mongoUserId = String(localStorage.getItem('mongoUserId'));
  const { users } = useSelector((state: RootState) => state.user);

  const isBotMessage =
    message?.senderId === null || message?.isFromBot === true;
  const isMe = message?.senderId === mongoUserId;

  const currentUserPhoto = selectedChat?.participantsDetails?.find(
    //@ts-expect-error: ignore
    (user) => user?.userId?._id === mongoUserId,
    //@ts-expect-error: ignore
  )?.userId?.photo_url;

  const sender = users?.find((u) => u?.id === message?.senderId);
  const otherUserPhoto =
    //@ts-expect-error: ignore
    sender?.photo_url ||
    selectedChat?.participantsDetails?.find(
      //@ts-expect-error: ignore
      (user) => user?.userId?._id !== mongoUserId,
      //@ts-expect-error: ignore
    )?.userId?.photo_url;

  const msg = message?.content;
  const time = formatChatTimestamp(message?.createdAt);
  return (
    <div
      className={`flex items-start mb-4 ${
        isMe || isBotMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Other User's Photo (Left) */}
      {!isMe && !isBotMessage && otherUserPhoto && (
        <img
          src={otherUserPhoto}
          alt="Other User"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}

      {/* Message Content */}
      <div className={isMe || isBotMessage ? 'ml-auto max-w-125' : 'max-w-125'}>
        <div
          className={`mb-2.5 rounded-2xl px-5 py-3 dark:bg-boxdark-2 ${
            isMe || isBotMessage
              ? 'rounded-br-none bg-primary text-white'
              : 'rounded-tl-none bg-whiten'
          }`}
        >
          <p>{msg}</p>
        </div>
        <p
          className={`text-xs ${
            isMe || isBotMessage ? 'text-end' : 'text-start'
          }`}
        >
          {time?.time}
        </p>
      </div>

      {/* Current User's Photo (Right) */}
      {isMe && currentUserPhoto && (
        <img
          src={currentUserPhoto}
          alt="You"
          className="w-8 h-8 rounded-full ml-2"
        />
      )}

      {/* Bot Photo (Right) */}
      {isBotMessage && (
        <img src={Bot} alt="Bot" className="w-8 h-8 rounded-full ml-2" />
      )}
    </div>
  );
};

MessageComponent.Skeleton = function Skeleton() {
  return (
    <div className={'w-125'}>
      <div
        className={`mb-2.5 h-[48px] rounded-2xl px-5 py-3 dark:bg-boxdark-2 rounded-tl-none bg-whiten`}
      />
    </div>
  );
};
