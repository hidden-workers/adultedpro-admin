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
  fetchAllEvents,addEventsParticipants
} from '../../store/reducers/eventSlice.ts';
import Calendar from './Calendar.tsx';
import Loader from '../../common/Loader/index.tsx';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.tsx';
import { Eye, Pencil, Search } from 'lucide-react';
import { Event } from '../../interfaces/index.ts';
import ViewEventModal from '../../components/Modals/ViewEventModal.tsx';
// import ViewBulkEventModal from '../../components/Modals/ViewBulkEventModal.tsx';
import NoteFromInstitution from '../../components/Modals/NoteFromInstitution.tsx';
import { fetchEmployersByEmail } from '../../store/reducers/employersSlice.ts';
import { IconButton, Tooltip } from '@mui/material';
import { extractDateTimeFromTimestamp } from '../../utils/functions.ts';
import { useStateContext } from '../../context/useStateContext.tsx';
import { Timestamp } from 'firebase/firestore';
import { EventStatus, EventTypes, UserRolesEnum } from '../../utils/enums.ts';
// import UpdateBulkEventModal from '../../components/Modals/UpdateBulkEventModal.tsx';
// import { getDateFromTimestamp } from '../../utils/functions.ts';
import { parseDate } from '../../utils/datetime';
import { truncate } from '../../utils/functions.ts';

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
    allEvents: fetchedAllEvents,
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
  // const [selectedBulkEvent, setSelectedBulkEvent] = useState<EventFile | null>(
  //   null,
  // );
  // const [updateModalOpen, setUpdateModalOpen] = useState(false);
  // const [modalOpen, setModalOpen] = useState(false);
  const filteredBulkEvents = bulkEvents.filter(
    (eventFile) => eventFile.instituteName === authUser?.partnerName,
  );
  ///////////////////////////////////////////////////// USE EFFECTS ////////////////////////////////////////////////////////
  useEffect(() => {
    // dispatch<any>(fetchBulkEvents());
    setIsLoading(true);
    dispatch<any>(fetchAllEvents()).finally(() => setIsLoading(false));
    dispatch<any>(fetchEmployersByEmail(authUser?.email));
    if (filteredEvents[selectedFilter]?.length > 0) return;
    
   
  }, [authUser?.email]);

  useEffect(() => {
    const filtered = getFilteredEvents();
    setFilteredEvents(filtered);

    if (filtered?.upcomingEvents?.length === 0) {
      setSelectedFilter('all');
    }
  }, [
    JSON.stringify({
      fetchedAllEvents
    }),
  ]);

  const getFilteredEvents = (): FilteredEvents => {
    console.log('fetched all events',fetchedAllEvents)
    const all = [...fetchedAllEvents];

    const currentDate = new Date();
    const upcomingFetchedEvents = fetchedAllEvents.filter((e) => {
      const eventToDate = parseDate(e.eventTo);
      return eventToDate > currentDate && e.status !== 'Cancelled';
    });
    
    const upcomingEvents = [
      ...upcomingFetchedEvents
    ];

    // const joined = fetchedJoinedEvents;
    const joined = fetchedAllEvents;
    const requested = fetchedAllEvents.filter((e) => {
      const eventToDate = parseDate(e.eventTo);
      return eventToDate > currentDate && e.status === EventStatus.Requested;
    });

    const rescheduleFetchedEvents = fetchedAllEvents.filter((e) => {
      const eventToDate = parseDate(e.eventTo);
      return e.status === EventStatus.Reschedule && eventToDate > currentDate;
    });
    
    const reschedule = [
      ...rescheduleFetchedEvents
    ];
    // const invited = fetchedInvitedEvents;
 const invited = fetchedAllEvents;
    const incomingRequestsById = fetchedAllEvents.filter(
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

    const cancelledFetchedEvents = fetchedAllEvents.filter(
      (e) =>
        e.status === EventStatus.Cancelled 
    );
   
    const cancelled = [
      ...cancelledFetchedEvents
    ];

    const approvedRequestedByIdEvents =
      fetchedAllEvents.filter((e) => {
        const eventToDate = parseDate(e.eventTo);
        return e.status == EventStatus.Scheduled && eventToDate > currentDate;
      });
    const scheduled = [
      ...approvedRequestedByIdEvents
    ];
    const allPlusJoined = [...fetchedAllEvents]
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
  // const onOpenViewBulkEventModal = (eventFile: EventFile) => {
  //   setSelectedBulkEvent(eventFile);
  //   setModalOpen(true);
  // };
  // const handleOpenUpdateBulkEventForm = (eventFile: EventFile) => {
  //   setSelectedBulkEvent(eventFile);
  //   setUpdateModalOpen(true);
  // };
  // const handleCloseUpdateModal = () => {
  //   setUpdateModalOpen(false);
  //   setSelectedBulkEvent(null);
  // };
  // const handleCloseModal = () => {
  //   setModalOpen(false);
  //   setSelectedEvent(null);
  // };

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
              {filteredEvents?.all?.length}
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
              {filteredEvents?.scheduled?.length}
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

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Event Start</th>
                <th>Event End</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Description</th>
                <th>Creater Name</th>
                <th>Creater Email</th>
                <th>Creater Role</th>
                <th>Contact Email</th>
                <th>Address Line 1</th>
                <th>Address Line 2</th>
                <th>Approved By Admin</th>
                <th>Rejected By Admin</th>
                <th>Dress Code</th>
                <th>Organized By</th>
                <th>Requested Program</th>
                <th>Zip Code</th>
                <th>Av Equipment Needs</th>
                <th>RSVP</th>
                <th>Additional Comments</th>
                <th>Agenda</th>
                <th>Carousel Images</th>
                <th>Careting Preferences</th>
                <th>Emergency Contact No.</th>
                <th>Note From Institution</th>
                <th>Parking Arrangements</th>
                <th>Preffered Location</th>
                <th>Purpose</th>
                <th>Expected Attendees</th>
                <th>Setup Requirements</th>
                <th>Transportation Details</th>
                <th>Url</th>
                <th>State</th>
                <th>Is Test</th>
                <th>City</th>
                <th>Event Date</th>
                <th>Requested Partner</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td >
                    <Loader />
                  </td>
                </tr>
              ) : filteredEvents[selectedFilter]?.length === 0 &&
                filteredBulkEvents.length === 0 ? (
                <tr>
                  <td  className="text-center text-3xl font-semibold">
                    No Events
                  </td>
                </tr>
              ) : (
                filteredEvents[selectedFilter]?.map((event, index) => (
                  <tr key={index}>
                    <td>{event?.id}</td>
                    <td>{event?.title}</td>
                    <td>
                      {extractDateTimeFromTimestamp(event?.eventFrom)?.date}
                    </td>
                    <td>
                      {extractDateTimeFromTimestamp(event?.eventTo)?.date}
                    </td>
                    <td>{event?.type}</td>
                    <td
                      className={`${
                        event?.status === EventStatus.Scheduled
                          ? 'text-meta-3'
                          : event?.status === EventStatus.Requested
                          ? 'text-meta-8'
                          : event?.status === EventStatus.Cancelled
                          ? 'text-meta-1'
                          : 'text-[#637381]'
                      }`}
                    >
                      {selectedFilter === 'joined' ? 'Joined' : event?.status}
                    </td>
                    <td className="actions">
                      <div className="flex justify-center gap-1">
                        <Tooltip title="View" placement="top">
                          <IconButton onClick={() => onOpenViewModal(event)}>
                            <Eye className="text-gray-icon" />
                          </IconButton>
                        </Tooltip>
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
                    </td>
                    <td>{truncate(event?.description,20)}</td>
                    <td>{event?.createrName}</td>
                    <td>{event?.createrEmail}</td>
                    <td>{event?.createrRole}</td>
                    <td>{event?.contactEmail}</td>
                    <td>{truncate(event?.addressLine1,20)}</td>
                    <td>{truncate(event?.addressLine2,20)}</td>
                    <td>{event?.approvedByAdmin ? 'Yes' : 'No'}</td>
                    <td>{event?.rejectedByAdmin ? 'Yes' : 'No'}</td>
                    <td>{truncate(event?.dressCode,20)}</td>
                    <td>{event?.partnerId}</td>
                    <td>{event?.requestedProgram}</td>
                    <td>{event?.zipCode}</td>
                    <td>{truncate(event?.AVEquipmentNeeds,20)}</td>
                    <td>{truncate(event?.RSVP,20)}</td>
                    <td>{truncate(event?.additionalComments,20)}</td>
                    <td>{truncate(event?.agenda,20)}</td>
                    <td>{truncate(event?.carouselImages.join(', '),20)}</td>
                    <td>{truncate(event?.cateringPreferences,20)}</td>
                    <td>{event?.emergencyContactPhone}</td>
                    <td>{truncate(event?.noteFromInstitution,20)}</td>
                    <td>{truncate(event?.parkingArrangements,20)}</td>
                    <td>{truncate(event?.preferredLocationInSchool,20)}</td>
                    <td>{truncate(event?.purpose,20)}</td>
                    <td>{event?.expectedAttendees}</td>
                    <td>{truncate(event?.setupRequirements,20)}</td>
                    <td>{truncate(event?.transportationDetails,20)}</td>
                    <td>{truncate(event?.url,20)}</td>
                    <td>{event?.state}</td>
                    <td>{event?.isTest}</td>
                    <td>{event?.city}</td>
                    <td>{event?.eventDate}</td>
                    <td>
                      {typeof event?.requestedPartner === 'object' && event?.requestedPartner?.name
                        ? String(event.requestedPartner.name)
                        : String(event?.requestedPartner)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
        </div>
        <Calendar events={filteredEvents[selectedFilter]} />
      </div>
    </DefaultLayout>
  );
};

export default Events;
