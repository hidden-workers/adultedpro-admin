import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  fetchStudentChats,
  setStudentEmployerChatModal,
} from '../../store/reducers/chatSlice';
import { Chat } from '../../interfaces';
import { Tooltip, IconButton, Modal } from '@mui/material';
import { X } from 'lucide-react';
import StudentEmployerChat from './StudentEmployerChat';

interface StudentApplicationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  studentDetails: string;
  applicationData: any[];
}

const StudentApplicationDetailsModal: React.FC<
  StudentApplicationDetailsModalProps
> = ({ open, onClose, studentDetails, applicationData }) => {
  const dispatch = useDispatch();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const role = String(localStorage.getItem('Role'));
  const [studentMessagesModalOpen, setStudentMessagesModalOpen] =
    useState(false);
  useEffect(() => {
    if (open) {
      dispatch<any>(fetchStudentChats(studentDetails))
        .unwrap()
        .then((result) => {
          setChats(result);
          dispatch(setStudentEmployerChatModal(true));
        })
        .catch((error) => {
          console.error('Failed to fetch chats:', error);
        });
    } else {
      dispatch(setStudentEmployerChatModal(false));
    }
  }, [open, dispatch, studentDetails]);

  const findChatByEmployer = useCallback(
    (applicationId: string, employerId: string) => {
      return (
        chats?.filter(
          (chat: Chat) =>
            chat.jobId === applicationId &&
            chat.participantsDetails?.some(
              (participant: any) => participant?.id === employerId,
            ),
        ) || []
      );
    },
    [chats],
  );

  const handleChatClick = (chat: Chat) => {
    if (role === 'Admin') {
      setStudentMessagesModalOpen(true);
      setSelectedChat(chat);
    }
  };

  const handleCloseApplicantDetailsModal = () => {
    setStudentMessagesModalOpen(false);
    setSelectedChat(null);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/70"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[900px] rounded-lg bg-white dark:bg-boxdark overflow-auto space-y-6 p-4 md:px-8 md:py-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 shadow md:px-6 md:py-4">
          <h4 className="text-xl md:text-2xl font-semibold text-black dark:text-white text-center flex-grow">
            Student Applications
          </h4>
          <Tooltip title="Close" placement="top">
            <IconButton
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <X />
            </IconButton>
          </Tooltip>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-md shadow-md overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th
                  className="px-4 py-3 text-left text-center font-semibold text-gray-700 md:px-6 md:py-4"
                  style={{ width: '34%' }}
                >
                  Job Title
                </th>
                <th
                  className="px-4 py-3 text-left text-center font-semibold text-gray-700 md:px-6 md:py-4"
                  style={{ width: '33%' }}
                >
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left text-center font-semibold text-gray-700 md:px-6 md:py-4"
                  style={{ width: '33%' }}
                >
                  Chat
                </th>
              </tr>
            </thead>
            <tbody>
              {applicationData?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applicationData?.map((application) => {
                  const chatForEmployer = findChatByEmployer(
                    application?.jobId,
                    application?.employerId,
                  );
                  return (
                    <tr key={application?.id} className="border-b border-gray">
                      <td className="px-4 py-3 md:px-6 md:py-4">
                        {application?.job_snapshot?.title}
                      </td>
                      <td className="px-4 py-3 text-center md:px-6 md:py-4">
                        {application?.status}
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4">
                        {chatForEmployer && chatForEmployer?.length > 0 ? (
                          role === 'Admin' ? (
                            <p
                              key={chatForEmployer?.[0]?.id}
                              className="text-gray-600 cursor-pointer truncate max-w-[200px] md:max-w-[250px]"
                              onClick={() =>
                                handleChatClick(chatForEmployer?.[0])
                              }
                            >
                              {chatForEmployer?.[0]?.lastMessage}
                            </p>
                          ) : (
                            <p className="text-gray-600 truncate max-w-[200px] md:max-w-[250px]">
                              {chatForEmployer?.[0]?.lastMessage}
                            </p>
                          )
                        ) : (
                          <p className="text-gray-600">No chat available.</p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {selectedChat && role === 'Admin' && (
            <StudentEmployerChat
              open={studentMessagesModalOpen}
              onClose={handleCloseApplicantDetailsModal}
              chatData={selectedChat}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StudentApplicationDetailsModal;
