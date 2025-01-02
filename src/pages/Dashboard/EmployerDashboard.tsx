import 'flatpickr/dist/flatpickr.min.css';
import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import EmployerDashboardJobPostings from '../../components/Tables/EmployerDashboardJobPostings';
import DashboardChat from '../../components/Chat/DashboardChat';
import Calendar from './Calendar';
import DashboardUpcomingEvents from '../../components/Events/DashboardUpcomingEvents';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  fetchDashboardJobsByEmployerId,
  fetchDashboardJobs,
} from '../../store/reducers/jobSlice';
import { EventStatus } from '../../utils/enums';
import { fetchUserApplicationsByEmployerEmail } from '../../store/reducers/userApplicationsSlice';
import {
  fetchEventsByOrganizerId,
  fetchInvitedEventsForEmployer,
  fetchSchoolEvents,
} from '../../store/reducers/eventSlice';
import { fetchEmployerDashboardCount } from '../../store/reducers/employersSlice';
import { Event } from '../../interfaces';

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
}

const EmployerDashboard: React.FC = () => {
  ////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { Dashjobs } = useSelector((state: RootState) => state.job);
  const { branches: fetchedBranches } = useSelector(
    (state: RootState) => state.employer,
  );

  const authUser = localStorage.getItem('auth')
    ? { ...JSON.parse(localStorage.getItem('auth')), ...user }
    : user;
  const {
    events: fetchedEvents,
    invitedEvents: fetchedInvitedEvents,
    schoolEvents: fetchedSchoolEvents,
    joinedEvents: fetchedJoinedEvents,
    requestedEventsByEmployers: fetchedRequestedEventsByEmployers,
  } = useSelector((state: RootState) => state.event);
  const { jobCounts, swipeCounts, applicationCounts, chatCounts } = useSelector(
    (state: RootState) => state.employer,
  );
  ////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////
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
  });
  const [loading, setLoading] = useState({ Dashjobs: false, events: false });
  const mongoUserId = localStorage.getItem('mongoUserId');
  const role = String(localStorage.getItem('Role'));
  ////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchEmployerDashboardCount(mongoUserId));
  }, []);
  useEffect(() => {
    dispatch<any>(
      fetchUserApplicationsByEmployerEmail(authUser?.email ?? user?.email),
    );

    if (Dashjobs?.length === 0) {
      setLoading((pre) => ({ ...pre, Dashjobs: true }));
    }
    if (role === 'SuperAdmin') {
      dispatch<any>(
        fetchDashboardJobs({
          limit: 6,
          page: 1,
          includeJobApplications: true,
        }),
      ).then(() => setLoading((pre) => ({ ...pre, Dashjobs: false })));
    } else {
      dispatch<any>(
        fetchDashboardJobsByEmployerId({ id: mongoUserId, limit: 6 }),
      ).then(() => setLoading((pre) => ({ ...pre, Dashjobs: false })));
    }
    dispatch<any>(
      fetchEventsByOrganizerId({
        organizerType: 'branch',
        organizerId: mongoUserId,
      }),
    ).then(() => setLoading((pre) => ({ ...pre, events: false })));

    dispatch<any>(fetchSchoolEvents());
    if (fetchedEvents.length == 0)
      setLoading((pre) => ({ ...pre, events: true }));
  }, [user]);

  useEffect(() => {
    if (fetchedBranches?.length > 0)
      dispatch<any>(
        fetchInvitedEventsForEmployer({
          employerId: mongoUserId,
          page: 1,
          limit: 100000,
        }),
      );
  }, [fetchedBranches]);
  useEffect(() => {
    const filtered = getFilteredEvents();
    setFilteredEvents(filtered);
  }, [fetchedEvents, fetchedInvitedEvents, fetchedSchoolEvents]);

  const getFilteredEvents = (): FilteredEvents => {
    const all = fetchedEvents;
    const joined = fetchedJoinedEvents;

    const requested = fetchedEvents?.filter(
      (e) => e.status === EventStatus.Requested,
    );
    const reschedule = fetchedEvents.filter(
      (e) => e.status === EventStatus.Reschedule,
    );
    const invited = fetchedInvitedEvents;
    const requestedByEmployers = fetchedRequestedEventsByEmployers.filter(
      (e) =>
        e.status == EventStatus.Requested || e.status == EventStatus.Reschedule,
    );
    const cancelled = fetchedEvents.filter(
      (e) =>
        e.status === EventStatus.Cancelled &&
        !fetchedRequestedEventsByEmployers.map((e) => e?.id)?.includes(e?.id),
    );
    const approvedRequestedEvents = fetchedRequestedEventsByEmployers.filter(
      (e) => e.status == EventStatus.Scheduled,
    );
    const scheduled = [
      ...approvedRequestedEvents,
      ...fetchedEvents.filter((e) => e.status === EventStatus.Scheduled),
    ];
    const allPlusJoined = [...all, ...joined];
    // const school = fetchedSchoolEvents;
    // const upcoming = fetchedEvents.filter((e) => e.status === 'approved' && (e.eventDate?.seconds ? e.eventDate.toDate() : new Date(e.eventDate)) > new Date());

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
    };
    return filtered;
  };

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 gap-4 truncate md:grid-cols-2 md:gap-6 xl:grid-cols-4  2xl:gap-7.5">
        {/* <DataStats /> */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {/* Total Jobs */}
            <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {jobCounts}
              </h4>
              <p className="text-sm font-medium">Total Jobs</p>
            </div>
            {/* Total Swipes */}
            <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {swipeCounts}
                {/* saved jobs, skipped jobs, applied jobs */}
              </h4>
              <p className="text-sm font-medium">Total Swipes</p>
            </div>
            {/* Total Applicants */}
            <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark sm:border-b-0 sm:pb-0 xl:border-r">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {applicationCounts}
              </h4>
              <p className="text-sm font-medium">Total Applications</p>
            </div>
            {/* Total Conversations */}
            <div className="flex flex-col items-center justify-center gap-2">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {chatCounts}
              </h4>
              <p className="text-sm font-medium">Total Conversations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-3 2xl:mt-7.5 2xl:gap-4">
        <div className="col-span-12 h-fit xl:col-span-4 xl:h-[33rem] ">
          <EmployerDashboardJobPostings isLoading={loading.Dashjobs} />
        </div>
        <div className="col-span-12 h-fit xl:col-span-4 xl:h-[33rem] overflow-y-auto ">
          <DashboardUpcomingEvents
            isLoading={loading.events}
            events={filteredEvents.allPlusJoined}
          />
        </div>
        <div className="col-span-12 h-fit xl:col-span-4 xl:h-[33rem] ">
          <DashboardChat />
        </div>
      </div>

      <div className="mt-4">
        <Calendar events={filteredEvents.allPlusJoined} />
      </div>
    </DefaultLayout>
  );
};

export default EmployerDashboard;
