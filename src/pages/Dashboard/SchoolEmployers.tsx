import 'flatpickr/dist/flatpickr.min.css';
import React, { useEffect, useState, useMemo } from 'react';
import DefaultLayout from '../../layout/DefaultLayout.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store.ts';
import { fetchEmployers } from '../../store/reducers/employersSlice.ts';
import {
  fetchChats,
  setChat,
  setCurrentChatSlice,
} from '../../store/reducers/chatSlice';
import Loader from '../../common/Loader/index.tsx';
import CLoader from '../../common/CLoader';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.tsx';
import { Eye, MessageCircle, BookOpen, Search } from 'lucide-react';
import { IconButton, Pagination, Tooltip } from '@mui/material';
import Avatar from '../../components/Avatars/Avatar.tsx';
import ViewEmployerModal from '../../components/Modals/ViewEmployerModal.tsx';
import { useNavigate } from 'react-router-dom';
import { Chat, Employer, LocalStorageAuthUser } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import { fetchUsers } from '../../store/reducers/userSlice.ts';
import CreateEmployerModal from '../../components/Modals/CreateEmployerModal.tsx';
import { fetchPartnerById } from '../../store/reducers/partnerSlice.ts';
import { ChatTypes } from '../../utils/enums.ts';
import ViewEmployerJobs from '../../components/Modals/ViewEmployerJobs.tsx';
import { fetchAllJobsCount } from '../../store/reducers/jobSlice.ts';
import {
  getOtherUserDetail,
  initiateOtherUserDetail,
} from '../../utils/functions';

const SchoolEmployers: React.FC = () => {
  ///////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const employersPerPage = 30;
  const { allEmployers } = useSelector((state: RootState) => state.employer);
  const { allJobsCount } = useSelector((state: RootState) => state.job);
  const currentUserId = String(localStorage.getItem('userId'));
  const { chats } = useSelector((state: RootState) => state.chat);
  const { setSelectedChat } = useStateContext();
  const role = String(localStorage.getItem('Role'));
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  const mongoUserId = localStorage.getItem('mongoUserId');
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  ///////////////////////////////////////////////////// STATES ////////////////////////////////////////////////////////
  const [employers, setEmployers] = useState(allEmployers);
  const [loading, setLoading] = useState(false);
  const [openViewEmployerModal, setOpenViewEmployerModal] = useState(false);
  const [openViewJobsModal, setOpenViewJobsModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [userChats, setUserChats] = useState(chats || []);
  const [clickedItemId, setClickedItemId] = useState({ message: '' });
  const [searchValue, setSearchValue] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('date');
  const [dateOrder, setDateOrder] = useState('newest');
  const [associationFilter, setAssociationFilter] = useState('all'); // 'all', 'associated', 'not_associated'
  ///////////////////////////////////////////////////// USE EFFECTS ////////////////////////////////////////////////////////
  useEffect(() => {
    if (allEmployers?.length > 0) {
      return;
    }
    setLoading(true);
    dispatch<any>(fetchEmployers()).then(() => {
      setLoading(false);
    });
  }, [allEmployers, dispatch]);

  useEffect(() => {
    dispatch<any>(fetchUsers([]));
    dispatch<any>(fetchChats());
    dispatch<any>(fetchAllJobsCount());
  }, []);
  useEffect(() => {
    dispatch<any>(fetchPartnerById(mongoInstituteId));
  }, [authUser]);
  useEffect(() => {
    const filteredEmployers = allEmployers.filter((employer) => {
      // Apply association filter
      if (associationFilter === 'associated') {
        return employer?.partner;
      } else if (associationFilter === 'not_associated') {
        return !employer?.partner;
      }
      return true;
    });
    // Sort employers based on the selected order
    const sortedEmployers = filteredEmployers.sort((a, b) => {
      if (sortOrder === 'alphabetical') {
        return (a.name || '').localeCompare(b.name || '');
      } else {
        const dateA = parseDate(a.dateCreated);
        const dateB = parseDate(b.dateCreated);
        return dateOrder === 'newest'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      }
    });
    setPage(1); // Reset to the first page after filtering/sorting
    setTotalPages(computeTotalPages(sortedEmployers));
    setEmployers(sortedEmployers); // Set the final filtered and sorted list
  }, [allEmployers, associationFilter, sortOrder, dateOrder]);

  useEffect(() => {
    setUserChats(chats);
  }, [chats]);
  const startIndex = (page - 1) * employersPerPage;
  const endIndex = startIndex + employersPerPage;
  const newEmp = useMemo(
    () => employers.slice(startIndex, endIndex),
    [employers, startIndex, endIndex],
  );
  ///////////////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////////////////
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    if (event.target.value === 'date') {
      setDateOrder('newest');
    }
  };

  const handleDateOrderChange = (event) => {
    setDateOrder(event.target.value);
  };

  const handleAssociationFilterChange = (event) => {
    setAssociationFilter(event.target.value);
  };

  const parseDate = (date) => {
    if (date instanceof Date) {
      // It's already a JavaScript Date object, return it directly
      return date;
    } else if (typeof date === 'string') {
      // Check if it's a valid JavaScript Date string
      const dateFormat = new Date(date);
      if (!isNaN(dateFormat.getTime())) {
        return dateFormat;
      }
      return new Date(date); // Handle ISO 8601 strings
    } else if (typeof date === 'object') {
      if (date.seconds !== undefined) {
        // Handle Firestore Timestamp object with seconds and nanoseconds
        return new Date(
          date.seconds * 1000 + (date.nanoseconds || 0) / 1000000,
        );
      } else if (date.nanoseconds !== undefined) {
        // Handle Firestore Timestamp object with nanoseconds
        return new Date(date.nanoseconds / 1000000);
      }
    }
    return new Date(0); // Default fallback
  };
  const onChatWithEmployer = (employer: Employer) => {
    const findedUser = allEmployers.find(
      (employerData) => employer?.id === employerData?.id,
    );
    setClickedItemId((pre) => ({ ...pre, message: employer?.id }));
    const selectedEmployerChat = userChats.filter((chat) => {
      return chat?.participants?.includes(findedUser?.userId);
    });

    if (selectedEmployerChat.length > 0) {
      const otherUser = getOtherUserDetail(
        selectedEmployerChat[0]?.participants,
        mongoUserId,
      );
      localStorage.setItem('lastChat', selectedEmployerChat[0]?.id);
      setSelectedChat({ ...selectedEmployerChat[0], otherUser });
      dispatch(setCurrentChatSlice({ ...selectedEmployerChat[0], otherUser }));

      navigate('/institution/chat');
    } else {
      const newChatData: Chat = {
        participants: [currentUserId, findedUser?.userId ?? ''],
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        jobId: '',
        role: role ?? '',
        chatType: ChatTypes.Employer,
        shouldBotStopResponding: true,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        isGroup: false,
        participantsDetails: [
          {
            // @ts-expect-error: TypeScript error is expected due to missing property types
            isEmployer: false,
            id: currentUserId ?? '',
            name: authUser?.name || 'Institution',
            userId: currentUserId ?? '',
            email: authUser?.email ?? '',
            photoUrl: authUser?.photoUrl ?? '',
          },
          {
            // @ts-expect-error: TypeScript error is expected due to missing property types
            isEmployer: true,
            id: findedUser?.userId ?? '',
            name: findedUser?.name ?? findedUser?.email ?? 'Unknown',
            email: findedUser?.email ?? '',
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
  const onSearch = () => {
    const filtered = allEmployers.filter(
      (employer: Employer) =>
        employer?.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        employer?.branchLocation
          ?.toLowerCase()
          .includes(searchValue?.toLowerCase()) ||
        employer?.email?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        employer?.city?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        employer?.state?.toLowerCase().includes(searchValue?.toLowerCase()),
    );
    const result = searchValue?.trim().length == 0 ? allEmployers : filtered;
    setPage(1);
    setTotalPages(computeTotalPages(result));
    setEmployers(result);
  };
  const computeTotalPages = (array: Employer[]) => {
    return Math.ceil(array.length / employersPerPage);
  };
  ///////////////////////////////////////////////////// RENDER ////////////////////////////////////////////////////////
  return (
    <DefaultLayout>
      <CreateEmployerModal
        open={openCreateModal}
        setOpen={setOpenCreateModal}
      />
      <ViewEmployerModal
        open={openViewEmployerModal}
        setOpen={setOpenViewEmployerModal}
        selectedEmployer={selectedEmployer}
      />
      <ViewEmployerJobs
        open={openViewJobsModal}
        setOpen={setOpenViewJobsModal}
        employerId={selectedEmployer?.userId}
      />

      <div className="flex flex-col gap-6">
        <div className="mb-4">
          <Breadcrumb pageName="Employers" />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 bg-white p-5 rounded-sm border border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Employers Count */}
          <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
            <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
              {employers?.length}
            </h4>
            <p className="text-sm text-center font-medium">Employers Count</p>
          </div>

          {/* Jobs Count */}
          <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark sm:border-b-0 sm:pb-0 xl:border-r">
            <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
              {allJobsCount}
            </h4>
            <p className="text-sm text-center font-medium">Jobs Count</p>
          </div>

          {/* Total Conversation */}
          <div className="flex flex-col items-center justify-center gap-2">
            <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
              {
                userChats?.filter(
                  (chat) => chat?.chatType == ChatTypes.Employer,
                )?.length
              }
            </h4>
            <p className="text-sm text-center font-medium">
              Total Conversation
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 ">
          <div className="relative w-1/2 rounded-md bg-[#F9FAFB] px-4 py-3 dark:bg-meta-4 ">
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
              placeholder="Type to search..."
              className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
            />
          </div>

          <button
            className="flex h-fit justify-center text-sm rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50 "
            onClick={() => setOpenCreateModal(true)}
          >
            Add Employer
          </button>
        </div>
        <div className="flex overflow-x-auto space-x-4 py-2">
          <select
            id="associationFilter"
            value={associationFilter}
            onChange={handleAssociationFilterChange}
            className="rounded border border-gray-300 bg-white text-gray-800 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition w-40 sm:w-auto"
          >
            <option value="all">All Employers</option>
            <option value="associated">Associated with Schools</option>
            <option value="not_associated">Not Associated with Schools</option>
          </select>

          <select
            id="sortOrder"
            value={sortOrder}
            onChange={handleSortChange}
            className="rounded border border-gray-300 bg-white text-gray-800 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition w-40 sm:w-auto"
          >
            <option value="date">Date Created</option>
            <option value="alphabetical">Alphabetical Order</option>
          </select>

          {/* Conditional Rendering for Date Order Dropdown */}
          {sortOrder === 'date' && (
            <select
              id="dateOrder"
              value={dateOrder}
              onChange={handleDateOrderChange}
              className="rounded border border-gray-300 bg-white text-gray-800 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition w-40 sm:w-auto"
            >
              <option value="newest">Newest to Oldest</option>
              <option value="oldest">Oldest to Newest</option>
            </select>
          )}
        </div>

        <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-12">
            {loading ? (
              <Loader />
            ) : employers?.length === 0 ? (
              <div className="flex h-[17rem] w-full items-center justify-center">
                <p className="text-3xl font-semibold">No Employers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {newEmp?.map((employer: Employer, index: number) => (
                  <div
                    key={index}
                    className="bg-white shadow-lg rounded-lg p-6 dark:bg-boxdark w-full overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex items-start space-x-4 mb-5">
                      <div className="flex-shrink-0">
                        <Avatar
                          src={employer?.logo}
                          initial={employer?.name?.charAt(0)}
                          size="md"
                        />
                      </div>

                      <div className="flex-grow">
                        <p className="font-bold text-xl text-[#1C2434] dark:text-bodydark whitespace-normal">
                          {employer?.name}
                        </p>
                        <Tooltip title={employer?.email} placement="top">
                          <p className="text-sm text-[#637381] dark:text-bodydark whitespace-normal  max-w-[200px] truncate">
                            Email: {employer?.email}
                          </p>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Statistics Section */}
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div>
                        <p className="text-xl font-semibold text-[#1C2434] dark:text-bodydark">
                          {employer.jobCount}
                        </p>
                        <p className="text-sm text-[#637381] dark:text-bodydark">
                          Jobs
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#1C2434] dark:text-bodydark">
                          {employer.totalSwipes}
                        </p>
                        <p className="text-sm text-[#637381] dark:text-bodydark">
                          Swipes
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#1C2434] dark:text-bodydark">
                          {employer.applicationsCount}
                        </p>
                        <p className="text-sm text-[#637381] dark:text-bodydark">
                          Applications
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end mt-2">
                      <Tooltip title="View Profile" placement="top">
                        <IconButton
                          onClick={() => {
                            setSelectedEmployer(employer);
                            setOpenViewEmployerModal(true);
                          }}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            },
                          }}
                        >
                          <Eye className="text-gray-icon" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="View Jobs" placement="top">
                        <IconButton
                          onClick={() => {
                            setSelectedEmployer(employer);
                            setOpenViewJobsModal(true);
                          }}
                          disabled={employer?.userId === undefined}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            },
                          }}
                        >
                          <BookOpen className="text-gray-icon" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Chat" placement="top">
                        <IconButton
                          onClick={() => onChatWithEmployer(employer)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            },
                          }}
                          disabled={
                            clickedItemId.message === employer?.id ||
                            !userChats?.length ||
                            employer?.userId === undefined
                          }
                        >
                          {clickedItemId.message === employer?.id ? (
                            <CLoader size="xs" />
                          ) : (
                            <MessageCircle
                              className={`text-gray-icon ${!userChats?.length ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="w-full flex text-sm justify-center mt-4 mb-2">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SchoolEmployers;
