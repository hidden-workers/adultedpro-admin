import { Link } from 'react-router-dom';
import { Event, User } from '../../interfaces';
import CLoader from '../../common/CLoader';
import { EventStatus, UserRolesEnum } from '../../utils/enums';
import { useStateContext } from '../../context/useStateContext';
import { useState, useEffect } from 'react';
import ViewEventModal from '../../components/Modals/ViewEventModal.tsx';
import UploadEventModal from '../../components/Modals/UploadEventModal';
import { Upload } from 'lucide-react';
import { Tooltip, IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setEvent } from '../../store/reducers/eventSlice';
import { Check, X } from 'lucide-react';
import { parseDate } from '../../utils/datetime';
// import ViewBulkEventModal from '../../components/Modals/ViewBulkEventModal.tsx';
// import {LocalStorageAuthUser, EventFile} from '../../interfaces';
const DashboardUpcomingEvents = ({
  events,
  isLoading,
  unApproved,
  onEventAction,
}: {
  events: Event[];
  isLoading: boolean;
  unApproved?: Event[];
  onEventAction?: () => void;
}) => {
  const dispatch = useDispatch();
  const loggedIn_user_role = localStorage.getItem('Role');
  const { setShowEventViewModal, page } = useStateContext();
  const [showProposeDateForm, setShowProposeDateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const role = String(localStorage.getItem('Role'));

  // const bulkEvents = useSelector((state: RootState) => state.event.bulkEvents);
  // const [selectedBulkEvent, setSelectedBulkEvent] = useState<EventFile | null>(
  //   null,
  // );
  // const [modalOpen, setModalOpen] = useState(false);
  // const isBulkEventsLoading = useSelector(
  //   (state: RootState) => state.event.isBulkEventsLoading,
  // );
  // const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
  //   ? JSON.parse(localStorage.getItem('auth'))
  //   : null;
  // useEffect(() => {
  //   dispatch<any>(fetchBulkEvents());
  // }, [dispatch]);
  useEffect(() => {
    const now = new Date();

    unApproved?.forEach((event) => {
      if (event.eventDate && event.eventDate.seconds !== undefined) {
        const eventDate = new Date(event.eventDate.seconds * 1000);

        if (eventDate < now && event.status !== EventStatus.Cancelled) {
          const cancelledEvent = {
            ...event,
            status: EventStatus.Cancelled,
          };
          dispatch<any>(setEvent(cancelledEvent as Event)).then(() => {
            if (typeof onEventAction === 'function') {
              onEventAction();
            }
          });
        }
      } else {
        console.warn(`Unexpected timestamp format: ${event.eventDate}`);
      }
    });
  }, [unApproved, dispatch, onEventAction]);

  const onOpenViewModal = (event: Event) => {
    setShowProposeDateForm(false);
    setSelectedEvent(event);
    setShowEventViewModal(true);
  };
  const onApprove = (item: Event | User) => {
    if ((item as Event)?.title) {
      // For event
      const approvedEvent = {
        ...item,
        approvedByAdmin: true,
        status: EventStatus.Scheduled,
      };
      dispatch<any>(setEvent(approvedEvent as Event)).then(() => {
        if (typeof onEventAction == 'function') {
          onEventAction();
        }
      });
    }
  };
  const onDecline = (item: Event | User) => {
    if ((item as Event)?.title) {
      const newObj = {
        ...item,
        rejectedByAdmin: true,
        status: EventStatus.Cancelled,
      };
      dispatch<any>(setEvent(newObj as Event)).then(() => {
        if (typeof onEventAction == 'function') {
          onEventAction();
        }
      });
    }
  };
  const upcomingUnApproved = unApproved?.filter((event) => {
    const eventDate = event?.eventDate?.toDate
      ? event?.eventDate?.toDate()
      : new Date(event.eventDate);
    return eventDate >= new Date();
  });

  return (
    <>
      <div className="min-h-[10rem] relative overflow-y-auto h-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-5.5 xl:pb-1">
        <div className="mb-1.5 flex justify-between items-center pb-2">
          <div className="flex items-center space-x-3 ">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Events
            </h4>
            <Tooltip
              placement="top"
              title="In this section, you can view events that require approval and scheduled events occurring now or in the future. Past events will not be displayed here."
            >
              <p className="ml-2 cursor-pointer border border-black text-black font-bold rounded-full w-4 h-4 flex items-center justify-center text-xs">
                i
              </p>
            </Tooltip>
          </div>
          <div className="flex items-center space-x-4">
            {loggedIn_user_role === 'SuperAdmin' && (
              <Tooltip title="Bulk Upload" placement="top">
                <IconButton onClick={() => setShowUploadModal(true)}>
                  <Upload size={18.5} />
                </IconButton>
              </Tooltip>
            )}
            <Link
              to={
                page === 'Employer' ? '/employer/events' : '/institution/events'
              }
              className="flex h-fit justify-center text-sm rounded bg-graydark px-2.5 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
            >
              Create Event
            </Link>
          </div>
        </div>
        <div className="rounded-sm bg-gray-200 dark:bg-meta-4 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-300 dark:bg-gray-700 bg-gray-2 dark:bg-meta-4 ">
                <th className="p-2 text-left text-base font-medium xl:py-5 ">
                  Event
                </th>
                <th className="p-2 text-left text-base font-medium xl:py-5">
                  Creator
                </th>
                <th className="p-2 text-center text-base font-medium  xl:py-5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    <CLoader size="lg" />
                  </td>
                </tr>
              ) : unApproved?.length === 0 && events?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    <span className="text-xl">No Upcoming Events</span>
                  </td>
                </tr>
              ) : (
                <>
                  {role === UserRolesEnum.SchoolAdmin &&
                    upcomingUnApproved?.slice(0, 6)?.map((item, index) => (
                      <tr
                        key={index}
                        className="cursor-pointer border-b border-stroke dark:border-strokedark"
                      >
                        <td
                          className="flex items-center gap-3 py-2.5 xl:py-5 xl:max-w-[70px] 2xsm:max-w-[50px] md:max-w-[100%] pl-2"
                          onClick={() => onOpenViewModal(item)}
                        >
                          <h5 className="text-sm text-black dark:text-white truncate">
                            {item?.title || 'No title'}
                          </h5>
                        </td>
                        <td className="p-2">
                          <h5 className="text-sm text-black dark:text-white truncate">
                            {item?.createrRole || 'No creator'}
                          </h5>
                        </td>
                        <td className="p-2 text-center">
                          <Tooltip title="Approve" placement="top">
                            <IconButton
                              type="button"
                              onClick={() => onApprove(item)}
                            >
                              <Check size={20} style={{ color: 'green' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Decline" placement="top">
                            <IconButton
                              type="button"
                              onClick={() => onDecline(item)}
                            >
                              <X size={20} style={{ color: 'red' }} />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}

                  {events?.length > 0 &&
                    events
                      .sort(
                        (a, b) =>
                          parseDate(b?.dateCreated) - parseDate(a?.dateCreated),
                      )
                      .slice(0, 6)
                      .map((event, index) => (
                        <tr
                          key={index}
                          className="cursor-pointer border-b border-stroke dark:border-strokedark"
                          onClick={() => onOpenViewModal(event)}
                        >
                          <td className="flex items-center gap-3 py-2.5 xl:py-5 xl:max-w-[70px] 2xsm:max-w-[50px] md:max-w-[100%]">
                            <h5 className="text-sm text-black dark:text-white truncate pl-2">
                              {event?.title || 'test title'}
                            </h5>
                          </td>
                          <td className="p-2">
                            <h5 className="text-sm text-black dark:text-white truncate max-w-[70px] ">
                              {event?.createrRole || 'test creator'}
                            </h5>
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`h-fit ${
                                event.status === EventStatus.Scheduled
                                  ? 'border-green-500 text-green-500 text-sm'
                                  : event.status === EventStatus.Requested
                                    ? 'border-orange-500 text-meta-8 text-sm'
                                    : 'text-meta-1 border-red text-sm'
                              } rounded-full border px-1 py-0.5 capitalize`}
                            >
                              {event.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                </>
              )}
            </tbody>
          </table>
          {selectedEvent && (
            <ViewEventModal
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              showProposeDateForm={showProposeDateForm}
              setShowProposeDateForm={setShowProposeDateForm}
            />
          )}
        </div>

        {/* <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 ">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-base font-medium xsm:text-base">Event</h5>
          </div>

          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-base font-medium xsm:text-base">Creator</h5>
          </div>

          <div className="p-2.5 text-center sm:block xl:p-5">
            <h5 className="truncate text-base font-medium xsm:text-base ">
              Status
            </h5>
          </div>
        </div>
        <div className="flex h-fit w-full flex-col ">
          {isLoading ? (
            <div className="flex justify-center items-center w-full absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <CLoader size="lg" />
            </div>
          ) : (
            unApproved?.length === 0 &&
            events?.length === 0 && (
              <div className="flex items-center justify-center py-16 absolute  left-1/2 transform  -translate-x-1/2">
                <span className="text-center text-xl">No Upcoming Events </span>
              </div>
            )
          )}
          {role === UserRolesEnum.SchoolAdmin &&
            upcomingUnApproved?.slice(0, 6)?.map((item, index) => {
              return (
                <div
                  className={`grid grid-cols-3 sm:grid-cols-3 cursor-pointer border-b border-stroke dark:border-strokedark`}
                  key={index}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <h5
                      className="text-sm text-black dark:text-white truncate"
                      onClick={() => onOpenViewModal(item)}
                    >
                      {item?.title || 'No title'}
                    </h5>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <h5 className="text-sm text-black dark:text-white truncate">
                      {item?.createrRole || 'No creator'}
                    </h5>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5 gap-1">
                    <Tooltip title="Approve" placement="top">
                      <IconButton type="button" onClick={() => onApprove(item)}>
                        <Check size={20} style={{ color: 'green' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Decline" placement="top">
                      <IconButton type="button" onClick={() => onDecline(item)}>
                        <X size={20} style={{ color: 'red' }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              );
            })}

          {events?.length > 0 && (
            <>
              {events.slice(0, 6).map((event, index) => (
                <div
                  className={`grid grid-cols-3 sm:grid-cols-3 cursor-pointer ${
                    index === events.length - 1
                      ? ''
                      : 'border-b border-stroke dark:border-strokedark'
                  }`}
                  key={index}
                  onClick={() => onOpenViewModal(event)}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <h5 className="text-sm text-black dark:text-white truncate ">
                      {event?.title || 'test title'}
                    </h5>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <h5 className="text-sm text-black dark:text-white truncate">
                      {event?.createrRole || 'test creator'}
                    </h5>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <span
                      className={`h-fit ${
                        event.status === EventStatus.Scheduled
                          ? 'border-green-500 text-green-500 text-sm'
                          : event.status === EventStatus.Requested
                            ? 'border-orange-500 text-meta-8 text-sm'
                            : 'text-meta-1 border-red text-sm'
                      } rounded-full border px-1 py-0.5 capitalize`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
          // {selectedEvent && (
          //   <ViewEventModal
          //     selectedEvent={selectedEvent}
          //     setSelectedEvent={setSelectedEvent}
          //     showProposeDateForm={showProposeDateForm}
          //     setShowProposeDateForm={setShowProposeDateForm}
          //   />
          // )}
        </div> */}
      </div>
      {showUploadModal && (
        <UploadEventModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </>
  );
};

export default DashboardUpcomingEvents;
