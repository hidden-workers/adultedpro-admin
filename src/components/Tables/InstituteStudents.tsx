import React, { useState, useEffect } from 'react';
import {
  User,
  Program,
  LocalStorageAuthUser,
  Chat,
  UserApplication,
  JoinedCompany,
} from '../../interfaces';
import Avatar from '../Avatars/Avatar';
import { maskEmail } from '../../utils/functions';
import { IconButton, Tooltip } from '@mui/material';
import { Eye, MessageCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import {
  getOtherUserDetail,
  initiateOtherUserDetail,
} from '../../utils/functions';
import { ChatTypes } from '../../utils/enums.ts';
import CLoader from '../../common/CLoader';
import { useStateContext } from '../../context/useStateContext';
import StudentApplicationDetailsModal from '../Modals/StudentApplicationDetailsModal.tsx';
import {
  fetchChats,
  setChat,
  setCurrentChatSlice,
} from '../../store/reducers/chatSlice';
import StudentFeedback from '../Modals/StudentFeedbackModal.tsx';

interface Props {
  students: User[];
  setSelectedStudent: any;
  onSortByApplications: () => void;
}

const InstituteStudents: React.FC<Props> = ({
  students: studentsProp,
  setSelectedStudent,
  onSortByApplications,
}) => {
  //////////////////////////////////////////////////////////variables/////////////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats } = useSelector((state: RootState) => state.chat);
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const [clickedItemId, setClickedItemId] = useState<{ message: string }>({
    message: '',
  });
  const { setSelectedChat } = useStateContext();
  ///////////////////////////////////////////////////////////states////////////////////////////////////////////////////////////////////////
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudentData] = useState<User | null>(null);
  const [selectedCompanyDetails, setSelectedCompanyDetails] =
    useState<JoinedCompany | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [studentApplications, setStudentApplications] = useState<
    UserApplication[]
  >([]);
  const mongoUserId = localStorage.getItem('mongoUserId');
  ///////////////////////////////////////////////////////////useEffects////////////////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchChats());
  }, [dispatch, authUser.id]);
  //////////////////////////////////////////////////////////functions/////////////////////////////////////////////////////////////////////
  const handleChatClick = (student: User) => {
    const findedStudent = studentsProp.find(
      (studentData) => student?.id === studentData?.id,
    );
    setClickedItemId((prev) => ({ ...prev, message: student?.id }));

    const selectedStudentChat = chats.filter((chat) =>
      chat?.participants?.some(
        //@ts-expect-error: might give error
        (participant) => participant?._id === findedStudent.id,
      ),
    );
    if (selectedStudentChat.length > 0) {
      // If there's already a chat going on with this student
      const otherUser = getOtherUserDetail(
        selectedStudentChat[0].participants,
        mongoUserId,
      );
      const selectedChat = selectedStudentChat[0];

      localStorage.setItem('lastChat', selectedChat?.id);
      setSelectedChat({ ...selectedStudentChat[0], otherUser });
      dispatch(setCurrentChatSlice({ ...selectedStudentChat[0], otherUser }));
      navigate('/institution/chat');
    } else {
      const newChatData: Chat = {
        participants: [mongoUserId, findedStudent?.id],
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        jobId: '',
        role: '',
        chatType: ChatTypes.IS_STUDENT_CHAT,
        shouldBotStopResponding: true,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        isGroup: false,
        isTest: false,
        participantsDetails: [
          {
            // @ts-expect-error: TypeScript error is expected due to missing property types
            isEmployer: false,
            id: authUser.id ?? '',
            name: authUser?.name || 'Institution',
            userId: authUser.id ?? '',
            email: authUser.email ?? '',
            photoUrl: authUser?.photoUrl ?? '',
          },
          {
            // @ts-expect-error: TypeScript error is expected due to missing property types
            isEmployer: false,
            id: findedStudent?.id ?? '',
            name: findedStudent?.name ?? findedStudent?.email ?? 'Unknown',
            email: findedStudent?.email ?? '',
          },
        ],
      };
      dispatch<any>(setChat(newChatData))
        .then((response) => {
          if (setChat.fulfilled.match(response)) {
            const otherUser = initiateOtherUserDetail(
              response.payload.participants,
              mongoUserId,
            );
            localStorage.setItem('lastChat', response.payload?.id);
            setSelectedChat({ ...response.payload, otherUser });
            dispatch(setCurrentChatSlice({ ...response.payload, otherUser }));
            setClickedItemId((prev) => ({ ...prev, message: '' }));
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

  const handleApplicationCountClick = (student: User) => {
    setSelectedStudentData(student);
    setStudentApplications(student?.jobApplications || []);
    setModalOpen(true);
  };

  const handleFeedbackClick = (student: User) => {
    if (student?.joinedCompany) {
      setSelectedCompanyDetails(student?.joinedCompany);
    } else {
      setSelectedCompanyDetails(null);
    }
    setFeedbackModalOpen(true);
  };
  ///////////////////////////////////////////////////////////render///////////////////////////////////////////////////////////////////////
  return (
    <div className="col-span-12 w-full">
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          {' '}
          <div className="min-w-[1170px]">
            {' '}
            <div
              className="grid grid-cols-5 bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
              style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
            >
              <div className="col-span-1">
                <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                  Name
                </h5>
              </div>
              <div className="col-span-1">
                <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                  Programs
                </h5>
              </div>

              <div className="col-span-1 cursor-pointer">
                <Tooltip title="Sort by Applicatios" placement="top">
                  <h5
                    className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark"
                    onClick={onSortByApplications}
                  >
                    Applications
                  </h5>
                </Tooltip>
              </div>
              <div className="col-span-1">
                <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                  Feedback
                </h5>
              </div>
              <div className="col-span-1">
                <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                  Actions
                </h5>
              </div>
            </div>
            <div className="bg-white dark:bg-boxdark">
              {studentsProp?.length === 0 ? (
                <div className="flex h-[17rem] w-full items-center justify-center">
                  No Students
                </div>
              ) : (
                studentsProp?.map((student: User, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                  >
                    <div className="col-span-1 flex items-center">
                      <div className="ml-13 mr-2">
                        <Avatar
                          src={student?.photoUrl}
                          initial={student?.name?.charAt(0)}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-[#637381] dark:text-bodydark truncate max-w-full">
                        {student?.name
                          ? student?.name
                          : maskEmail(student?.email)}
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-center items-center">
                      <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                        {typeof student?.program === 'object' &&
                        student?.program !== null
                          ? (student?.program as Program).name
                          : String(student.program)}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-center items-center">
                      <p
                        className="text-center text-sm text-[#637381] dark:text-bodydark cursor-pointer"
                        onClick={() => handleApplicationCountClick(student)}
                      >
                        {student?.applicationsCount}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-center items-center">
                      <p
                        className="text-center text-sm text-[#637381] dark:text-bodydark cursor-pointer"
                        onClick={() => handleFeedbackClick(student)}
                      >
                        {student?.joinedCompany ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-center items-center">
                      <Tooltip title="View Profile" placement="top">
                        <IconButton onClick={() => setSelectedStudent(student)}>
                          <Eye className="text-gray-icon" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chat" placement="top">
                        <IconButton
                          onClick={() => handleChatClick(student)}
                          disabled={clickedItemId.message == student?.id}
                        >
                          {clickedItemId.message == student?.id ? (
                            <CLoader size="xs" />
                          ) : (
                            <MessageCircle className="text-gray-icon" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedStudent && (
              <StudentApplicationDetailsModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                studentDetails={selectedStudent.id}
                applicationData={studentApplications}
              />
            )}
            <StudentFeedback
              open={feedbackModalOpen}
              onClose={() => setFeedbackModalOpen(false)}
              companyDetails={selectedCompanyDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteStudents;
