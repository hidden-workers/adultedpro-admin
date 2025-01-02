//pr to resolve page crash issue
import 'flatpickr/dist/flatpickr.min.css';
import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import UserApplications from '../../components/List/UserApplications/UserApplications.tsx';
import CandidateDetail from '../../components/Cards/CandidateDetail.tsx';
import MobileCandidateDetail from '../../components/Cards/MobileCandidateDetail.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchUserApplicationsByEmployerEmail } from '../../store/reducers/userApplicationsSlice';
import { fetchStudents } from '../../store/reducers/userSlice.ts';
import { UserApplicationStatus } from '../../utils/enums.ts';
import { User, UserApplication } from '../../interfaces/index.ts';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.tsx';
import Loader from '../../common/Loader/index.tsx';
import { useStateContext } from '../../context/useStateContext.tsx';
import { fetchPartners } from '../../store/reducers/partnerSlice.ts';
import { fetchEmployerById } from '../../store/reducers/employersSlice';
import useMobile from '../../hooks/useMobile';
import { fetchPrograms } from '../../store/reducers/programSlice.ts';

const EmployerCandidates: React.FC = () => {
  const dispatch = useDispatch();
  const [isMobile] = useMobile();
  const { userApplications: fetchedUserApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const { allStudents: fetchedAllStudents, isLoading } = useSelector(
    (state: RootState) => state.user,
  );
  const {
    selectedUserApplication,
    setSelectedUserApplication,
    selectedStudent,
    setSelectedStudent,
    selectedCandidatesFilter,
    setSelectedCandidatesFilter,
  } = useStateContext();
  const { user } = useSelector((state: RootState) => state.user);
  const authUser = localStorage.getItem('auth')
    ? { ...JSON.parse(localStorage.getItem('auth')), ...user }
    : user;
  const { employer } = useSelector((state: RootState) => state.employer);
  const employerId =
    fetchedUserApplications && fetchedUserApplications.length > 0
      ? fetchedUserApplications[0].employerId
      : '';
  const [userApplications, setUserApplications] = useState({
    all: fetchedUserApplications,
    applied: [],
    rejected: [],
    hired: [],
  });

  const [allStudents, setAllStudents] = useState({
    all: fetchedAllStudents,
    applied: [],
    rejected: [],
    hired: [],
  });
  const [visitedCandidates, setVisitedCandidates] = useState<{
    students: User[];
    applicants: UserApplication[];
  }>({ students: [], applicants: [] });
  useEffect(() => {
    if (!employer && employerId != '') {
      dispatch<any>(fetchEmployerById(employerId));
    }
  }, [employer, employerId]);
  useEffect(() => {
    dispatch<any>(fetchPrograms(true));
  }, []);
  useEffect(() => {
    if (!fetchedUserApplications?.length) {
      dispatch<any>(
        fetchUserApplicationsByEmployerEmail(authUser?.email ?? user?.email),
      );
    }

    if (!fetchedAllStudents?.length) dispatch<any>(fetchStudents());
    dispatch<any>(fetchPartners({ approved: true, page: 1, limit: 100000 }));
  }, []);

  useEffect(() => {
    if (!fetchedAllStudents || !fetchedUserApplications) return;

    const studentsWithStatus = fetchedAllStudents.map((student) => {
      const userApp = fetchedUserApplications.find(
        (userApp) => userApp?.applicantEmail === student.email,
      );
      const status = userApp ? userApp?.status : UserApplicationStatus.Inactive;
      return { ...student, status };
    });

    setVisitedCandidates((pre) => ({
      ...pre,
      students: fetchedAllStudents.filter((student) =>
        student?.visitedBy?.includes(authUser?.email),
      ),
    }));

    const applied = filterStudentsByStatus(UserApplicationStatus.Applied);
    const rejected = filterStudentsByStatus(UserApplicationStatus.Disqualified);
    const hired = filterStudentsByStatus(UserApplicationStatus.Hired);

    setAllStudents({ all: studentsWithStatus, applied, rejected, hired });
  }, [fetchedAllStudents, fetchedUserApplications]);

  useEffect(() => {
    setVisitedCandidates((pre) => ({
      ...pre,
      applicants: fetchedUserApplications.filter((a) =>
        a?.applicant?.visitedBy?.includes(authUser?.email),
      ),
    }));

    const sorted = [...(fetchedUserApplications || [])]?.sort((a, b) => {
      if (a?.applicant?.name && b?.applicant?.name) {
        return a?.applicant?.name.localeCompare(b?.applicant?.name);
      } else if (!a?.applicant?.name && b?.applicant?.name) {
        return 1;
      } else if (a?.applicant?.name && !b?.applicant?.name) {
        return -1;
      } else {
        return 0;
      }
    });

    const all = sorted;
    const applied = sorted?.filter(
      (item: any) =>
        typeof item?.status === 'string' &&
        item?.status?.toLowerCase() !==
          UserApplicationStatus?.Rejected.toLowerCase() &&
        item?.status?.toLowerCase() !==
          UserApplicationStatus?.Skipped.toLowerCase(),
    );
    const rejected = filterApplicationByStatus(
      UserApplicationStatus?.Disqualified,
    );
    const hired = filterApplicationByStatus(UserApplicationStatus?.Hired);

    setUserApplications({ all, applied, rejected, hired });
  }, [fetchedUserApplications]);

  const filterStudentsByStatus = (status: string) => {
    if (typeof status !== 'string') return [];
    return fetchedAllStudents?.filter((student) =>
      fetchedUserApplications?.some(
        (userApp) =>
          typeof userApp?.status === 'string' &&
          userApp?.status?.toLowerCase() === status?.toLowerCase() &&
          userApp?.applicantEmail === student?.email,
      ),
    );
  };

  const filterApplicationByStatus = (status: string) => {
    if (typeof status !== 'string') return [];
    return fetchedUserApplications?.filter(
      (u) =>
        typeof u?.status === 'string' &&
        u?.status?.toLowerCase() === status?.toLowerCase(),
    );
  };

  const renderMobileView = () => {
    if (selectedUserApplication || selectedStudent) {
      return (
        <div className="h-[calc(110vh-186px)] w-full bg-white flex flex-col">
          <MobileCandidateDetail
            filterType={selectedCandidatesFilter === 'all' ? 'all' : 'other'}
            goBack={() => {
              setSelectedUserApplication(null);
              setSelectedStudent(null);
            }}
          />
        </div>
      );
    }

    return (
      <div className="h-screen w-full bg-white flex flex-col">
        <UserApplications
          students={allStudents?.all as (User & { status: string })[]}
          userApplications={userApplications[selectedCandidatesFilter]}
          setUserApplications={setUserApplications}
          setStudents={setAllStudents}
          setVisitedCandidates={setVisitedCandidates}
          visitedCandidates={visitedCandidates}
        />
      </div>
    );
  };

  const renderDesktopView = () => (
    <div className="col-span-12 grid grid-cols-12 xl:col-span-12">
      <div className="col-span-5 p-2">
        <UserApplications
          students={allStudents?.all as (User & { status: string })[]}
          userApplications={userApplications[selectedCandidatesFilter]}
          setUserApplications={setUserApplications}
          setStudents={setAllStudents}
          setVisitedCandidates={setVisitedCandidates}
          visitedCandidates={visitedCandidates}
        />
      </div>

      <div className="col-span-7 flex items-start justify-start rounded-xl border border-stroke p-2">
        {selectedUserApplication || selectedStudent ? (
          <CandidateDetail
            filterType={selectedCandidatesFilter === 'all' ? 'all' : 'other'}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-3xl font-semibold">Select a profile to view</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DefaultLayout>
      <div className="flex flex-col">
        <Breadcrumb pageName="Candidates" />
        <div>
          {!isMobile && (
            <div className="col-span-12 flex w-full items-center justify-between md:gap-6 flex-col md:flex-row">
              <div
                onClick={() => setSelectedCandidatesFilter('all')}
                className={`${
                  selectedCandidatesFilter == 'all'
                    ? 'bg-gray scale-105 shadow-xl '
                    : 'bg-white scale-100'
                } col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-blue-500 p-4 text-blue-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 `}
              >
                <h3 className="mb-4 text-4xl font-bold text-black dark:text-white">
                  {
                    fetchedAllStudents?.filter(
                      (studentItem) =>
                        (studentItem as User)?.name ||
                        (studentItem as User)?.email,
                    )?.length
                  }
                </h3>
                <p className="text-center font-medium ">Students</p>
              </div>

              <div
                onClick={() => setSelectedCandidatesFilter('applied')}
                className={`${
                  selectedCandidatesFilter == 'applied'
                    ? 'bg-gray scale-105 shadow-xl '
                    : 'bg-white scale-100'
                } col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-green-500 p-4 text-green-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 `}
              >
                <h3 className="mb-4 text-4xl font-bold text-black dark:text-white">
                  {
                    fetchedUserApplications?.filter(
                      (item: any) =>
                        typeof item?.status === 'string' &&
                        item?.status?.toLowerCase() !==
                          UserApplicationStatus?.Rejected?.toLowerCase() &&
                        item?.status?.toLowerCase() !==
                          UserApplicationStatus?.Skipped?.toLowerCase() &&
                        item?.status?.toLowerCase() !==
                          UserApplicationStatus?.Bookmarked?.toLowerCase(),
                    )?.length
                  }
                </h3>
                <p className="text-center font-medium ">Applications</p>
              </div>

              <div
                onClick={() => setSelectedCandidatesFilter('rejected')}
                className={`${
                  selectedCandidatesFilter == 'rejected'
                    ? 'bg-gray scale-105 shadow-xl '
                    : 'bg-white scale-100'
                } col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-red p-4 text-red shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 `}
              >
                <h3 className="mb-4 text-4xl font-bold text-black dark:text-white">
                  {
                    filterApplicationByStatus(
                      UserApplicationStatus?.Disqualified,
                    )?.filter(
                      (item) => (item as any)?.name || item?.applicant?.name,
                    )?.length
                  }
                </h3>
                <p className="text-center font-medium ">Rejections</p>
              </div>

              <div
                onClick={() => setSelectedCandidatesFilter('hired')}
                className={`${
                  selectedCandidatesFilter == 'hired'
                    ? 'bg-gray scale-105 shadow-xl '
                    : 'bg-white scale-100'
                } col-span-1 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-orange-500 p-4 text-orange-500 shadow-default transition-all hover:scale-105 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 `}
              >
                <h3 className="mb-4 text-4xl font-bold text-black dark:text-white">
                  {
                    filterApplicationByStatus(
                      UserApplicationStatus?.Hired,
                    )?.filter(
                      (item) => (item as any)?.name || item?.applicant?.name,
                    )?.length
                  }
                </h3>
                <p className="text-center font-medium ">Hired</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="col-span-12 flex h-[calc(110vh-186px)] w-full items-center justify-center bg-[inherit] ">
              <Loader />
            </div>
          ) : isMobile ? (
            renderMobileView()
          ) : (
            renderDesktopView()
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EmployerCandidates;
