import { useState, useEffect } from 'react';
import { Event, EventFile, LocalStorageAuthUser } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import ViewEventModal from '../../components/Modals/ViewEventModal';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { EventStatus } from '../../utils/enums';
import { fetchBulkEvents } from '../../store/reducers/eventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { parse, format, isWithinInterval } from 'date-fns';
import ViewBulkEventModal from '../../components/Modals/ViewBulkEventModal';
import EventModal from '../../components/Modals/CalendarEventModal';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { parseISO, getYear, getMonth, getDate } from 'date-fns';
import useMobile from '../../hooks/useMobile';
import CalendarShowMoreModal from '../../components/Modals/CalendarShowMoreModal';
type CalendarProps = {
  events: Event[];
};

const Calendar = ({ events: fetchedEvents }: CalendarProps) => {
  const [isMobile] = useMobile();
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [, setEventFiles] = useState<EventFile[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedBulkEvent, setSelectedBulkEvent] = useState<EventFile | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [showProposeDateForm, setShowProposeDateForm] = useState(false);
  const [filter, setFilter] = useState<'events' | 'eventFiles'>('events');
  const fetchedEventFiles = useSelector(
    (state: RootState) => state.event.bulkEvents,
  );
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(
    `${currentYear}-${currentMonth}-01`,
  ).getDay();
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const { setShowEventViewModal } = useStateContext();
  const dispatch = useDispatch();
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState([]);
  const role = String(localStorage.getItem('Role'));

  useEffect(() => {
    setEvents(fetchedEvents);
  }, [fetchedEvents]);

  useEffect(() => {
    dispatch<any>(fetchBulkEvents());
    setEventFiles(fetchedEventFiles);
  }, [dispatch]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 1 ? 12 : prevMonth - 1));
    setCurrentYear((prevYear) =>
      currentMonth === 1 ? prevYear - 1 : prevYear,
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 12 ? 1 : prevMonth + 1));
    setCurrentYear((prevYear) =>
      currentMonth === 12 ? prevYear + 1 : prevYear,
    );
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };
  const normalizeDay = (day) => {
    const normalizedDays = {
      mon: 'Monday',
      tues: 'Tuesday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thurs: 'Thursday',
      thur: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    };
    return normalizedDays[day.toLowerCase()] || day;
  };

  const isDayInWeek = (date, days) => {
    const dayOfWeek = format(date, 'eeee');
    return days.some((day) => normalizeDay(day) === dayOfWeek);
  };

  const handleOpenEventModal = (events) => {
    setModalEvents(events);
    setEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setEventModalOpen(false);
  };
  const handleCloseShowMoreModal = () => {
    setShowMoreModal(false);
  };
  const handleShowMoreEvents = (events) => {
    setSelectedDayEvents(events);
    setShowMoreModal(true);
  };

  const generateEventCalendar = () => {
    const calendarContent = [];
    let dayCounter = 1;

    for (let row = 0; row < 6; row++) {
      const weekRow = [];
      for (let col = 0; col < 7; col++) {
        const day = dayCounter - firstDayOfMonth;
        const isWithinMonth = day > 0 && day <= daysInMonth;

        let title = '';

        const filteredEvents =
          events?.length &&
          events.filter((e) => {
            const eventDate = e?.eventDate
              ? parseISO(e.eventDate) // Use parseISO to handle the MongoDB date format
              : new Date(); // Use current date if event_date is missing

            return (
              getYear(eventDate) === currentYear &&
              getMonth(eventDate) + 1 === currentMonth && // getMonth returns 0-based month, so add 1
              getDate(eventDate) === day
            );
          });
        const firstStatus = filteredEvents?.[0]?.status;
        const dateCell = (
          <td
            key={col}
            className={`group ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${
              firstStatus === EventStatus.Cancelled
                ? 'bg-red-500 text-white'
                : firstStatus === EventStatus.Requested
                  ? 'bg-meta-8/10 text-meta-8'
                  : firstStatus === EventStatus.Scheduled
                    ? 'bg-meta-3/10 text-meta-3'
                    : 'hover:bg-gray'
            }`}
          >
            {isWithinMonth && (
              <>
                <span className="font-medium text-black dark:text-white">
                  {day}
                </span>
                <div className="event-group">
                  {filteredEvents?.length ? (
                    <>
                      {filteredEvents.slice(0, 1).map((event, index) => {
                        title = event?.title;
                        const eventFrom = event.eventFrom
                          ? parseISO(event.eventFrom)
                          : null; // Parse ISO date string for eventFrom
                        const eventTo = event.eventTo
                          ? parseISO(event.eventTo)
                          : null; // Parse
                        return (
                          <div key={index} className="event w-full truncate">
                            {title && (
                              <div
                                className={`z-50 group-hover:block hidden w-[14rem] bg-white w-ma x absolute bottom-[85%] ${
                                  col === 6
                                    ? 'right-0'
                                    : col === 0
                                      ? 'left-0'
                                      : 'right-1/2 transform translate-x-1/2'
                                }`}
                              >
                                <div
                                  className={`relative w-full h-full px-4 py-3 flex flex-col justify-start border shadow-xl rounded-lg ${
                                    event.status === EventStatus.Requested
                                      ? 'bg-meta-8/10 text-meta-8'
                                      : event.status === EventStatus.Scheduled
                                        ? 'bg-meta-3/10 text-meta-3'
                                        : event.status === EventStatus.Cancelled
                                          ? 'bg-red-500 text-white'
                                          : 'bg-meta-5 hover:bg-meta-5/10'
                                  }`}
                                >
                                  <p className="text-black text-sm font-medium w-[12rem] text-wrap">
                                    {title}
                                  </p>
                                  <span>
                                    From:{' '}
                                    <span className="text-black text-sm">
                                      {
                                        extractDateTimeFromTimestamp(eventFrom)
                                          .time
                                      }
                                    </span>
                                  </span>
                                  <span>
                                    To:{' '}
                                    <span className="text-black text-sm">
                                      {
                                        extractDateTimeFromTimestamp(eventTo)
                                          .time
                                      }
                                    </span>
                                  </span>
                                </div>
                              </div>
                            )}
                            <span
                              onClick={() => {
                                setShowEventViewModal(true);
                                setSelectedEvent(event);
                                setShowProposeDateForm(false);
                              }}
                              className={`${
                                event.status === EventStatus.Requested
                                  ? 'text-meta-8'
                                  : event.status === EventStatus.Scheduled
                                    ? 'text-meta-3'
                                    : event.status === EventStatus.Cancelled
                                      ? 'text-red'
                                      : 'text-meta-5'
                              } event-name text-sm font-semibold text-black dark:text-white truncate block w-full overflow-hidden whitespace-nowrap`}
                            >
                              {event.title}
                            </span>
                          </div>
                        );
                      })}

                      {filteredEvents.length > 1 && (
                        <button
                          onClick={() => handleShowMoreEvents(filteredEvents)}
                          className="text-blue-500 text-sm mt-1"
                        >
                          {isMobile ? '...' : 'Show more'}
                        </button>
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </>
            )}
          </td>
        );

        weekRow.push(dateCell);

        if (dayCounter <= daysInMonth + firstDayOfMonth) {
          dayCounter++;
        }
      }

      calendarContent.push(
        <tr key={row} className="grid grid-cols-7">
          {weekRow}
        </tr>,
      );

      if (dayCounter > daysInMonth + firstDayOfMonth) {
        break;
      }
    }

    return calendarContent;
  };

  const generateEventFileCalendar = () => {
    const calendarContent = [];
    let dayCounter = 1;

    const eventList = fetchedEventFiles || [];

    for (let row = 0; row < 6; row++) {
      const weekRow = [];
      for (let col = 0; col < 7; col++) {
        const day = dayCounter - firstDayOfMonth;
        const isWithinMonth = day > 0 && day <= daysInMonth;

        let title = '';

        // Filter events based on the current day
        const filteredEvents = eventList.filter((e) => {
          if (!e.startDate || !e.endDate) return false;

          const eventStartDate = parse(e.startDate, 'MM/dd/yyyy', new Date());
          const eventEndDate = parse(e.endDate, 'MM/dd/yyyy', new Date());
          const currentDate = new Date(currentYear, currentMonth - 1, day);
          const isInstituteMatch =
            role === 'Employer' || role === 'SuperAdmin'
              ? true
              : e.instituteName === authUser.partnerName;

          if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime()))
            return false;

          return (
            isWithinInterval(currentDate, {
              start: eventStartDate,
              end: eventEndDate,
            }) &&
            isDayInWeek(currentDate, e.days) &&
            isInstituteMatch
          );
        });

        const firstStatus = filteredEvents?.[0]?.status;
        const displayedEvents = filteredEvents.slice(0, 1);
        const additionalEvents = filteredEvents.length > 1;
        const dateCell = (
          <td
            key={col}
            className={`group ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${
              firstStatus === EventStatus.Cancelled
                ? 'bg-red-500 text-white'
                : firstStatus === EventStatus.Requested
                  ? 'bg-meta-8/10 text-meta-8'
                  : firstStatus === EventStatus.Scheduled
                    ? 'bg-meta-3/10 text-meta-3'
                    : 'hover:bg-gray'
            }`}
          >
            {isWithinMonth && (
              <>
                <span className="font-medium text-black dark:text-white">
                  {day}
                </span>
                <div className="event-group">
                  {displayedEvents.map((event, index) => {
                    title = event.program;

                    const eventStartTime = parse(
                      `${event.startDate} ${event.startTime}`,
                      'MM/dd/yyyy h:mma',
                      new Date(),
                    );

                    const eventEndTime = parse(
                      `${event.endDate} ${event.endTime}`,
                      'MM/dd/yyyy h:mma',
                      new Date(),
                    );

                    const startTimeFormatted = isNaN(eventStartTime.getTime())
                      ? 'Invalid Time'
                      : format(eventStartTime, 'h:mm a');

                    const endTimeFormatted = isNaN(eventEndTime.getTime())
                      ? 'Invalid Time'
                      : format(eventEndTime, 'h:mm a');

                    return (
                      <div key={index} className="event w-full truncate">
                        {index === 0 && title && (
                          <div
                            className={`z-50 group-hover:block hidden w-[14rem] bg-white w-max absolute bottom-[85%] ${
                              col === 6
                                ? 'right-0'
                                : col === 0
                                  ? 'left-0'
                                  : 'right-1/2 transform translate-x-1/2'
                            }`}
                          >
                            <div
                              className={`relative w-full h-full px-4 py-3 flex flex-col justify-start border shadow-xl rounded-lg ${
                                event.status === EventStatus.Requested
                                  ? 'bg-meta-8/10 text-meta-8'
                                  : event.status === EventStatus.Scheduled
                                    ? 'bg-meta-3/10 text-meta-3'
                                    : event.status === EventStatus.Cancelled
                                      ? 'bg-red-500 text-white'
                                      : 'bg-meta-5 hover:bg-meta-5/10'
                              }`}
                            >
                              <p className="text-black text-sm font-medium w-[12rem] text-wrap">
                                {title}
                              </p>
                              <span className="text-sm">
                                Timing:{' '}
                                <span className="text-black">
                                  {startTimeFormatted}
                                  {'-'}
                                  {endTimeFormatted}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                        <span
                          onClick={() => {
                            setSelectedBulkEvent(event);
                            setModalOpen(true);
                          }}
                          className={`${
                            event.status === EventStatus.Requested
                              ? 'text-meta-8'
                              : event.status === EventStatus.Scheduled
                                ? 'text-meta-3'
                                : event.status === EventStatus.Cancelled
                                  ? 'text-red'
                                  : 'text-meta-5'
                          }  event-name text-sm font-semibold text-black dark:text-white truncate block w-full overflow-hidden whitespace-nowrap`}
                        >
                          {event.program}
                        </span>
                      </div>
                    );
                  })}

                  {additionalEvents && (
                    <strong
                      onClick={() => handleOpenEventModal(filteredEvents)}
                      className="text-gray-500 text-sm cursor-pointer"
                    >
                      ...
                    </strong>
                  )}
                </div>
              </>
            )}
          </td>
        );

        weekRow.push(dateCell);

        if (dayCounter <= daysInMonth + firstDayOfMonth) {
          dayCounter++;
        }
      }

      calendarContent.push(
        <tr key={row} className="grid grid-cols-7">
          {weekRow}
        </tr>,
      );

      if (dayCounter > daysInMonth + firstDayOfMonth) {
        break;
      }
    }

    return calendarContent;
  };

  return (
    <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {selectedEvent && (
        <ViewEventModal
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          showProposeDateForm={showProposeDateForm}
          setShowProposeDateForm={setShowProposeDateForm}
        />
      )}
      <ViewBulkEventModal
        open={modalOpen}
        onClose={handleCloseModal}
        bulkevent={selectedBulkEvent}
      />
      <EventModal
        isOpen={isEventModalOpen}
        Close={handleCloseEventModal}
        events={modalEvents}
      />
      <CalendarShowMoreModal
        isOpen={showMoreModal}
        onClose={handleCloseShowMoreModal}
        events={selectedDayEvents}
      />
      {/* {isViewBulkEventModalOpen && (
        <ViewBulkEventModal 
          open={isViewBulkEventModalOpen} 
          onClose={closeBulkEventModal} 
          bulkevent={selectedEventFile} 
        />
      )} */}

      <div className="flex flex-col md:flex-row justify-between items-center p-4">
        <h4
          className={` font-semibold text-black dark:text-white mb-2 md:mb-0 ${isMobile ? 'text-lg' : 'text-xl'}`}
        >
          Calendar
        </h4>

        <div className="flex justify-center md:justify-end mb-4 gap-1 mt-2 md:mt-0">
          <h2
            className={`font-semibold text-center md:text-left ${isMobile ? 'text-lg' : 'text-xl'}`}
          >
            {new Date(currentYear, currentMonth - 1).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <ArrowLeft
            className="ml-3 cursor-pointer"
            onClick={goToPreviousMonth}
          />
          <ArrowRight className="cursor-pointer" onClick={goToNextMonth} />
          {/* <button
            className="bg-graydark hover:bg-black/90 text-white text-sm rounded-md px-2.5 py-2"
            onClick={goToPreviousMonth}
          >
            Previous
            
          </button>
          <button
            className="bg-graydark hover:bg-black/90 text-white text-sm rounded-md px-2.5 py-2"
            onClick={goToNextMonth}
          >
            Next
          </button> */}
        </div>

        <div className="flex justify-end gap-4 mb-2 ml-3">
          <select
            className="px-2.5 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700"
            onChange={(e) => {
              const selectedValue = e.target.value;
              setFilter(
                selectedValue === 'eventsOption' ? 'events' : 'eventFiles',
              );
            }}
          >
            <option value="eventsOption" className="text-black">
              Events
            </option>
            <option value="classesOption" className="text-black">
              Classes
            </option>
          </select>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="grid grid-cols-7 rounded-t-sm bg-graydark text-white">
            <th className="flex h-15 items-center justify-center rounded-tl-sm p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">Sunday</span>
              <span className="block lg:hidden">Sun</span>
            </th>
            <th className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">Monday</span>
              <span className="block lg:hidden">Mon</span>
            </th>
            <th className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">Tuesday</span>
              <span className="block lg:hidden">Tue</span>
            </th>
            <th className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">Wednesday</span>
              <span className="block lg:hidden">Wed</span>
            </th>
            <th className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">Thursday</span>
              <span className="block lg:hidden">Thu</span>
            </th>
            <th className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">Friday</span>
              <span className="block lg:hidden">Fri</span>
            </th>
            <th className="flex h-15 items-center justify-center rounded-tr-sm p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">Saturday</span>
              <span className="block lg:hidden">Sat</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filter === 'events'
            ? generateEventCalendar()
            : generateEventFileCalendar()}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;
