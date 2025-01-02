import 'flatpickr/dist/flatpickr.min.css';
import React, { useEffect, useMemo, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout.tsx';

import { FaCheck } from 'react-icons/fa';
import { MdEditCalendar } from 'react-icons/md';

import { RxCross2 } from 'react-icons/rx';

import CreateEvent from '../../components/Modals/CreateEvent.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store.ts';
import {
  fetchEventsByOrganizerId,
  fetchEventsByRequestedPartnerId,
  fetchInvitedEventsForEmployer,
  fetchJoinedEventsByEmployer,
  addEventsParticipants,
  fetchBulkEvents,
} from '../../store/reducers/eventSlice.ts';
import Calendar from './Calendar.tsx';
import Loader from '../../common/Loader/index.tsx';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.tsx';
import { Eye, Pencil, Search } from 'lucide-react';
import { Event, EventFile } from '../../interfaces/index.ts';
import ViewEventModal from '../../components/Modals/ViewEventModal.tsx';
import ViewBulkEventModal from '../../components/Modals/ViewBulkEventModal.tsx';
import NoteFromInstitution from '../../components/Modals/NoteFromInstitution.tsx';
import { fetchEmployersByEmail } from '../../store/reducers/employersSlice.ts';
import { IconButton, Tooltip } from '@mui/material';
import { extractDateTimeFromTimestamp } from '../../utils/functions.ts';
import { useStateContext } from '../../context/useStateContext.tsx';
import { Timestamp } from 'firebase/firestore';
import { EventStatus, EventTypes, UserRolesEnum } from '../../utils/enums.ts';
import UpdateBulkEventModal from '../../components/Modals/UpdateBulkEventModal.tsx';
// import { getDateFromTimestamp } from '../../utils/functions.ts';
import { parseDate } from '../../utils/datetime';
interface FilteredEvents {
  all: Event[];
  requested: Event[];
  joined: Event[];
  scheduled: Event[];
  reschedule: Event[];
  cancelled: Event[];
  invited: Event[];
  requestedByEmployers: Event[];
  allPlusJoined: Event[];
  upcomingEvents: Event[];
}

const Events: React.FC = () => {
  ///////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////////
  const {
    events: fetchedEvents,
    invitedEvents: fetchedInvitedEvents,
    joinedEvents: fetchedJoinedEvents,
    requestedEventsByEmployers: fetchedRequestedEventsByEmployers,
  } = useSelector((state: RootState) => state.event);
  const { user } = useSelector((state: RootState) => state.user);
  const { employer, branches } = useSelector(
    (state: RootState) => state.employer,
  );
  const bulkEvents = useSelector((state: RootState) => state.event.bulkEvents);
  const { setShowEventFormModal, setShowEventViewModal, page } =
    useStateContext();
  const authUser = useMemo(() => {
    const storedAuth = localStorage.getItem('auth');
    return storedAuth ? { ...JSON.parse(storedAuth), ...user } : user;
  }, [user]);
  const dispatch = useDispatch();
  const role = String(localStorage.getItem('Role'));

  // requestedTo
  const initialEventData: Event = {
    title: '',
    contactEmail: '',
    contactPhone: '',
    contactName: '',
    creater_role: '',
    contactTitle: '',
    hostName: '',
    purpose: '',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    createrEmail: authUser?.email,
    partnerId: authUser?.partnerId || '',
    employerId: employer?.id || '',
    createrRole: role,
    city: '',
    state: '',
    addressLine1: '',
    addressLine2: '',
    eventDate: '',
    eventFrom: '',
    eventTo: '',
    status: EventStatus.Requested,
    description: '', // optional
    zipCode: '', // optional
    url: '', // optional
    additionalComments: '', // optional
    studentIds: [], // optional
    carouselImages: [], // optional
    type: EventTypes.OffCampus,
    eventParticipants: [],
    noteFromInstitution: '',
    // for offcampus
    transportationDetails: '', // optional
    RSVP: '', // optional
    emergencyContactPhone: '', // optional
    agenda: '', // optional
    dressCode: '', // optional
    requestedEmployerIds: page == 'Institution' ? [] : [employer?.id],

    // for oncampus
    proposedDates: [],
    requestedPartnerId: authUser?.partnerId || '', // required for oncampus
    preferredLocationInSchool: '', // optional
    expectedAttendees: 0, // optional
    requestedProgram: '', // optional
    setupRequirements: '', // optional
    AVEquipmentNeeds: '', // optional
    cateringPreferences: '', // optional
    parkingArrangements: '', // optional
    isTest: false,
  };
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  const mongoUserId = localStorage.getItem('mongoUserId');
  ///////////////////////////////////////////////////// STATES ////////////////////////////////////////////////////////
  const [searchValue, setSearchValue] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    | 'all'
    | 'requested'
    | 'scheduled'
    | 'reschedule'
    | 'cancelled'
    | 'joined'
    | 'invited'
    | 'requestedByEmployers'
    | 'allPlusJoined'
    | 'upcomingEvents'
  >('upcomingEvents');
  const [initialData, setInitialData] = useState(initialEventData);
  const [loading, setLoading] = useState({
    scheduled: false,
    cancelled: false,
    reschedule: false,
  });
  const [filteredEvents, setFilteredEvents] = useState<FilteredEvents>({
    all: [],
    requested: [],
    scheduled: [],
    joined: [],
    reschedule: [],
    cancelled: [],
    invited: [],
    requestedByEmployers: [],
    allPlusJoined: [],
    upcomingEvents: [],
  });
  const [showProposeDateForm, setShowProposeDateForm] = useState(false);
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [statusForNote, setStatusForNote] = useState<EventStatus>(
    EventStatus.Scheduled,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBulkEvent, setSelectedBulkEvent] = useState<EventFile | null>(
    null,
  );
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const filteredBulkEvents = bulkEvents.filter(
    (eventFile) => eventFile.instituteName === authUser?.partnerName,
  );
  const all = filteredEvents?.allPlusJoined.length + filteredBulkEvents.length;
  const scheduled =
    filteredEvents?.scheduled?.length + filteredBulkEvents.length;
  ///////////////////////////////////////////////////// USE EFFECTS ////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchBulkEvents());
    dispatch<any>(fetchEmployersByEmail(authUser?.email));
    if (filteredEvents[selectedFilter]?.length > 0) return;
    setIsLoading(true);
    dispatch<any>(
      fetchEventsByOrganizerId({
        organizerType: page == 'Institution' ? 'institution' : 'branch',
        organizerId: page == 'Institution' ? mongoInstituteId : mongoUserId,
      }),
    ).finally(() => setIsLoading(false));
  }, [authUser?.email]);
  useEffect(() => {
    if (page == 'Employer' && branches?.length > 0)
      dispatch<any>(
        fetchInvitedEventsForEmployer({
          employerId: mongoUserId,
          page: 1,
          limit: 100000,
        }),
      );
  }, [branches]);
  useEffect(() => {
    if (employer)
      dispatch<any>(
        fetchJoinedEventsByEmployer({
          employerId: mongoUserId,
          page: 1,
          limit: 100000,
        }),
      );
  }, [employer]);
  useEffect(() => {
    if (page == 'Institution')
      dispatch<any>(
        fetchEventsByRequestedPartnerId({
          instituteId: mongoInstituteId,
          page: 1,
          limit: 1000000,
        }),
      );
  }, []);
  useEffect(() => {
    const filtered = getFilteredEvents();
    setFilteredEvents(filtered);

    if (filtered?.upcomingEvents?.length === 0) {
      setSelectedFilter('all');
    }
  }, [
    JSON.stringify({
      fetchedEvents,
      fetchedInvitedEvents,
      fetchedRequestedEventsByEmployers,
      fetchedJoinedEvents,
    }),
  ]);

  const getFilteredEvents = (): FilteredEvents => {
    const all = [...fetchedEvents, ...fetchedRequestedEventsByEmployers];

    const currentDate = new Date();
    const upcomingFetchedEvents = fetchedEvents.filter((e) => {
      const eventToDate = parseDate(e.eventTo);
      return eventToDate > currentDate && e.status !== 'Cancelled';
    });
    const upcomingRequestedByIdEvents =
      fetchedRequestedEventsByEmployers.filter((e) => {
        const eventToDate = parseDate(e.eventTo);
        return eventToDate > currentDate && e.status !== 'Cancelled';
      });
    const upcomingEvents = [
      ...upcomingFetchedEvents,
      ...upcomingRequestedByIdEvents,
    ];

    const joined = fetchedJoinedEvents;
    const requested = fetchedEvents.filter((e) => {
      const eventToDate = parseDate(e.eventTo);
      return eventToDate > currentDate && e.status === EventStatus.Requested;
    });

    const rescheduleFetchedEvents = fetchedEvents.filter((e) => {
      const eventToDate = parseDate(e.eventTo);
      return e.status === EventStatus.Reschedule && eventToDate > currentDate;
    });
    const rescheduleFetchedRequestedEventsById =
      fetchedRequestedEventsByEmployers.filter((e) => {
        const eventToDate = parseDate(e.eventTo);
        return e.status === EventStatus.Reschedule && eventToDate > currentDate;
      });
    const reschedule = [
      ...rescheduleFetchedEvents,
      ...rescheduleFetchedRequestedEventsById,
    ];
    const invited = fetchedInvitedEvents;

    const incomingRequestsById = fetchedRequestedEventsByEmployers.filter(
      (e) => {
        const eventToDate = parseDate(e.eventTo);
        return (
          (e.status == EventStatus.Requested ||
            e.status == EventStatus.Reschedule) &&
          eventToDate > currentDate
        );
      },
    );
    const requestedByEmployers = [...incomingRequestsById];

    const cancelledFetchedEvents = fetchedEvents.filter(
      (e) =>
        e.status === EventStatus.Cancelled &&
        !fetchedRequestedEventsByEmployers.map((e) => e?.id)?.includes(e?.id),
    );
    const cancelledRequestedByIdEvents =
      fetchedRequestedEventsByEmployers.filter(
        (e) => e.status === EventStatus.Cancelled,
      );
    const cancelled = [
      ...cancelledFetchedEvents,
      ...cancelledRequestedByIdEvents,
    ];

    const approvedRequestedByIdEvents =
      fetchedRequestedEventsByEmployers.filter((e) => {
        const eventToDate = parseDate(e.eventTo);
        return e.status == EventStatus.Scheduled && eventToDate > currentDate;
      });
    const scheduled = [
      ...approvedRequestedByIdEvents,
      ...fetchedEvents.filter((e) => {
        const eventToDate = parseDate(e.eventTo);
        return e.status === EventStatus.Scheduled && eventToDate > currentDate;
      }),
    ];
    const allPlusJoined =
      role === 'Admin' || role === 'Teacher'
        ? [...all]
        : [...all, ...joined, ...invited];
    const filtered: FilteredEvents = {
      all,
      scheduled,
      requested,
      cancelled,
      joined,
      reschedule,
      invited,
      requestedByEmployers,
      allPlusJoined,
      upcomingEvents,
    };
    return filtered;
  };
  const onSearch = () => {
    const d = getFilteredEvents();
    if (searchValue.trim().length == 0) {
      setFilteredEvents((pre) => ({
        ...pre,
        [selectedFilter]: d[selectedFilter],
      }));
      return;
    }

    const filtered = d[selectedFilter].filter(
      (e: Event) =>
        e.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        e.hostName.toLowerCase().includes(searchValue.toLowerCase()),
    );
    setFilteredEvents((pre) => ({ ...pre, [selectedFilter]: filtered }));
  };

  const formatDateToInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onOpenUpdateForm = (event: Event) => {
    setInitialData({
      ...event,
      eventDate: event?.eventDate?.seconds
        ? formatDateToInputValue(event?.eventDate.toDate())
        : formatDateToInputValue(new Date(event?.eventDate)),
      eventFrom:
        event?.eventFrom instanceof Timestamp
          ? formatDateToInputValue(event?.eventFrom.toDate())
          : formatDateToInputValue(new Date(event?.eventFrom)),
      eventTo:
        event?.eventTo instanceof Timestamp
          ? formatDateToInputValue(event?.eventTo.toDate())
          : formatDateToInputValue(new Date(event?.eventTo)),
    });

    setShowEventFormModal(true);
  };

  const onOpenViewModal = (event: Event) => {
    setShowProposeDateForm(false);
    setSelectedEvent(event);
    setShowEventViewModal(true);
  };

  // For Institution - to accept/reject/rescedule the employer event request
  const onApproveRejectReschedule = (event: Event, status: EventStatus) => {
    if (status == EventStatus.Reschedule) {
      setShowProposeDateForm(true);
      onOpenViewModal(event);
    } else {
      setSelectedEvent(event);
      setStatusForNote(status);
      setOpenNoteModal(true);
    }
  };
  const onOpenViewBulkEventModal = (eventFile: EventFile) => {
    setSelectedBulkEvent(eventFile);
    setModalOpen(true);
  };
  const handleOpenUpdateBulkEventForm = (eventFile: EventFile) => {
    setSelectedBulkEvent(eventFile);
    setUpdateModalOpen(true);
  };
  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedBulkEvent(null);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  // For Employer - to accept/reject the event invitation
  const onAcceptRejectInvitedEvent = (event: Event, status: EventStatus) => {
    // if event request is accepted by employer, then add it to scheduled events, add employer to eventParticipants and remove event from
    // invited events. If rejected, just remove employer from requestedEmployerIds
    setLoading((pre) => ({ ...pre, [status.toLowerCase()]: true }));
    const firstMatchingBranch = branches.find((branch) =>
      event.requestedEmployerIds.includes(branch.id),
    );

    dispatch<any>(
      addEventsParticipants({
        eventId: event.id,
        participantId: firstMatchingBranch,
        participantStatus: 'employer',
      }),
    ).then(({ payload }) => {
      setLoading((pre) => ({ ...pre, [status.toLocaleLowerCase()]: false }));
      setFilteredEvents((pre) => ({
        ...pre,
        joined:
          status == EventStatus.Scheduled
            ? [...pre.joined, payload]
            : [...pre.joined],
        invited: pre.invited.filter((e) => e?.id != payload?.id),
        scheduled:
          status == EventStatus.Scheduled
            ? [...pre.scheduled, payload]
            : [...pre.scheduled],
      }));
    });
  };
  return (
    <DefaultLayout>
      {/* {showEventPlanModal && <EventPlanPopup />} */}

      <div className="flex flex-col gap-6">
        <div className="mb-4">
          <Breadcrumb pageName="Events" />
          <p className="text-[17px]">
            Request, Register and View Events on campus and off campus here.
          </p>
        </div>
        <NoteFromInstitution
          open={openNoteModal}
          setOpen={setOpenNoteModal}
          selectedEvent={selectedEvent}
          status={statusForNote}
          setFilteredEvents={setFilteredEvents}
        />
        {selectedEvent && (
          <ViewEventModal
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            showProposeDateForm={showProposeDateForm}
            setShowProposeDateForm={setShowProposeDateForm}
          />
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-7 md:gap-6 2xl:gap-7.5 ">
          {/* Upcoming Events */}
          <div
            onClick={() => setSelectedFilter('upcomingEvents')}
            className={`${selectedFilter == 'all' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-blue-500  text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2 `}
          >
            <p className="text-xs text-center font-medium">Upcoming Events</p>
            <h3 className="text-xs font-bold text-black dark:text-white">
              {filteredEvents?.upcomingEvents?.length}
            </h3>
          </div>
          {/* All */}
          <div
            onClick={() => setSelectedFilter('allPlusJoined')}
            className={`${selectedFilter == 'all' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-blue-500  text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2 `}
          >
            <p className="text-xs text-center font-medium">All Events</p>
            <h3 className="text-xs font-bold text-black dark:text-white">
              {all}
            </h3>
          </div>

          {/* Pending For Approval  */}
          {page == 'Employer' ? (
            <div
              onClick={() => setSelectedFilter('requested')}
              className={`${selectedFilter == 'requested' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-blue-500  text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
            >
              <p className="text-xs text-center font-medium">
                Events Requested
              </p>
              <h3 className="text-xs font-bold text-black dark:text-white">
                {filteredEvents?.requested?.length}
              </h3>
            </div>
          ) : null}

          {/* Accepted */}
          <div
            onClick={() => setSelectedFilter('scheduled')}
            className={`${
              selectedFilter == 'scheduled'
                ? 'bg-gray scale-105 shadow-xl '
                : 'bg-white scale-100'
            } col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-green-500  text-green-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
          >
            <p className="text-xs text-center font-medium ">Events Scheduled</p>
            <h3 className="text-xs font-bold text-black dark:text-white">
              {scheduled}
            </h3>
          </div>

          {/* Rejected */}
          <div
            onClick={() => setSelectedFilter('cancelled')}
            className={`${selectedFilter == 'cancelled' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-red  text-red shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
          >
            <p className="text-xs text-center font-medium">Events Rejected</p>
            <h3 className="text-xs font-bold text-black dark:text-white">
              {filteredEvents?.cancelled?.length}
            </h3>
          </div>

          {/* Rejected */}

          <div
            onClick={() => setSelectedFilter('reschedule')}
            className={`${selectedFilter == 'reschedule' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-[#637381]  text-[#637381] shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
          >
            <p className="text-xs text-center font-medium">
              Reschedule Request
            </p>
            <h3 className="text-xs font-bold text-black dark:text-white">
              {filteredEvents?.reschedule?.length}
            </h3>
          </div>

          {/* Invited */}
          {page == 'Employer' && (
            <>
              <div
                onClick={() => setSelectedFilter('invited')}
                className={`${selectedFilter == 'invited' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-yellow-500  text-yellow-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
              >
                <p className="text-xs text-center font-medium">
                  Events Invited
                </p>
                <h3 className="text-xs font-bold text-black dark:text-white">
                  {filteredEvents?.invited?.length}
                </h3>
              </div>
              <div
                onClick={() => setSelectedFilter('joined')}
                className={`${selectedFilter == 'joined' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-yellow-500  text-yellow-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
              >
                <p className="text-xs text-center font-medium">Events Joined</p>
                <h3 className="text-xs font-bold text-black dark:text-white">
                  {filteredEvents?.joined?.length}
                </h3>
              </div>
            </>
          )}

          {/* Incoming Requests */}
          {page == 'Institution' && (
            <div
              onClick={() => setSelectedFilter('requestedByEmployers')}
              className={`${selectedFilter == 'requestedByEmployers' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-yellow-500  text-yellow-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
            >
              <p className="text-xs text-center font-medium">
                Incoming Requests
              </p>
              <h3 className="text-xs font-bold text-black dark:text-white">
                {
                  filteredEvents?.requestedByEmployers?.filter(
                    (item: any) => item.status == EventStatus.Requested,
                  )?.length
                }
              </h3>
            </div>
          )}

          {/* School Events */}
          {/* <div
            onClick={() => setSelectedFilter('school')}
            className={`${selectedFilter == 'school' ? 'bg-gray scale-105 shadow-xl ' : 'bg-white scale-100'} col-span-1 flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border border-yellow-500  text-yellow-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-2 p-2  `}
          >
            <p className="text-xs text-center font-medium">School Events</p>
            <h3 className="text-xs font-bold text-black dark:text-white">
              {filteredEvents.school.length}
            </h3>
          </div> */}
        </div>

        {/* Searchbar and CreateEvent */}
        <div className="flex items-center justify-between gap-2  ">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
            className="w-1/2"
          >
            <div className="relative w-full rounded-md bg-[#F9FAFB] px-4 py-3 dark:bg-meta-4 ">
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
                placeholder="Search for events by Event Name here"
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
              />
            </div>
          </form>

          <CreateEvent event={initialData} setInitialData={setInitialData} />
        </div>

        <div className="grid w-full grid-cols-12 gap-4 md:gap-4">
          <div className="col-span-12 space-y-4 xl:col-span-12 ">
            <div className="overflow-hidden rounded-[10px]">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* table header start */}
                  <div
                    style={{
                      gridTemplateColumns: 'repeat(14, minmax(0, 1fr))',
                    }}
                    className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
                  >
                    <div className="col-span-3">
                      <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                        Title
                      </h5>
                    </div>
                    <div className="col-span-2">
                      <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                        Event Start
                      </h5>
                    </div>
                    <div className="col-span-2">
                      <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                        Event End
                      </h5>
                    </div>
                    <div className="col-span-2">
                      <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                        Type
                      </h5>
                    </div>
                    <div className="col-span-2">
                      <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                        Status
                      </h5>
                    </div>
                    {/* <div className="col-span-2">
                          <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                            Description
                          </h5>
                        </div> */}
                    <div className="col-span-3">
                      <h5 className="text-center text-base font-bold text-[#1C2434] dark:text-bodydark">
                        Actions
                      </h5>
                    </div>
                  </div>
                  {/* table header end */}

                  {/* table body start */}
                  <div className="bg-white dark:bg-boxdark">
                    {isLoading ? (
                      <Loader />
                    ) : filteredEvents[selectedFilter]?.length === 0 &&
                      filteredBulkEvents.length === 0 ? (
                      <div className="flex h-[17rem] w-full items-center justify-center">
                        <p className="text-3xl font-semibold">No Events</p>
                      </div>
                    ) : (
                      <>
                        {/* Display events based on the selected filter */}
                        {filteredEvents[selectedFilter]?.map(
                          (event: Event, index: number) => (
                            <div
                              key={index}
                              style={{
                                gridTemplateColumns:
                                  'repeat(14, minmax(0, 1fr))',
                              }}
                              className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                            >
                              {/* Event Content Here */}
                              <div className="col-span-3 flex items-center justify-center">
                                <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                  {event?.title}
                                </p>
                              </div>
                              <div className="col-span-2 flex items-center justify-center">
                                <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                  {
                                    extractDateTimeFromTimestamp(
                                      event?.eventFrom,
                                    ).date
                                  }
                                </p>
                              </div>
                              <div className="col-span-2 flex items-center justify-center">
                                <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                  {
                                    extractDateTimeFromTimestamp(event?.eventTo)
                                      .date
                                  }
                                </p>
                              </div>
                              <div className="col-span-2 flex items-center justify-center">
                                <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                  {event?.type}
                                </p>
                              </div>
                              <div className="col-span-2 flex items-center justify-center">
                                <p
                                  className={`text-center text-sm ${
                                    event?.status === EventStatus.Scheduled
                                      ? 'text-meta-3'
                                      : event?.status === EventStatus.Requested
                                        ? 'text-meta-8'
                                        : event?.status ===
                                            EventStatus.Cancelled
                                          ? 'text-meta-1'
                                          : 'text-[#637381]'
                                  } dark:text-bodydark`}
                                >
                                  {selectedFilter === 'joined'
                                    ? 'Joined'
                                    : event?.status}
                                </p>
                              </div>
                              <div className="col-span-3">
                                <div className="flex items-center text-sm justify-center gap-1">
                                  <Tooltip title="View" placement="top">
                                    <IconButton
                                      onClick={() => onOpenViewModal(event)}
                                    >
                                      <Eye className="text-gray-icon" />
                                    </IconButton>
                                  </Tooltip>
                                  {/* Conditional Buttons */}
                                  {selectedFilter === 'invited' && (
                                    <>
                                      <button
                                        disabled={loading.scheduled}
                                        onClick={() =>
                                          onAcceptRejectInvitedEvent(
                                            event,
                                            EventStatus.Scheduled,
                                          )
                                        }
                                        className="rounded-md bg-black text-sm px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        disabled={loading.cancelled}
                                        onClick={() =>
                                          onAcceptRejectInvitedEvent(
                                            event,
                                            EventStatus.Cancelled,
                                          )
                                        }
                                        className="rounded-md bg-black text-sm px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {selectedFilter === 'requestedByEmployers' &&
                                    role === UserRolesEnum.SchoolAdmin && (
                                      <>
                                        <button
                                          disabled={loading.scheduled}
                                          onClick={() =>
                                            onApproveRejectReschedule(
                                              {
                                                ...event,
                                                approvedByAdmin: true,
                                              },
                                              EventStatus.Scheduled,
                                            )
                                          }
                                          className="rounded-md bg-black text-sm px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50"
                                        >
                                          <FaCheck />
                                        </button>
                                        <button
                                          disabled={loading.cancelled}
                                          onClick={() =>
                                            onApproveRejectReschedule(
                                              event,
                                              EventStatus.Cancelled,
                                            )
                                          }
                                          className="rounded-md bg-black text-sm px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50"
                                        >
                                          <RxCross2 />
                                        </button>
                                        <button
                                          disabled={loading.reschedule}
                                          onClick={() =>
                                            onApproveRejectReschedule(
                                              event,
                                              EventStatus.Reschedule,
                                            )
                                          }
                                          className="rounded-md bg-black text-sm px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50"
                                        >
                                          <MdEditCalendar />
                                        </button>
                                      </>
                                    )}
                                  {selectedFilter !== 'requestedByEmployers' &&
                                    selectedFilter !== 'invited' &&
                                    selectedFilter !== 'joined' && (
                                      <Tooltip title="Edit" placement="top">
                                        <IconButton
                                          onClick={() =>
                                            onOpenUpdateForm(event)
                                          }
                                        >
                                          <Pencil className="text-gray-icon" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                </div>
                              </div>
                            </div>
                          ),
                        )}

                        {/* display bulk events */}
                        {(selectedFilter === 'allPlusJoined' ||
                          selectedFilter === 'scheduled') &&
                          filteredBulkEvents.length > 0 && (
                            <>
                              {filteredBulkEvents.map(
                                (eventFile: EventFile, index: number) => (
                                  <div
                                    key={index}
                                    style={{
                                      gridTemplateColumns:
                                        'repeat(14, minmax(0, 1fr))',
                                    }}
                                    className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                                  >
                                    {/* Bulk Event Content Here */}
                                    <div className="col-span-3 flex items-center justify-center">
                                      <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                        {eventFile?.program}{' '}
                                        {/* Adjust as needed */}
                                      </p>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                      <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                        {eventFile.startDate}
                                      </p>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                      <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                        {eventFile.endDate}
                                      </p>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                      <p className="text-center text-sm text-[#637381] dark:text-bodydark">
                                        {eventFile.eventType}
                                      </p>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                      <p className="text-center text-sm text-meta-3 dark:text-bodydark">
                                        {eventFile.status}
                                      </p>
                                    </div>
                                    <div className="col-span-3">
                                      <div className="flex items-center text-sm justify-center gap-1">
                                        <Tooltip title="View" placement="top">
                                          <IconButton
                                            onClick={() =>
                                              onOpenViewBulkEventModal(
                                                eventFile,
                                              )
                                            }
                                          >
                                            <Eye className="text-gray-icon" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit" placement="top">
                                          <IconButton
                                            onClick={() =>
                                              handleOpenUpdateBulkEventForm(
                                                eventFile,
                                              )
                                            }
                                          >
                                            <Pencil className="text-gray-icon" />
                                          </IconButton>
                                        </Tooltip>
                                      </div>
                                    </div>
                                    <ViewBulkEventModal
                                      open={modalOpen}
                                      onClose={handleCloseModal}
                                      bulkevent={selectedBulkEvent}
                                    />
                                    <UpdateBulkEventModal
                                      open={updateModalOpen}
                                      onClose={handleCloseUpdateModal}
                                      bulkEvent={selectedBulkEvent}
                                    />
                                  </div>
                                ),
                              )}
                            </>
                          )}
                      </>
                    )}
                  </div>

                  {/* table body end */}
                </div>
              </div>
            </div>
            <Calendar events={filteredEvents[selectedFilter]} />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Events;
