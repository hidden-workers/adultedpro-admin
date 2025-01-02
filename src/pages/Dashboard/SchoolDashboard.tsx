import 'flatpickr/dist/flatpickr.min.css';
import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import DashboardChat from '../../components/Chat/DashboardChat';
import Calendar from './Calendar';
import DashboardUpcomingEvents from '../../components/Events/DashboardUpcomingEvents';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  fetchEventsByOrganizerId,
  fetchEventsByRequestedPartnerId,
  fetchEventsByRequestedPartnerName,
} from '../../store/reducers/eventSlice';
import {
  fetchTeachersOfInstitution,
  fetchUsers,
} from '../../store/reducers/userSlice';
import { Event, LocalStorageAuthUser } from '../../interfaces';
import SchoolStudents from '../../components/Tables/SchoolStudents';
import {
  fetchPartnerById,
  fetchPartners,
} from '../../store/reducers/partnerSlice';
import { EventStatus } from '../../utils/enums';
import { DefaultLogo } from '../../assets';

import {
  fetchDashboardStudentsOfInstitution,
  fetchDashboardCount,
} from '../../store/reducers/userSlice';
import { fetchTodoes } from '../../store/reducers/todoSlice.ts';
import ReminderTicker from './TodoReminder.tsx';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import useMobile from '../../hooks/useMobile';
import { parseDate } from '../../utils/datetime';

interface FilteredEvents {
  all: Event[];
  scheduled: Event[];
  upcomingEvents: Event[];
}
const SchoolDashboard: React.FC = () => {
  ////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { dashboardStudents: fetchedStudents, teachers: fetchedTeachers } =
    useSelector((state: RootState) => state.user);
  const { studentsCount, jobCounts, swipeCounts, chatCounts } = useSelector(
    (state: RootState) => state.user,
  );
  const { partner } = useSelector((state: RootState) => state.partner);
  const {
    events: fetchedEvents,
    requestedEventsByEmployers: fetchedRequestedEventsByEmployers,
    // requestedEventsByEmployersWithPartnerName: requestedEvents,
  } = useSelector((state: RootState) => state.event);
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const [isMobile] = useMobile();
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  const mongoUserId = localStorage.getItem('mongoUserId');
  ////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////
  const [filteredEvents, setFilteredEvents] = useState<FilteredEvents>({
    all: [],
    scheduled: [],
    upcomingEvents: [],
  });

  const [loading, setLoading] = useState({
    teachers: false,
    students: false,
    events: false,
  });
  const { todoes: fetchedTodoes } = useSelector(
    (state: RootState) => state.todo,
  );
  const [todoes, setTodoes] = useState(fetchedTodoes);
  const [modalOpen, setModalOpen] = useState(false);
  ////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////
  useEffect(() => {
    if (authUser?.approvedByAdmin === false) {
      setModalOpen(true);
    }
  }, [authUser]);

  useEffect(() => {
    dispatch<any>(fetchPartnerById(mongoInstituteId));
    dispatch<any>(fetchPartners({ approved: true, page: 1, limit: 100000 }));
    dispatch<any>(fetchUsers([]));
    dispatch<any>(
      fetchDashboardCount({
        instituteId: mongoInstituteId,
        userId: mongoUserId,
      }),
    );
    dispatch<any>(
      fetchEventsByRequestedPartnerId({
        instituteId: mongoInstituteId,
        page: 1,
        limit: 6,
      }),
    );
  }, []);

  useEffect(() => {
    if (fetchedTeachers.length > 0) {
      return;
    }
    setLoading((pre) => ({ ...pre, teachers: true }));
    dispatch<any>(fetchTeachersOfInstitution({ instituteId: mongoInstituteId }))
      .then(() => setLoading((pre) => ({ ...pre, teachers: false })))
      .finally(() => setLoading((pre) => ({ ...pre, teachers: false })));
  }, []);

  useEffect(() => {
    if (fetchedEvents.length > 0) {
      return;
    }
    setLoading((pre) => ({ ...pre, events: true }));
    dispatch<any>(
      fetchEventsByOrganizerId({
        organizerType: 'institution',
        organizerId: mongoInstituteId,
      }),
    ).finally(() => setLoading((pre) => ({ ...pre, events: false })));
  }, []);

  useEffect(() => {
    if (fetchedStudents?.length > 0) {
      return;
    }

    setLoading((pre) => ({ ...pre, students: true }));
    dispatch<any>(
      fetchDashboardStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 6,
        page: 1,
      }),
    ).finally(() => setLoading((pre) => ({ ...pre, students: false })));
  }, []);

  useEffect(() => {
    setFilteredEvents(getFilteredEvents());
  }, [fetchedEvents]);
  useEffect(() => {
    if (fetchedTodoes?.length > 0) return;
    dispatch<any>(fetchTodoes());
  }, [partner]);
  useEffect(() => {
    setTodoes(fetchedTodoes);
  }, [fetchedTodoes]);
  ////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////
  const getFilteredEvents = (): FilteredEvents => {
    const currentDate = new Date();
    const upcomingSchoolEvents = fetchedEvents.filter((e) => {
      const eventToDate = parseDate(e.eventTo);
      return eventToDate >= currentDate;
    });

    const approvedRequestedEvents = fetchedRequestedEventsByEmployers.filter(
      (e) => e.status == EventStatus.Scheduled,
    );
    const unapprovedRequestedEvents = fetchedRequestedEventsByEmployers.filter(
      (e) => e.status == EventStatus.Requested,
    );
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const upcomingApprovedEvents = approvedRequestedEvents.filter(
      (event) => event.eventFrom.seconds > nowInSeconds,
    );
    const all = [
      ...fetchedEvents,
      ...unapprovedRequestedEvents,
      ...approvedRequestedEvents,
    ];
    const upcomingEvents = [...upcomingSchoolEvents, ...upcomingApprovedEvents];

    const scheduled = [
      ...approvedRequestedEvents,
      ...upcomingApprovedEvents,
      ...fetchedEvents.filter((e) => e.status === EventStatus.Scheduled),
    ];
    const filtered: FilteredEvents = { all, scheduled, upcomingEvents };
    return filtered;
  };
  const refetchEvents = () => {
    setLoading((prev) => ({ ...prev, events: true }));
    dispatch<any>(
      fetchEventsByRequestedPartnerId({
        instituteId: mongoInstituteId,
        page: 1,
        limit: 6,
      }),
    );

    dispatch<any>(fetchEventsByRequestedPartnerName(mongoInstituteId));
    dispatch<any>(
      fetchEventsByOrganizerId({
        organizerType: 'institution',
        organizerId: mongoInstituteId,
      }),
    ).finally(() => setLoading((prev) => ({ ...prev, events: false })));
  };
  ////////////////////////////////////////////////// RENDER /////////////////////////////////////////////////////
  return (
    <DefaultLayout>
      <ReminderTicker todos={todoes} />
      {authUser?.approvedByAdmin === false && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
        >
          <Box className="relative max-w-md w-full max-h-[90vh] bg-white rounded-lg overflow-y-auto p-8 dark:bg-boxdark">
            <h2 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
              Approval Required
            </h2>
            <p className="text-md">Contact your Evolo Admin to get access.</p>
          </Box>
        </Modal>
      )}
      <div className="mt-4 space-y-2 ">
        {/* Media, Company title and other details */}
        <div className="flex flex-col gap-4 rounded-md bg-white py-4 shadow-lg ">
          {/* logo, title and details */}
          <div className="flex w-full gap-4 px-4 py-2 ">
            {/* logo */}
            <img
              src={partner?.photoUrl || authUser?.logo || DefaultLogo}
              alt="Cards"
              className="h-12 w-12 rounded-full border object-cover "
            />
            {/* title and detail */}
            <div className="w-full space-y-2">
              <div className="">
                <div className="flex items-center gap-2 ">
                  <h2
                    className={`text-start font-bold text-black ${isMobile ? 'text-lg' : 'text-2xl'}`}
                  >
                    {authUser?.partnerName || partner?.name}
                  </h2>
                </div>
                {/* text-md text-start font-medium text-black */}
                <h4
                  className={`text-start font-medium text-black ${isMobile ? 'text-sm' : 'text-md'}`}
                >
                  {partner?.tagLine}
                </h4>
              </div>
              <p className={`text-start ${isMobile ? 'text-sm' : 'text-md'}`}>
                {partner?.addressLine1}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 truncate md:grid-cols-2 md:gap-6 xl:grid-cols-4  2xl:gap-7.5">
        {/* <DataStats /> */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {/* Total Jobs */}
            <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {studentsCount ? studentsCount : 0}
              </h4>
              <p className="text-sm font-medium">Total Active Students</p>
            </div>
            {/* Total Applicants */}
            <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark sm:border-b-0 sm:pb-0 xl:border-r">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {jobCounts ? jobCounts : 0}
              </h4>
              <p className="text-sm font-medium">Total Jobs Available</p>
            </div>
            {/* Total Swipes */}
            <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {swipeCounts ? swipeCounts : 0}
              </h4>
              <p className="text-sm font-medium">Total Swipes</p>
            </div>
            {/* Total Conversations */}
            <div className="flex flex-col items-center justify-center gap-2">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {chatCounts ? chatCounts : 0}
              </h4>
              <p className="text-sm font-medium">Total Conversations</p>
            </div>
          </div>
        </div>
      </div>

      {/* {role == UserRolesEnum.SchoolAdmin && (
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-3 2xl:mt-7.5 2xl:gap-4">
          <div className="col-span-12 h-fit overflow-y-auto xl:col-span-4 xl:h-[17rem]">
            <PendingStudents />
            
          </div>
          <div className="col-span-12 h-fit overflow-y-auto xl:col-span-4 xl:h-[17rem]">
            <PendingItems
              isLoading={loading.teachers}
              title="Pending Teachers"
              data={teachers.filter(
                (teacher) =>
                  !teacher?.approvedByAdmin && !teacher?.rejectedByAdmin,
              )}
            />
          </div>
          <div className="col-span-12 h-fit overflow-y-auto xl:col-span-4 xl:h-[17rem]">
            <PendingItems
              isLoading={loading.events}
              title="Pending Events"
              data={filteredEvents.all?.filter(
                (student) =>
                  !student?.approvedByAdmin && !student?.rejectedByAdmin,
              )}
            />
          </div>
        </div>
      )} */}

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-3 2xl:mt-7.5 2xl:gap-4">
        <div className="col-span-12 h-fit overflow-y-auto xl:col-span-4 xl:h-[17rem]">
          <SchoolStudents isLoading={loading.students} />
        </div>
        <div className="col-span-12 h-fit overflow-y-auto xl:col-span-4 xl:h-[17rem]">
          <DashboardUpcomingEvents
            isLoading={loading.events}
            events={filteredEvents.upcomingEvents}
            unApproved={filteredEvents.all?.filter(
              (event) => !event?.approvedByAdmin && !event?.rejectedByAdmin,
            )}
            onEventAction={refetchEvents}
          />
        </div>
        <div className="col-span-12 h-fit xl:col-span-4 xl:h-[17rem]  ">
          <DashboardChat />
        </div>
      </div>

      <div className="mt-4">
        <Calendar events={filteredEvents.all} />
      </div>
    </DefaultLayout>
  );
};

export default SchoolDashboard;
