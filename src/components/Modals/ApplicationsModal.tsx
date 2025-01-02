import React, { useEffect, useRef, useState, memo } from 'react';
import { Application, Job, Chat } from '../../interfaces';
import { X } from 'lucide-react';
import { Tooltip, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserApplication } from '../../store/reducers/userApplicationsSlice';
import {
  fetchAllChats,
  fetchStudentEmployerChats,
  setStudentEmployerChatModal,
} from '../../store/reducers/chatSlice';
import { fetchApplicantUserById } from '../../store/reducers/userSlice';
import { RootState, AppDispatch } from '../../store/store';
import { debounce } from 'lodash';

interface ApplicationsModalProps {
  open: boolean;
  onClose: () => void;
  applications: any[];
  job: Job | null;
}
interface Applicant {
  id: string;
  name: string;
}
const ApplicationsModal: React.FC<ApplicationsModalProps> = ({
  open,
  onClose,
  applications,
  job,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(open);
  const modal = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  // const { chats,studentEmployerChat } = useSelector((state: RootState) => state.chat);
  // const [userChats, setUserChats] = useState<Chat[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userIds, setUserIds] = useState([]);
  const [candidateChats, setCandidateChats] = useState<
    { candidateId: string; chats: any[] }[]
  >([]);

  useEffect(() => {
    const ids = applications?.map((app) => app?.candidate_id);
    setUserIds(ids);
  }, [applications]);
  useEffect(() => {
    setIsModalOpen(open);
  }, [open]);

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (isModalOpen && keyCode === 27) {
        onClose();
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [isModalOpen, onClose]);

  useEffect(() => {
    const fetchChatsForCandidates = async () => {
      const chatResults: { candidateId: string; chats: any[] }[] = [];

      for (const application of applications) {
        const { candidate_id, job_id } = application;
        try {
          // Dispatch the action to fetch chats
          const chats = await dispatch<any>(
            fetchStudentEmployerChats({
              studentId: candidate_id,
              jobId: job_id,
            }),
          ).unwrap();

          chatResults.push({ candidateId: candidate_id, chats });
        } catch (error) {
          console.error(
            `Failed to fetch chats for candidate ${candidate_id}:`,
            error,
          );
          chatResults.push({ candidateId: candidate_id, chats: [] });
        }
      }
      setCandidateChats(chatResults);
    };

    fetchChatsForCandidates();
  }, [applications, dispatch]);

  useEffect(() => {
    if (userIds?.length === 0) return;

    const fetchApplicants = async () => {
      setIsLoading(true);

      const users: Record<string, { id: string; name: string }> = {};
      await Promise.all(
        userIds.map(async (id) => {
          const user = await dispatch<any>(fetchApplicantUserById(id));
          users[id] = { id, name: user?.payload?.name || 'Unknown Applicant' };
        }),
      );

      setApplicants(Object.values(users));
      setIsLoading(false);
    };

    fetchApplicants();
  }, [userIds, dispatch]);

  useEffect(() => {
    if (userIds?.length > 0) {
      const fetchChats = debounce(() => {
        dispatch(fetchAllChats(userIds));
        dispatch(setStudentEmployerChatModal(true));
      }, 500);
      fetchChats();
    }
  }, [dispatch, userIds]);

  // useEffect(() => {
  //   const filteredChats = chats.filter((chat) =>
  //     chat.participants.some((participant) => userIds?.includes(participant)),
  //   );
  //   setUserChats(filteredChats);
  // }, [chats, userIds]);

  return (
    <div>
      {isModalOpen && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/60 px-4 py-5">
          <div
            ref={modal}
            className="max-h-[90vh] min-h-[90vh] md:px-8 w-full max-w-150 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4"
            style={{ maxWidth: '1000px', width: '90vw' }}
          >
            <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-2">
              <div className="w-full flex justify-center items-center gap-4">
                <h4 className="text-2xl font-semibold text-black text-center dark:text-white">
                  View Applications for {job?.title}
                </h4>
              </div>
              <Tooltip title="Close" placement="top">
                <IconButton onClick={onClose}>
                  <X />
                </IconButton>
              </Tooltip>
            </div>

            <div className="flex flex-col bg-[#F9FAFB] dark:bg-meta-4 rounded-lg overflow-hidden">
              {isLoading ? (
                <p>Loading applicants...</p>
              ) : applications.length === 0 ? (
                <p>No applications found.</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {/* Header row */}
                  <div className="col-span-1 px-4 py-2">
                    <p className="font-semibold text-lg text-center">
                      Applicant
                    </p>
                  </div>
                  <div className="col-span-1 px-4 py-2 ">
                    <p className="font-semibold text-lg text-center">Status</p>
                  </div>
                  <div className="col-span-1 px-4 py-2">
                    <p className="font-semibold text-lg text-center">Chat</p>
                  </div>

                  {/* Data rows */}
                  {applications.map((application) => (
                    <ApplicationDetail
                      key={application?.id}
                      application={application}
                      chats={
                        candidateChats?.find(
                          (chat) =>
                            chat?.candidateId === application?.candidate_id,
                        )?.chats || []
                      }
                      currentUserId={application?.candidate_id}
                      applicantDetails={applicants}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ApplicationDetailProps {
  application: Application;
  chats: any[];
  currentUserId: string;
  applicantDetails: Applicant[];
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = React.memo(
  ({
    application,
    chats,
    // currentUserId,
    applicantDetails,
  }: {
    application: any;
    chats: any;
    currentUserId: any;
    applicantDetails: Applicant[];
  }) => {
    const [status, setStatus] = useState<string>(application.status);
    // const [chatDetails, setChatDetails] = useState<Chat[]>([]);
    const [applicantName, setApplicantName] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();
    console.log('chats', chats);
    useEffect(() => {
      setStatus(application.status);
    }, [application.status]);

    useEffect(() => {
      setStatus(application.status);
      const foundApplicant = applicantDetails.find(
        (applicant) => applicant.id === application.candidate_id,
      );
      if (foundApplicant) {
        setApplicantName(foundApplicant.name);
      }
    }, [application, applicantDetails]);

    // useEffect(() => {
    //   // Filter chats where currentUserId is in the participants array and chat jobId matches application jobId
    //   const applicantChats = chats.filter(
    //     (chat) =>
    //       chat.participants.includes(currentUserId) &&
    //       chat.jobId === application.jobId,
    //   );
    //   setChatDetails(applicantChats);
    // }, [chats, currentUserId, application.jobId]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const updatedStatus = e.target.value;
      setStatus(updatedStatus);

      dispatch(
        setUserApplication({
          ...application,
          status: updatedStatus,
          dateUpdated: new Date(),
        }),
      );
    };

    const handleNameClick = () => {
      const userDetailUrl = `/applicant/${application.candidate_id}`;
      window.open(userDetailUrl, '_blank');
    };

    const handleChatClick = (chatId: string) => {
      const chatDetailUrl = `/chat/applicant/${chatId}`;
      localStorage.setItem('lastChat', chatId);
      window.open(chatDetailUrl, '_blank');
    };
    return (
      <>
        <div className="col-span-1 border border-[#EEEEEE] dark:border-strokedark px-4 py-4 rounded-md">
          <p
            className="text-start cursor-pointer text-grayDark hover:underline truncate whitespace-nowrap overflow-hidden"
            onClick={handleNameClick}
          >
            {applicantName}
          </p>
        </div>

        <div className="flex justify-center items-center ">
          <select
            className="col-span-1 border border-[#EEEEEE] dark:border-strokedark px-2 py-1 rounded-md w-35 h-15"
            name="status"
            onChange={handleStatusChange}
            value={status}
            id="status"
            title="Status Selection"
          >
            <option value="chatting">Chatting</option>
            <option value="Rejected without interview">
              Rejected without interview
            </option>
            <option value="Interviewing">Interviewing</option>
            <option value="Rejected after interview">
              Rejected after interview
            </option>
            <option value="Hired">Hired</option>
          </select>
        </div>

        <div className="col-span-1 border border-black dark:border-strokedark px-4 py-4 rounded-md">
          {chats?.length > 0 ? (
            <ul>
              <li
                key={chats?._id}
                className="text-start truncate whitespace-nowrap overflow-hidden cursor-pointer"
                onClick={() => {
                  if (chats?._id) {
                    handleChatClick(chats?._id);
                  }
                }}
              >
                {chats?.last_message}
              </li>
            </ul>
          ) : (
            <p>No chats available.</p>
          )}
        </div>
      </>
    );
  },
);

ApplicationDetail.displayName = 'ApplicationDetail';

export default memo(ApplicationsModal);
