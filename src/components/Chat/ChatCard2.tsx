import { Link } from 'react-router-dom';
import { Chat } from '../../types/chat';
import UserOne from '../../images/user/user-01.png';
import UserTwo from '../../images/user/user-02.png';

const chatData: Chat[] = [
  {
    avatar: UserOne,
    name: 'In Progresss Employers',
    text: 'Status-Interviewing',
    color: '#10B981',
  },
  {
    avatar: UserTwo,
    name: 'In Progress Employers',
    text: 'Status-Interviewing',
    color: '#DC3545',
  },
];

const ChatCard2 = () => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12">
      <div>
        {chatData.map((chat, key) => (
          <Link
            to="/"
            className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
            key={key}
          >
            <div className="relative h-20 w-20 rounded-full">
              <img src={chat.avatar} alt="User" />
              <span
                className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white"
                style={{ backgroundColor: chat.color }}
              ></span>
            </div>

            <div className="flex flex-1 items-center justify-between">
              <div>
                <h5 className="font-medium text-black dark:text-white">
                  {chat.name}
                </h5>
                <p>
                  <span className="text-sm text-black dark:text-white">
                    {chat.text}
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatCard2;
