import { useStateContext } from '../../context/useStateContext';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  extractDateTimeFromTimestamp,
  getOtherUserDetail,
} from '../../utils/functions';
import { fetchPartnerById } from '../../store/reducers/partnerSlice';
import { Chat, Job, Partner, User, UserApplication } from '../../interfaces';
import { Tooltip, IconButton } from '@mui/material';
import {
  Bookmark,
  MessageCircle,
  FileCheck2,
  Pencil,
  Trash,
  GalleryVerticalEnd,
  ArrowLeft,
} from 'lucide-react';
import { updateEmployer } from '../../store/reducers/employersSlice';
import {
  setChat,
  fetchChats,
  setCurrentChatSlice,
} from '../../store/reducers/chatSlice';
import { useNavigate } from 'react-router-dom';
import Avatar from '../Avatars/Avatar';
import Badge from '../Badges/Badge';
import CLoader from '../../common/CLoader';
import CreateNoteForCandidate from '../Modals/CreateNoteForCandidate';
import { updateMongoCandidate } from '../../store/reducers/userSlice';
import ViewJobDetailsOfCandidate from '../Modals/ViewJobDetailsOfCandidate';
import { ChatTypes } from '../../utils/enums';
import { Program } from '../../interfaces';

interface MobileCandidateDetailProps {
  goBack: () => void;
  filterType: 'all' | 'other';
}

const MobileCandidateDetail = ({
  goBack,
  filterType,
}: MobileCandidateDetailProps) => {
  ///////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    selectedUserApplication,
    selectedStudent,
    // setMainBranch,
    setSelectedStudent,
  } = useStateContext();
  const { userApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const currentUserId = String(localStorage.getItem('userId'));
  const { chats } = useSelector((state: RootState) => state.chat);
  const { setSelectedChat } = useStateContext();
  const { user: logedInUser } = useSelector((state: RootState) => state.user); // TODO: this should be changed into userApplicants
  const role = String(localStorage.getItem('Role'));
  const { userApplications: fetchedUserApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const { employer } = useSelector((state: RootState) => state.employer);
  const employerId =
    fetchedUserApplications && fetchedUserApplications.length > 0
      ? fetchedUserApplications[0].employerId
      : '';
  const mongoUserId = localStorage.getItem('mongoUserId');
  ///////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////
  const [clickedItemId, setClickedItemId] = useState({
    message: '',
    bookmark: '',
    review: '',
    deleteNote: '',
  });
  const [userApplication, setUserApplication] = useState(
    selectedUserApplication,
  );
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerFetching, setPartnerFetching] = useState(false);
  const [userChats, setUserChats] = useState(chats || []);
  const [note, setNote] = useState('');
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [openCandidateApplicationsModal, setOpenCandidateApplicationsModal] =
    useState(false);

  ///////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchChats());
  }, []);

  useEffect(() => {}, [selectedStudent]);
  useEffect(() => {
    if (filterType == 'all') {
      const findedUserApplication = userApplications?.find(
        (userApp) => userApp?.applicantEmail == selectedStudent?.email,
      );
      if (findedUserApplication) {
        if (findedUserApplication?.applicant?.partnerId) {
          setPartnerFetching(true);
          dispatch<any>(
            fetchPartnerById(findedUserApplication?.applicant?.partnerId),
          ).then(({ payload }) => {
            setPartner(payload);
            setPartnerFetching(false);
          });
        }
        setUserApplication(findedUserApplication);
      } else {
        if (selectedStudent?.partnerId) {
          setPartnerFetching(true);
          dispatch<any>(fetchPartnerById(selectedStudent?.partnerId)).then(
            ({ payload }) => {
              setPartner(payload);
              setPartnerFetching(false);
            },
          );
        }
      }
    } else {
      if (selectedUserApplication?.applicant?.partnerId) {
        setPartnerFetching(true);
        dispatch<any>(
          fetchPartnerById(selectedUserApplication?.applicant?.partnerId),
        ).then(({ payload }) => {
          setPartner(payload);
          setPartnerFetching(false);
        });
      }
      setUserApplication(selectedUserApplication);
    }
  }, [selectedStudent, selectedUserApplication]);
  useEffect(() => {
    setUserChats(chats);
  }, [chats]);
  ///////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
  const onBookmarkApplication = (userApplication: UserApplication) => {
    setClickedItemId((pre) => ({ ...pre, bookmark: userApplication?.id }));
    const isBookmarked = employer?.bookmarkedUserApplications?.includes(
      userApplication?.id,
    );
    if (isBookmarked) {
      const bookmarkedUserApplications =
        employer?.bookmarkedUserApplications?.filter(
          (appId) => appId != userApplication?.id,
        );
      dispatch<any>(
        updateEmployer({ ...employer, bookmarkedUserApplications }),
      ).then(() => {
        // setMainBranch(() => ({ ...mainBranch, bookmarkedUserApplications }));
        setClickedItemId((pre) => ({ ...pre, bookmark: '' }));
      });
    } else {
      const bookmarkedUserApplications = [
        ...(employer?.bookmarkedUserApplications || []),
        userApplication?.id,
      ];
      dispatch<any>(
        updateEmployer({ ...employer, bookmarkedUserApplications }),
      ).then(() => {
        // setMainBranch(() => ({ ...mainBranch, bookmarkedUserApplications }));
        setClickedItemId((pre) => ({ ...pre, bookmark: '' }));
      });
    }
  };
  const onReviewApplication = (userApplication: UserApplication) => {
    setClickedItemId((pre) => ({ ...pre, review: userApplication?.id }));
    const isReviewed = employer?.reviewedUserApplications?.includes(
      userApplication?.id,
    );
    if (isReviewed) {
      const reviewedUserApplications =
        employer?.reviewedUserApplications?.filter(
          (appId) => appId != userApplication?.id,
        );
      dispatch<any>(
        updateEmployer({ ...employer, reviewedUserApplications }),
      ).then(() => {
        // setMainBranch(() => ({ ...mainBranch, reviewedUserApplications }));
        setClickedItemId((pre) => ({ ...pre, review: '' }));
      });
    } else {
      const reviewedUserApplications = [
        ...(employer?.reviewedUserApplications || []),
        userApplication?.id,
      ];
      dispatch<any>(
        updateEmployer({ ...employer, reviewedUserApplications }),
      ).then(() => {
        // setMainBranch(() => ({ ...mainBranch, reviewedUserApplications }));
        setClickedItemId((pre) => ({ ...pre, review: '' }));
      });
    }
  };
  const onChatWithApplicant = (userApplication: UserApplication) => {
    setClickedItemId((pre) => ({ ...pre, message: userApplication?.id }));
    const selectedApplicantChat = userChats.filter((chat) => {
      return (
        chat.jobId == userApplication?.jobId &&
        chat.participants.includes(userApplication?.applicant?.id)
      );
    });
    if (selectedApplicantChat.length > 0) {
      // If there's already chat going on with this applicant
      const otherUser = getOtherUserDetail(
        selectedApplicantChat[0].participants,
        mongoUserId,
      );
      localStorage.setItem('lastChat', selectedApplicantChat[0]?.id);
      setSelectedChat({ ...selectedApplicantChat[0], otherUser });
      dispatch(setCurrentChatSlice({ ...selectedApplicantChat[0], otherUser }));
      navigate('/employer/chat');
    } else {
      // If there's no chat with this applicant, create one
      const newChatData: Chat = {
        participants: [currentUserId, userApplication?.applicant?.id], // Assuming chat participants are stored in an array
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        jobId: userApplication?.jobId, // or any other relevant fields for your application
        role: role,
        chatType: ChatTypes.IS_JOB_APPLICATION_CHAT,
        shouldBotStopResponding: false,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        isGroup: false,
        participantsDetails: [
          {
            // @ts-expect-error: TypeScript may not recognize 'isEmployer' as a valid property for this object type.
            isEmployer: true,
            id: currentUserId ?? '', // so that chat is between 2 users
            name: logedInUser?.name || 'Employer',
            userId: currentUserId,
            email: logedInUser.email,
            photoUrl: logedInUser?.photoUrl,
          },
          {
            // @ts-expect-error: TypeScript may not recognize 'isEmployer' as a valid property for this object type.
            isEmployer: false,
            id: userApplication?.applicant?.id ?? '',
            name:
              userApplication?.applicant?.name ??
              userApplication?.applicant?.email,
            email: userApplication?.applicant?.email,
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

            navigate('/employer/chat');
          } else {
            console.error('Failed to create chat:', response.error);
          }
        })
        .catch((error) => {
          console.error('Failed to dispatch setChat action:', error);
        });
    }
  };

  const onBookmarkStudent = (student: User) => {
    setClickedItemId((pre) => ({ ...pre, bookmark: student?.id }));
    const isBookmarked = employer?.bookmarkedStudents?.includes(student?.id);
    let bookmarkedStudents;
    if (isBookmarked) {
      bookmarkedStudents = employer?.bookmarkedStudents?.filter(
        (stId) => stId != student?.id,
      );
    } else {
      bookmarkedStudents = [
        ...(employer?.bookmarkedStudents || []),
        student?.id,
      ];
    }
    dispatch<any>(updateEmployer({ ...employer, bookmarkedStudents })).then(
      () => {
        // setMainBranch({ ...mainBranch, bookmarkedStudents });
        setClickedItemId((pre) => ({ ...pre, bookmark: '' }));
      },
    );
  };
  const onReviewStudent = (student: User) => {
    setClickedItemId((pre) => ({ ...pre, review: student?.id }));
    const isReviewed = employer?.reviewedStudents?.includes(student?.id);
    let reviewedStudents;
    if (isReviewed) {
      reviewedStudents = employer?.reviewedStudents?.filter(
        (stId) => stId != student?.id,
      );
    } else {
      reviewedStudents = [...(employer?.reviewedStudents || []), student?.id];
    }
    dispatch<any>(updateEmployer({ ...employer, reviewedStudents })).then(
      () => {
        // setMainBranch({ ...mainBranch, reviewedStudents });
        setClickedItemId((pre) => ({ ...pre, review: '' }));
      },
    );
  };
  const onChatWithStudent = (student: User) => {
    setClickedItemId((pre) => ({ ...pre, message: student?.id }));
    const selectedApplicantChat = userChats.filter((chat) =>
      chat?.participants?.find((pId) => pId == student?.id),
    );

    if (selectedApplicantChat.length > 0) {
      // If there's already chat going on with this student
      const otherUser = getOtherUserDetail(
        selectedApplicantChat[0].participants,
        mongoUserId,
      );
      localStorage.setItem('lastChat', selectedApplicantChat[0]?.id);
      setSelectedChat({ ...selectedApplicantChat[0], otherUser });
      dispatch(setCurrentChatSlice({ ...selectedApplicantChat[0], otherUser }));

      navigate('/employer/chat');
    } else {
      // If there's no chat with this student, create one
      const newChatData: Chat = {
        participants: [currentUserId, student?.id],
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        jobId: '',
        role,
        chatType: ChatTypes.IS_STUDENT_CHAT,
        shouldBotStopResponding: true,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        isGroup: false,
        participantsDetails: [
          {
            // @ts-expect-error: TypeScript may not recognize 'isEmployer' as a valid property for this object type.
            isEmployer: true,
            id: currentUserId ?? '',
            name: logedInUser?.name || 'Employer',
            userId: currentUserId,
            email: logedInUser.email,
            photoUrl: logedInUser?.photoUrl,
          },
          {
            // @ts-expect-error: TypeScript may not recognize 'isEmployer' as a valid property for this object type.
            isEmployer: false,
            id: student?.id ?? '',
            name: student?.name ?? student?.email,
            email: student?.email,
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
            navigate('/employer/chat');
          } else {
            console.error('Failed to create chat:', response.error);
          }
        })
        .catch((error) => {
          console.error('Failed to dispatch setChat action:', error);
        });
    }
  };

  const onDeleteNote = (note: string, type: 'Student' | 'UserApplication') => {
    setClickedItemId((pre) => ({ ...pre, deleteNote: note }));
    const udpatedItem: User | UserApplication = {
      ...(type == 'Student' ? selectedStudent : userApplication),
      employerNotes: (
        (type == 'Student' ? selectedStudent : userApplication).employerNotes ||
        []
      ).filter((n) => n.note.toLowerCase() != note.toLowerCase()),
    };
    if (type == 'Student') {
      dispatch<any>(
        updateMongoCandidate({
          userId: udpatedItem.id,
          userData: udpatedItem as User,
        }),
      ).then(() => {
        setSelectedStudent(udpatedItem as User);
        setClickedItemId((pre) => ({ ...pre, deleteNote: '' }));
      });
    } else {
      dispatch<any>(setUserApplication(udpatedItem as UserApplication)).then(
        () => {
          setUserApplication(udpatedItem as UserApplication);
          setClickedItemId((pre) => ({ ...pre, deleteNote: '' }));
        },
      );
    }
  };

  if (!selectedStudent && !selectedUserApplication) return;

  ///////////////////////////////////////////////////// COMPONENTS ///////////////////////////////////////////////////
  const Field = ({ title, value }: { title: string; value: string }) => {
    return (
      <div className="flex w-full flex-col gap-0.5 ">
        <span className="text-lg font-semibold">{title}</span>
        <p className="w-full rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 shadow-md ">
          {value || title}
        </p>
      </div>
    );
  };
  const SchoolDetails = ({ partner: p }: { partner: Partner }) => {
    return (
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-black">School Details</h4>
        <div className="w-full rounded-md border border-primary/50 bg-primary/10 p-4 ">
          <div className="flex items-center justify-start gap-3 ">
            <Avatar src={p?.photoUrl} initial={p?.name?.charAt(0)} size="sm" />
            <div className="flex flex-col  ">
              <p className="text-lg font-semibold text-black ">
                {p?.name || 'School name.'}
              </p>
              <p className="font-base text-sm">
                {p?.tagLine || 'Tagline of the school here.'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-col pl-15 ">
            <p className="font-base text-sm">
              {p?.addressLine1 || 'Address line of the school here.'}
            </p>
            <p className="font-base text-sm">
              {p?.city || 'School City'}, {p?.state || 'School State'}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const JobDetails = ({ job }: { job: Job }) => {
    return (
      <div className="flex w-full flex-col gap-2">
        <h4 className="text-lg font-semibold text-black">Job Details</h4>

        <div className="w-full rounded-md border border-primary bg-primary/10 p-4 ">
          <div className="block h-[14rem] w-full ">
            {job?.photoUrl ? (
              <img
                src={job?.photoUrl}
                alt="Job Image"
                className="h-full w-full rounded-md object-cover "
              />
            ) : (
              <div className="h-full w-full bg-graydark flex items-center justify-center rounded-md ">
                <span className="text-white text-xl ">Job Image Here</span>
              </div>
            )}
          </div>

          <div className="mt-2">
            <div className="flex flex-col">
              <span className="text-sm text-black ">Position, City: </span>
              <h4 className="mb-2 text-xl font-bold dark:text-white ">
                {job?.title || 'Job title here'}, {job?.city || 'City'}
              </h4>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-black ">Description: </span>
              <p>{job?.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const Note = ({
    note,
    dateCreated,
    type,
  }: {
    note: string;
    dateCreated: any;
    type: 'Student' | 'UserApplication';
  }) => {
    return (
      <div className="bg-primary/10 p-4 rounded-md flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-xs text-graydark">
            {extractDateTimeFromTimestamp(dateCreated)?.date}
          </p>
          <p className="text-md text-black">{note}</p>
        </div>
        <div className="flex justify-end items-center">
          <Tooltip placement="top" title={'Update Note'}>
            <IconButton
              onClick={() => {
                setNote(note);
                setOpenNoteModal(true);
              }}
            >
              {' '}
              {/* TODO: disabled={clickedItemId.deleteNote == note} */}
              <Pencil className={`text-gray-icon`} />
            </IconButton>
          </Tooltip>
          <Tooltip placement="top" title={'Delete Note'}>
            <IconButton onClick={() => onDeleteNote(note, type)}>
              {clickedItemId.deleteNote == note ? (
                <CLoader size="xs" />
              ) : (
                <Trash className={`text-meta-1`} />
              )}
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  };
  const Notes = ({
    notes,
    type,
  }: {
    notes: { note: string; dateCreated: any; employerId: string }[];
    type: 'Student' | 'UserApplication';
  }) => {
    return (
      <div className="flex w-full flex-col gap-2">
        <h4 className="text-lg font-semibold text-black">Notes</h4>
        {/* {notes.length == 0 && (
          <span className="text-center w-full ">Add Notes Here</span>
        )} */}
        <div className="flex flex-col gap-1 ">
          {notes?.map((note, index) => (
            <Note
              key={index}
              note={note?.note}
              dateCreated={note?.dateCreated}
              type={type}
            />
          ))}
        </div>
      </div>
    );
  };

  ///////////////////////////////////////////////////// RENDERS ///////////////////////////////////////////////////
  if (filterType == 'all') {
    const isBookmarked = employer?.bookmarkedStudents?.includes(
      selectedStudent?.id,
    );
    const isReviewed = employer?.reviewedStudents?.includes(
      selectedStudent?.id,
    );

    return (
      <>
        <CreateNoteForCandidate
          open={openNoteModal}
          setOpen={setOpenNoteModal}
          item={selectedStudent}
          type="Student"
          note={note}
          setNote={setNote}
          employerId={employerId}
        />
        <ViewJobDetailsOfCandidate
          open={openCandidateApplicationsModal}
          setOpen={setOpenCandidateApplicationsModal}
          applicantEmail={selectedStudent?.email}
        />
        <div className="h-full w-full rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ">
          <div className="flex items-start gap-2 px-6 py-5">
            <div className="relative flex w-full flex-col gap-2 ">
              {/* Personal Detila */}
              <div className="relative flex w-full flex-col gap-1 ">
                <div className="absolute left-0 top-0 flex justify-start mb-7 gap-1">
                  <Tooltip placement="top" title={'Go Back'}>
                    <IconButton onClick={goBack}>
                      <ArrowLeft size={30} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip placement="top" title={'Add Note'}>
                    <IconButton onClick={() => setOpenNoteModal(true)}>
                      <Pencil className={`fill-none text-gray-icon`} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip placement="top" title={'Application History'}>
                    <IconButton
                      onClick={() => setOpenCandidateApplicationsModal(true)}
                    >
                      <GalleryVerticalEnd
                        className={`fill-none text-gray-icon`}
                      />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="absolute right-0 top-0 flex justify-start gap-1">
                  <Tooltip
                    placement="top"
                    title={isBookmarked ? 'Remove from bookmark' : 'Bookmark'}
                  >
                    <IconButton
                      onClick={() => onBookmarkStudent(selectedStudent)}
                      disabled={clickedItemId.bookmark == selectedStudent?.id}
                    >
                      {clickedItemId.bookmark == selectedStudent?.id ? (
                        <CLoader size="xs" />
                      ) : (
                        <Bookmark
                          className={`${isBookmarked ? 'fill-primary' : 'fill-none'} text-gray-icon`}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    placement="top"
                    title={isReviewed ? 'Remove from review' : 'Review'}
                  >
                    <IconButton
                      onClick={() => onReviewStudent(selectedStudent)}
                      disabled={clickedItemId.review == selectedStudent?.id}
                    >
                      {clickedItemId.review == selectedStudent?.id ? (
                        <CLoader size="xs" />
                      ) : (
                        <FileCheck2
                          className={`${isReviewed ? 'fill-primary' : 'fill-none'} text-gray-icon`}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chat" placement="top">
                    <IconButton
                      onClick={() => onChatWithStudent(selectedStudent)}
                      disabled={clickedItemId.message == selectedStudent?.id}
                    >
                      {clickedItemId.message == selectedStudent?.id ? (
                        <CLoader size="xs" />
                      ) : (
                        <MessageCircle className="text-gray-icon" />
                      )}
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="mt-12">
                  <Avatar
                    src={selectedStudent?.photoUrl}
                    initial={selectedStudent?.name?.charAt(0)}
                    size="xl"
                  />
                </div>
                <Field title="Name" value={selectedStudent?.name} />
                <Field title="TagLine" value={selectedStudent?.tagLine} />
                <Field title="Bio" value={selectedStudent?.bio} />
                <Field
                  title="Program"
                  value={
                    typeof selectedStudent.program === 'object' &&
                    selectedStudent.program !== null
                      ? (selectedStudent.program as Program).name
                      : String(selectedStudent.program)
                  }
                />
                <Field title="City" value={selectedStudent?.city} />
                <Field title="State" value={selectedStudent?.state} />
                <button
                  onClick={() => window.open(selectedStudent?.pdfUrl, '_blank')}
                  className="text-white bg-graydark px-4 py-2 rounded"
                >
                  View and Download Resume
                </button>
                <div className="mt-2 flex w-full flex-wrap items-center justify-start gap-1 ">
                  {' '}
                  {/* TOTEST */}
                  {selectedStudent?.skills?.map((skill, index) => (
                    <Badge text={skill} variant="neutral" key={index} />
                  ))}
                </div>
              </div>

              {/* Partner Data */}
              {!partnerFetching && partner && (
                <SchoolDetails partner={partner} />
              )}

              {/* Notes */}
              <Notes
                notes={selectedStudent?.employerNotes || []}
                type="Student"
              />
            </div>
          </div>
        </div>
      </>
    );
  } else {
    const isBookmarked = employer?.bookmarkedUserApplications?.includes(
      userApplication?.id,
    );
    const isReviewed = employer?.reviewedUserApplications?.includes(
      userApplication?.id,
    );

    return (
      <>
        <CreateNoteForCandidate
          open={openNoteModal}
          setOpen={setOpenNoteModal}
          item={userApplication}
          type="UserApplication"
          note={note}
          setNote={setNote}
          employerId={employerId}
        />
        <div className="h-full w-full rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col items-start gap-2 px-6 py-5">
            <div className="relative flex w-full flex-col gap-1 ">
              <div className="absolute left-0 top-0 flex justify-start gap-1">
                <Tooltip placement="top" title={'Add Note'}>
                  <IconButton onClick={() => setOpenNoteModal(true)}>
                    <Pencil className={`fill-none text-gray-icon`} />
                  </IconButton>
                </Tooltip>
              </div>
              <div className="absolute right-0 top-0 flex justify-start gap-1">
                <Tooltip
                  placement="top"
                  title={isBookmarked ? 'Remove from bookmark' : 'Bookmark'}
                >
                  <IconButton
                    disabled={clickedItemId.bookmark == userApplication?.id}
                    onClick={() => onBookmarkApplication(userApplication)}
                  >
                    {clickedItemId.bookmark == userApplication?.id ? (
                      <CLoader size="xs" />
                    ) : (
                      <Bookmark
                        className={`${isBookmarked ? 'fill-primary' : 'fill-none'} text-gray-icon`}
                      />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip
                  placement="top"
                  title={isReviewed ? 'Remove from review' : 'Review'}
                >
                  <IconButton
                    disabled={clickedItemId.review == userApplication?.id}
                    onClick={() => onReviewApplication(userApplication)}
                  >
                    {clickedItemId.review == userApplication?.id ? (
                      <CLoader size="xs" />
                    ) : (
                      <FileCheck2
                        className={`${isReviewed ? 'fill-primary' : 'fill-none'} text-gray-icon`}
                      />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Chat" placement="top">
                  <IconButton
                    disabled={clickedItemId.message == userApplication?.id}
                    onClick={() => onChatWithApplicant(userApplication)}
                  >
                    {clickedItemId.message == userApplication?.id ? (
                      <CLoader size="xs" />
                    ) : (
                      <MessageCircle className="text-gray-icon" />
                    )}
                  </IconButton>
                </Tooltip>
              </div>
              <Avatar
                src={userApplication?.applicant?.photoUrl}
                initial={userApplication?.applicant?.name?.charAt(0)}
                size="xl"
              />
              <Field title="Name" value={userApplication?.applicant?.name} />
              <Field
                title="Tagline"
                value={userApplication?.applicant?.tagLine}
              />
              <Field title="Bio" value={userApplication?.applicant?.bio} />
              <div className="flex w-full items-center justify-between gap-2">
                <Field
                  title="Program"
                  value={
                    typeof userApplication?.applicant?.program === 'object' &&
                    userApplication?.applicant?.program !== null
                      ? (userApplication?.applicant?.program as Program).name
                      : String(userApplication?.applicant?.program)
                  }
                />
                <Field title="Status" value={userApplication?.status} />
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <Field title="City" value={userApplication?.applicant?.city} />
                <Field
                  title="State"
                  value={userApplication?.applicant?.state}
                />
              </div>

              <Field
                title="Date Submitted"
                value={
                  extractDateTimeFromTimestamp(userApplication?.dateCreated)
                    ?.date
                }
              />
              <button
                onClick={() => window.open(selectedStudent?.pdfUrl, '_blank')}
                className="text-white bg-graydark px-4 py-2 rounded"
              >
                View and Download Resume
              </button>
            </div>

            {/* Job Details */}
            <JobDetails job={userApplication?.job} />

            {/* Partner Data */}
            {!partnerFetching && partner && <SchoolDetails partner={partner} />}

            {/* Notes */}
            <Notes
              notes={userApplication?.employerNotes || []}
              type="UserApplication"
            />
          </div>
        </div>
      </>
    );
  }
};

export default MobileCandidateDetail;
