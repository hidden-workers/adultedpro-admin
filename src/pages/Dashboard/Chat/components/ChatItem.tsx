import Avatar from '../../../../components/Avatars/Avatar';
import { maskEmail } from '../../../../utils/functions';
import { useStateContext } from '../../../../context/useStateContext';

export const ChatItem = ({
  chat,
  unreadCounts,
  onChatClick,
  selectedChat,
}: {
  chat: any;
  unreadCounts: any;
  onChatClick: any;
  selectedChat?: any;
}) => {
  const { page } = useStateContext();
  const lastMessage = chat?.lastMessage?.slice(0, 30) || 'No messages yet';
  const unreadCount = unreadCounts[chat?.id] || 0;
  return (
    <div
      onClick={() => onChatClick(chat, chat?.user)}
      className={`${
        selectedChat?.id == chat?.id ? 'bg-white/75' : ''
      } flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-white dark:hover:bg-strokedark`}
    >
      <Avatar
        src={!chat?.isGroup && chat?.user?.photo_url}
        initial={chat?.groupName?.charAt(0) || chat?.user?.name?.charAt(0)}
        size="sm"
      />
      <div className="flex w-auto justify-between items-center">
        <div className="flex flex-col">
          <h5 className="text-sm font-medium text-black dark:text-white">
            {chat?.groupName ||
              chat?.user?.name ||
              maskEmail(chat?.user?.email)}
          </h5>

          {page === 'Employer' &&
            chat.chatType === 'IS_JOB_APPLICATION_CHAT' && (
              <p className="max-w-[200px] truncate text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                <strong>Position: </strong>
                {typeof chat?.jobId === 'string'
                  ? chat.jobTitle
                  : chat?.jobId?.title}
              </p>
            )}

          <p className="text-sm">{lastMessage}</p>
        </div>
        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-[#1C2434] px-2 py-1 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};
