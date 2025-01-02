import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchStudentEmployerMessages } from '../../store/reducers/chatSlice';
import { Chat, ChatMessage } from '../../interfaces';
import { Tooltip, IconButton, Modal } from '@mui/material';
import { X } from 'lucide-react';
import { parseDate } from '../../utils/datetime';
import dayjs from 'dayjs';

interface ApplicantDetailsPageProps {
  open: boolean;
  onClose: () => void;
  chatData: Chat;
}

const StudentEmployerChat: React.FC<ApplicantDetailsPageProps> = ({
  open,
  onClose,
  chatData,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (chatData) {
      dispatch<any>(fetchStudentEmployerMessages({ chatId: chatData?.id }))
        .unwrap()
        .then((fetchedMessages) => {
          setMessages(fetchedMessages);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch messages:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch, chatData]);

  const getSenderDetails = (senderId: string) => {
    const sender = chatData?.participantsDetails?.find((participant) => {
      if ('userId' in participant) {
        return participant?.userId === senderId;
      } else if ('id' in participant) {
        return participant?.id === senderId;
      }
      return false;
    });

    if (sender) {
      const isEmployer = 'isEmployer' in sender ? sender?.isEmployer : false;
      return { ...sender, isEmployer };
    }

    return undefined;
  };

  const formatDate = (dateInput: any) => {
    const parsedDate = parseDate(dateInput);
    return dayjs(parsedDate).format('MM-DD-YYYY');
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/70"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[900px] md:px-8 rounded-lg bg-white px-6 py-4 dark:bg-boxdark md:py-8 overflow-auto space-y-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
          <div className="flex justify-between items-center bg-[#1C2434] p-4 rounded-t-lg">
            <h2 className="text-3xl font-semibold text-center text-white">
              Messages
            </h2>
            <Tooltip title="Close" placement="top">
              <IconButton
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <X style={{ color: 'white' }} />
              </IconButton>
            </Tooltip>
          </div>

          <div className="p-6 space-y-6">
            {chatData && (
              <div>
                <div className="space-y-6">
                  <ul className="space-y-4">
                    {messages?.map((message) => {
                      const senderDetails = getSenderDetails(message?.senderId);
                      const isSenderEmployer = senderDetails?.isEmployer;
                      const senderName = senderDetails?.name || 'Unknown';
                      const senderAvatar = senderDetails?.photoUrl;

                      return (
                        <li
                          key={message.id}
                          className={`flex ${isSenderEmployer ? 'justify-end' : 'justify-start'} items-start`}
                        >
                          {!isSenderEmployer && (
                            <img
                              src={senderAvatar}
                              alt={`no avatar`}
                              className="w-12 h-12 rounded-full mr-4"
                            />
                          )}
                          <div
                            className={`max-w-lg p-4 rounded-lg shadow-md ${
                              isSenderEmployer
                                ? 'bg-graydark text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                            }`}
                          >
                            <p className="font-bold mb-1">{senderName}</p>
                            <p className="text-sm">{message?.text}</p>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                              {formatDate(message?.timestamp)}
                            </p>
                          </div>
                          {isSenderEmployer && (
                            <img
                              src={senderAvatar}
                              alt={`no avatar`}
                              className="w-12 h-12 rounded-full ml-4"
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StudentEmployerChat;
