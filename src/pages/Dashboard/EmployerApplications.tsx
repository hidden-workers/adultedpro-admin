import 'flatpickr/dist/flatpickr.min.css';
import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserApplicationsByEmployerEmail } from '../../store/reducers/userApplicationsSlice';
import { RootState } from '../../store/store';
import {
  Chat,
  Employer,
  UserApplication,
  LocalStorageAuthUser,
} from '../../interfaces';
import {
  setChat,
  fetchChats,
  setCurrentChatSlice,
} from '../../store/reducers/chatSlice';
import {
  extractDateTimeFromTimestamp,
  getOtherUserDetail,
  initiateOtherUserDetail,
  maskEmail,
} from '../../utils/functions';
import { useStateContext } from '../../context/useStateContext';
import { useNavigate } from 'react-router-dom';
import CLoader from '../../common/Loader';
import {
  fetchEmployerById,
  fetchEmployerBranchesByEmail,
  updateEmployer,
  setEmployerSlice,
} from '../../store/reducers/employersSlice';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Eye, MessageCircle, Search, Bookmark } from 'lucide-react';
import { ChatTypes, UserApplicationStatus } from '../../utils/enums';
import { fetchUsers } from '../../store/reducers/userSlice';
import {
  Tooltip,
  IconButton,
  CircularProgress,
  Pagination,
} from '@mui/material';

const EmployerApplications: React.FC = () => {
  ////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const applicationsPerPage = 30;

  const { userApplications: fetchedUserApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const {
    setSelectedChat,
    setSelectedUserApplication,
    setSelectedCandidatesFilter,
  } = useStateContext();
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const { chats } = useSelector((state: RootState) => state.chat);

  const { employer, branches: fetchedBranches } = useSelector(
    (state: RootState) => state.employer,
  );
  const role = String(localStorage.getItem('Role'));
  const [userChats, setUserChats] = useState(chats || []);
  const [clickedApplicationId, setClickedApplicationId] = useState({
    message: '',
    bookmark: '',
  });
  const [userApplications, setUserApplications] = useState(
    fetchedUserApplications || [],
  );
  const [branches, setBranches] = useState<Employer[]>(fetchedBranches || []);
  const [branch, setBranch] = useState<string>(employer?.id || '');
  const [searchValue, setSearchValue] = useState<string>('');
  const [showBookmarked, setShowBookmarked] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const employerId =
    fetchedUserApplications && fetchedUserApplications.length > 0
      ? fetchedUserApplications[0].employerId
      : '';
  const mongoUserId = localStorage.getItem('mongoUserId');
  useEffect(() => {
    if (fetchedUserApplications?.length > 0) return;
    setIsLoading(true);
    dispatch<any>(
      fetchUserApplicationsByEmployerEmail(authUser?.email),
    ).finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    dispatch<any>(fetchUsers([]));
    dispatch<any>(fetchChats());
  }, []);
  useEffect(() => {
    if (employerId) {
      dispatch<any>(fetchEmployerById(employerId));
    }
  }, [employerId]);
  useEffect(() => {
    dispatch<any>(fetchEmployerBranchesByEmail(authUser.email));
  }, []);
  useEffect(() => {
    if (showBookmarked) {
      const filtered = (
        searchValue.trim().length == 0
          ? userApplications
          : fetchedUserApplications
      ).filter((a: UserApplication) =>
        employer?.bookmarkedUserApplications?.includes(a.id),
      );

      setPage(1);
      setTotalPages(computeTotalPages(filterApplications(filtered)?.length));
      setUserApplications(filtered);
    } else {
      onSearch();
    }
  }, [showBookmarked]);
  useEffect(() => {
    let filtered = [];
    if (branch == 'all') filtered = fetchedUserApplications;
    else
      filtered = fetchedUserApplications.filter(
        (u) => u?.job?.branchLocation?.toLowerCase() == branch?.toLowerCase(),
      );
    setTotalPages(computeTotalPages(filterApplications(filtered)?.length));
    setUserApplications(filtered);
  }, [branch]);
  useEffect(() => {
    if (fetchedBranches) setBranches(fetchedBranches);
  }, [fetchedBranches]);
  useEffect(() => {
    setUserChats(chats);
  }, [chats]);
  useEffect(() => {
    setTotalPages(
      computeTotalPages(filterApplications(fetchedUserApplications)?.length),
    );
    setUserApplications(fetchedUserApplications);
  }, [fetchedUserApplications]);

  const onMessageClick = (userApplication: UserApplication) => {
    setClickedApplicationId((pre) => ({
      ...pre,
      message: userApplication?.id,
    }));

    const selectedApplicantChat = userChats.filter(
      (chat) =>
        chat?.participants?.some(
          //@ts-expect-error: might give error
          (participant) => participant?._id === userApplication?.applicant?.id,
        ) &&
        //@ts-expect-error: might give error
        (chat?.jobId?._id
          ? //@ts-expect-error: might give error
            chat?.jobId?._id === userApplication?.jobId
          : chat?.jobId === userApplication?.jobId),
    );
    if (selectedApplicantChat.length > 0) {
      const otherUser = getOtherUserDetail(
        selectedApplicantChat[0].participants,
        mongoUserId,
      );
      localStorage.setItem('lastChat', selectedApplicantChat[0]?.id);
      setSelectedChat({ ...selectedApplicantChat[0], otherUser });
      dispatch(setCurrentChatSlice({ ...selectedApplicantChat[0], otherUser }));
      navigate('/employer/chat');
    } else {
      const newChatData: Chat = {
        participants: [mongoUserId, userApplication?.applicant?.id],
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        jobId: userApplication?.jobId,
        role,
        chatType: ChatTypes.IS_JOB_APPLICATION_CHAT,
        shouldBotStopResponding: false,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        isGroup: false,
        participantsDetails: [
          {
            // @ts-expect-error: TypeScript may not recognize 'isEmployer' as a valid property for this object type.
            isEmployer: true,
            id: mongoUserId ?? '', // so that chat is between 2 users
            name: authUser?.name || 'Employer',
            userId: mongoUserId,
            email: authUser?.email,
            photoUrl: authUser?.photoUrl,
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
            const otherUser = initiateOtherUserDetail(
              response.payload.participants,
              mongoUserId,
            );
            localStorage.setItem('lastChat', response.payload?.id);
            setSelectedChat({ ...response.payload, otherUser });
            dispatch(setCurrentChatSlice({ ...response.payload, otherUser }));

            setClickedApplicationId((pre) => ({ ...pre, message: '' }));

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
  const onSearch = () => {
    const filtered = fetchedUserApplications.filter(
      (e: UserApplication) =>
        e?.applicant?.name
          ?.toLowerCase()
          .includes(searchValue?.toLowerCase()) ||
        e?.job?.title?.toLowerCase().includes(searchValue?.toLowerCase()),
    );
    const result =
      searchValue.trim().length == 0 ? fetchedUserApplications : filtered;
    setTotalPages(computeTotalPages(filterApplications(result)?.length));
    setUserApplications(result);
  };
  const onBookmark = (userApplication: UserApplication) => {
    setClickedApplicationId((pre) => ({
      ...pre,
      bookmark: userApplication?.id,
    }));
    const isBookmarked = employer?.bookmarkedUserApplications?.includes(
      userApplication?.id,
    );
    if (isBookmarked) {
      dispatch<any>(
        updateEmployer({
          ...employer,
          bookmarkedUserApplications:
            employer?.bookmarkedUserApplications?.filter(
              (appId) => appId != userApplication?.id,
            ),
        }),
      ).then(() => {
        dispatch(
          setEmployerSlice({
            ...employer,
            bookmarkedUserApplications:
              employer?.bookmarkedUserApplications?.filter(
                (appId) => appId != userApplication?.id,
              ),
          }),
        );
        setClickedApplicationId((pre) => ({ ...pre, bookmark: '' }));
      });
    } else {
      dispatch<any>(
        updateEmployer({
          ...employer,
          bookmarkedUserApplications: [
            ...(employer?.bookmarkedUserApplications || []),
            userApplication?.id,
          ],
        }),
      ).then(() => {
        dispatch(
          setEmployerSlice({
            ...employer,
            bookmarkedUserApplications: [
              ...(employer?.bookmarkedUserApplications || []),
              userApplication?.id,
            ],
          }),
        );
        setClickedApplicationId((pre) => ({ ...pre, bookmark: '' }));
      });
    }
  };
  const onViewProfile = (userApplication: UserApplication) => {
    setSelectedUserApplication(userApplication);
    setSelectedCandidatesFilter(userApplication?.status.replace(/\s/g, ''));
    setSelectedCandidatesFilter('applied');
    navigate('/employer/candidates');
  };
  const computeTotalPages = (arrayLength: number) => {
    return Math.ceil(arrayLength / applicationsPerPage);
  };
  const filterApplications = (applications: UserApplication[]) => {
    return applications?.filter(
      (item: any) =>
        item?.status?.toLowerCase() !== UserApplicationStatus.Rejected &&
        item?.status?.toLowerCase() !== UserApplicationStatus.Skipped &&
        item?.status?.toLowerCase() !== UserApplicationStatus.Bookmarked,
    );
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col ">
        <div className="mb-4">
          <Breadcrumb
            pageName="Applications"
            size={filterApplications(userApplications)?.length}
          />
          <p className="text-[15px] md:text-[17px]">
            Review all candidates applying to your open positions here
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          {/* Applications */}
          <div className="col-span-12">
            <div className="rounded-sm border border-stroke bg-white px-4 md:px-5 pb-2.5 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
              <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSearch();
                  }}
                  className="w-full md:w-1/2"
                >
                  <div className="relative w-full rounded-md bg-[#F9FAFB] px-4 py-3 dark:bg-meta-4">
                    <button
                      type="button"
                      title="Search"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                    >
                      <Search />
                    </button>
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyUp={() => onSearch()}
                      placeholder="Search by Position or Applicant Name"
                      className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
                    />
                  </div>
                </form>

                <div className="flex w-full md:w-1/2 items-center justify-end gap-2">
                  <span className="text-sm md:text-base font-medium">
                    Select Branch:
                  </span>
                  <select
                    className="w-full md:w-48 rounded border border-stroke bg-gray px-2 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    name="branch"
                    onChange={(e) => setBranch(e.target.value)}
                    value={branch}
                    id="branch"
                    title="Branch Selection"
                  >
                    {branches.length === 0 ? (
                      <option value="">No Branch</option>
                    ) : (
                      <option value="all">All</option>
                    )}
                    {branches.map((e, index) => (
                      <option value={e.branchLocation} key={index}>
                        {e.branchLocation}
                      </option>
                    ))}
                  </select>
                  <label className="relative flex cursor-pointer select-none items-center gap-2 px-2 md:px-4 py-2 md:py-3 text-sm md:text-lg font-medium">
                    <input
                      className="sr-only"
                      type="checkbox"
                      name="recommend"
                      onChange={(e) => setShowBookmarked(e.target.checked)}
                    />
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        showBookmarked ? 'border-primary' : 'border-body'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-sm  ${
                          showBookmarked ? 'flex bg-primary' : ''
                        }`}
                      />
                    </span>
                    Bookmarked
                  </label>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-5 rounded-sm bg-gray-2 dark:bg-meta-4 min-w-[600px]">
                    <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
                      <h5 className="text-sm md:text-lg  font-bold xsm:text-base">
                        Position
                      </h5>
                      <Tooltip
                        title="The Open Role being recruited for. You can add/remove/update jobs from Job Central in the sidebar"
                        placement="top"
                      >
                        <span className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border border-white bg-black text-xs text-white">
                          ?
                        </span>
                      </Tooltip>
                    </div>

                    <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
                      <h5 className="text-sm md:text-lg  font-bold xsm:text-base">
                        Applicant Name
                      </h5>
                      <Tooltip
                        title="This is the username for each applicant - you can browse details for this and other candidates in the Candidate sidebar"
                        placement="top"
                      >
                        <span className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border border-white bg-black text-xs text-white">
                          ?
                        </span>
                      </Tooltip>
                    </div>

                    <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
                      <h5 className="text-sm md:text-lg  font-bold xsm:text-base">
                        Apply Date
                      </h5>
                      <Tooltip
                        title="Apply Date of the applicant for the job. You can view the details of the applicant and continue chatting with them here."
                        placement="top"
                      >
                        <span className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border border-white bg-black text-xs text-white">
                          ?
                        </span>
                      </Tooltip>
                    </div>

                    <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
                      <h5 className="text-sm md:text-lg  font-bold xsm:text-base">
                        Status
                      </h5>
                      <Tooltip
                        title="Default status is Chatting, but you can invite to interview, and reject from the chat page and candidate page"
                        placement="top"
                      >
                        <span className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border border-white bg-black text-xs text-white">
                          ?
                        </span>
                      </Tooltip>
                    </div>

                    <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
                      <h5 className="text-sm md:text-lg  font-bold xsm:text-base">
                        Action
                      </h5>
                      <Tooltip
                        title="You can view details on each candidate, continue chatting or bookmark a candidate for later here"
                        placement="top"
                      >
                        <span className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border border-white bg-black text-xs text-white">
                          ?
                        </span>
                      </Tooltip>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex w-full items-center justify-center ">
                      <CLoader />
                    </div>
                  ) : (
                    <>
                      {userApplications.length > 0
                        ? filterApplications(userApplications)
                            ?.slice(
                              (page - 1) * applicationsPerPage,
                              page * applicationsPerPage,
                            )
                            ?.map((userApplication, index) => {
                              const isBookmarked =
                                employer?.bookmarkedUserApplications?.includes(
                                  userApplication?.id,
                                );

                              return (
                                <div
                                  className={`grid grid-cols-5 ${
                                    index === userApplications.length - 1
                                      ? ''
                                      : 'border-b border-stroke dark:border-strokedark'
                                  }`}
                                  key={index}
                                >
                                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                                    <p className="text-center text-black dark:text-white ">
                                      {userApplication?.job?.title},{' '}
                                      {userApplication?.job?.city}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                                    <p className=" text-center text-black dark:text-white sm:block">
                                      {userApplication?.applicant?.name ||
                                        maskEmail(
                                          userApplication?.applicant?.email,
                                        )}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                                    <p className=" text-center text-black dark:text-white sm:block">
                                      {
                                        extractDateTimeFromTimestamp(
                                          userApplication?.dateCreated,
                                        )?.date
                                      }
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-center p-2.5">
                                    <p
                                      className={`${
                                        userApplication?.status.toLowerCase() ==
                                        UserApplicationStatus.Interviewing
                                          ? 'text-meta-10'
                                          : userApplication?.status.toLowerCase() ==
                                              UserApplicationStatus.Disqualified
                                            ? 'text-meta-1'
                                            : userApplication?.status.toLowerCase() ==
                                                UserApplicationStatus.Hired
                                              ? 'text-meta-3'
                                              : 'text-meta-6'
                                      } text-center`}
                                    >
                                      {userApplication?.status.toLowerCase() ==
                                      UserApplicationStatus.Interviewing
                                        ? 'Invited To Interview'
                                        : userApplication?.status.toLowerCase() ==
                                            UserApplicationStatus.Disqualified
                                          ? 'Rejected'
                                          : userApplication?.status.toLowerCase() ==
                                              UserApplicationStatus.Hired
                                            ? 'Hired'
                                            : 'Chatting'}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-center p-2.5 gap-2">
                                    <Tooltip
                                      title={
                                        isBookmarked
                                          ? 'Remove from bookmark'
                                          : 'Bookmark'
                                      }
                                      placement="top"
                                    >
                                      <IconButton
                                        disabled={
                                          clickedApplicationId.bookmark ==
                                          userApplication?.id
                                        }
                                        onClick={() =>
                                          onBookmark(userApplication)
                                        }
                                      >
                                        {clickedApplicationId.bookmark ==
                                        userApplication?.id ? (
                                          <CircularProgress
                                            style={{
                                              width: '1rem',
                                              height: '1rem',
                                            }}
                                          />
                                        ) : (
                                          <Bookmark
                                            className={`${
                                              isBookmarked
                                                ? 'fill-primary'
                                                : 'fill-none'
                                            } text-gray-icon`}
                                          />
                                        )}
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip
                                      title="View Profile"
                                      placement="top"
                                    >
                                      <IconButton
                                        onClick={() =>
                                          onViewProfile(userApplication)
                                        }
                                      >
                                        <Eye className="text-gray-icon" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Chat" placement="top">
                                      <IconButton
                                        disabled={
                                          clickedApplicationId.message ==
                                          userApplication?.id
                                        }
                                        onClick={() =>
                                          onMessageClick(userApplication)
                                        }
                                      >
                                        {clickedApplicationId.message ==
                                        userApplication?.id ? (
                                          <CircularProgress
                                            style={{
                                              width: '1rem',
                                              height: '1rem',
                                            }}
                                          />
                                        ) : (
                                          <MessageCircle className="text-gray-icon" />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                  </div>
                                </div>
                              );
                            })
                        : searchValue.length > 0
                          ? 'No application matches your search criteria.'
                          : 'No candidates have applied to any of your jobs yet.'}
                    </>
                  )}
                </div>

                <div className="w-full flex justify-center mt-4 mb-2">
                  <Pagination
                    count={totalPages}
                    defaultPage={1}
                    page={page}
                    siblingCount={0}
                    onChange={(_, page) => setPage(page)}
                    size="large"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EmployerApplications;
