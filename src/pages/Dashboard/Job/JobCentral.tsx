import React, { useState, useEffect } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import CreateJob from '../../Form/CreateJob';
import { RootState, AppDispatch } from '../../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateJob,
  fetchJobsByEmployerId,
  fetchJobs,
  fetchAllJobsCount,
} from '../../../store/reducers/jobSlice';
import { Job } from '../../../interfaces';
import { useStateContext } from '../../../context/useStateContext';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import CLoader from '../../../common/Loader';
import { Timestamp } from 'firebase/firestore';
import {
  fetchUserApplicationsByEmployerEmail,
  fetchUserApplicationsForPartner,
} from '../../../store/reducers/userApplicationsSlice';
import { Eye, Pencil, Search, Volume2 } from 'lucide-react';
import { Tooltip, IconButton, Pagination } from '@mui/material';
import ApplicationsModal from '../../../components/Modals/ApplicationsModal';

// Calendar
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import ViewJobModal from '../../../components/Modals/ViewJobModal';
import { extractDateTimeFromTimestamp } from '../../../utils/functions';
import RenewJob from '../../../components/Modals/RenewJob';
import BulkUploadModal from '../../../components/Modals/Popups/BulkUploadModal';
import { fetchEmployerCount } from '../../../store/reducers/employersSlice';
import AnnounceJobModal from '../../../components/Modals/AnnounceJobModal';
import { Stats } from './component/Stats';
import { DateRangee } from '../../../components/DateRange';
import parseDate from '../../../utils/datetime';

const JobCentral: React.FC = () => {
  //////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const jobsPerPage = 30;
  const {
    showJobForm,
    setShowJobForm,
    setShowJobViewModal,
    page: pageType,
  } = useStateContext();
  const { jobs, allJobs } = useSelector((state: RootState) => state.job);
  const { userApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const role = String(localStorage.getItem('Role'));
  const { user } = useSelector((state: RootState) => state.user);
  const { allEmployersCount } = useSelector(
    (state: RootState) => state.employer,
  );
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const initialJobData: Job = {
    title: '',
    employerId: authUser?.id || user?.id,
    employerName: authUser?.name || user?.name,
    employerEmail: authUser?.email || user?.email,
    employerNumber: user?.phone,
    employerBio: user?.bio,
    branchLocation: '',
    contactEmail: '',
    contactName: '',
    contactNumber: '',
    contactBio: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    language: 'English',
    hours: '',
    hoursDescription: '',
    days: [],
    daysDescription: [],
    shift: [],
    shiftDescription: [],
    pay: '',
    payPeriod: '', //pay hour, annual
    payDescription: '',
    description: '',
    searchKeywords: '',
    dateCreated: '',
    dateUpdated: '',
    datePosted: '',
    // photoUrl: "",
    isActive: true,
    isRemote: false,

    expireDate: '',
    applyDate: new Date(),
    noOfPositions: 1,
    rankIndex: 0,
    _geoloc: { lat: 0, lng: 0 },
    applicationsCount: 0,
    isTest: false,
  };
  const mongoUserId = localStorage.getItem('mongoUserId');
  //////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////
  const [initialData, setInitialData] = useState(initialJobData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectionRange, setSelectionRange] = useState(null);
  const [activatingJob, setActivatingJob] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [jobsWithApplications, setJobsWithApplications] = useState<Job[]>([]);
  const [allJobsWithApplications, setAllJobsWithApplications] = useState([]); // For search purpose
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [openAnnounceModal, setOpenAnnounceModal] = useState(false);
  const [activeJobsCount, setActiveJobsCount] = useState(0); // New state for active jobs count
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] =
    useState<boolean>(false);
  const [dateOrder, setDateOrder] = useState('newest');
  const [sortedJobs, setSortedJobs] = useState<Job[]>([]);
  //////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (pageType === 'Employer') {
          // if (jobs.length === 0) {
          if (role === 'SuperAdmin') {
            await (dispatch as AppDispatch)(
              fetchJobs({
                limit: 100000,
                page: 1,
                includeJobApplications: true,
              }),
            );
          } else {
            await (dispatch as AppDispatch)(
              fetchJobsByEmployerId({ id: mongoUserId }),
            );
          }
          // }
          await (dispatch as AppDispatch)(
            fetchUserApplicationsByEmployerEmail(authUser?.email),
          );
        } else {
          if (allJobs.length === 0) {
            await Promise.all([
              (dispatch as AppDispatch)(fetchAllJobsCount()),
              (dispatch as AppDispatch)(fetchEmployerCount()),
              (dispatch as AppDispatch)(
                fetchUserApplicationsForPartner(authUser.partnerId),
              ),
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [pageType, authUser?.email]);

  useEffect(() => {
    if (jobs?.length > 0 || allJobs?.length > 0) {
      const jobsToProcess = pageType === 'Employer' ? jobs : allJobs;
      setAllJobsWithApplications(jobsToProcess);

      setActiveJobsCount(jobsToProcess.filter((job) => job.isActive).length);
      setTotalPages(computeTotalPages(jobsToProcess?.length));
      if (page === 1) setPage(1);
    }
  }, [userApplications, jobs, allJobs, pageType]);
  useEffect(() => {
    if (searchValue.length > 0) {
      onSearch();
    } else if (selectionRange?.startDate) {
      onFilterJobByDateRange(selectionRange);
    } else {
      setJobsWithApplications(allJobsWithApplications);
    }
  }, [searchValue, allJobsWithApplications, selectionRange]);
  useEffect(() => {
    // Automatically remove search when the input is cleared
    if (searchValue === '') {
      onRemoveSearch();
    }
  }, [searchValue]);

  useEffect(() => {
    if (jobsWithApplications?.length > 0) {
      const sorted = jobsWithApplications?.slice()?.sort((a, b) => {
        const dateA = parseDate(a.dateCreated);
        const dateB = parseDate(b.dateCreated);

        return dateOrder === 'newest'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
      setSortedJobs(sorted);
    }
  }, [jobsWithApplications]);

  //////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////

  const onOpenUpdateForm = (job: Job) => {
    setSearchValue('');
    setInitialData({
      ...job,
      employerId: job?.employerId ?? '',
      employerName: job?.employerName ?? '',
      employerEmail: job?.employerEmail ?? '',
      employerNumber: job?.employerNumber ?? '',
      employerBio: job?.employerBio ?? '',
      branchLocation: job?.branchLocation ?? '',
      contactEmail: job?.contactEmail ?? '',
      contactName: job?.contactName ?? '',
      contactNumber: job?.contactNumber ?? '',
      contactBio: job?.contactBio ?? '',
      addressLine1: job?.addressLine1 ?? '',
      addressLine2: job?.addressLine2 ?? '',
      city: job?.city ?? '',
      state: job?.state ?? '',
      zipCode: job?.zipCode ?? '',
      country: job?.country ?? 'USA',
      dateCreated: job?.dateCreated ?? new Date(),
      dateUpdated: job?.dateUpdated ?? new Date(),
      language: job?.language ?? '',
      hours: job?.hours ?? '',
      hoursDescription: job?.hoursDescription ?? '',
      days: job?.days ?? [],
      daysDescription: job?.daysDescription ?? [],
      shift: job?.shift ?? [],
      shiftDescription: job?.shiftDescription ?? [],
      pay: job?.pay ?? '',
      payPeriod: job?.payPeriod ?? '',
      payDescription: job?.payDescription ?? '',
      description: job?.description ?? '',
      searchKeywords: job?.searchKeywords ?? '',
      // photoUrl: job?.photoUrl ?? '',
      isActive: job?.isActive ?? true,
      noOfPositions: job?.noOfPositions ?? 1,
      rankIndex: job?.rankIndex ?? 0,
      _geoloc: job?._geoloc ?? { lat: 0, lng: 0 },
      title: job?.title ?? '',
      isRemote: job?.isRemote ?? false,
      applyDate:
        job?.applyDate instanceof Timestamp
          ? job?.applyDate.toDate().toISOString().split('T')[0]
          : job?.applyDate,
      expireDate:
        job?.expireDate instanceof Timestamp
          ? job?.expireDate.toDate().toISOString().split('T')[0]
          : job?.expireDate,
    });
    setShowJobForm(true);
  };

  const onOpenViewModal = (job: Job) => {
    setSelectedJob(job);
    setShowJobViewModal(true);
  };
  const onOpenAnnounceModal = (job: Job) => {
    if (job?.employerName) {
      setSelectedJob(job);
      setOpenAnnounceModal(true);
    } else {
      alert('Employer name is empty. Cannot announce.');
    }
  };
  const onOpenApplicationModal = async (job: Job) => {
    setSelectedJob(job);
    setIsApplicationsModalOpen(true);
  };
  const onCloseApplicationsModal = () => {
    setIsApplicationsModalOpen(false);
  };

  const onToggleActive = (job: Job) => {
    setActivatingJob(job?.id);
    dispatch<any>(updateJob({ ...job, isActive: !job?.isActive })).then(() => {
      setShowJobForm(false);
      setActivatingJob('');
    });
  };

  const onSearch = () => {
    let jobsToSearch = allJobsWithApplications;
    if (selectionRange?.startDate)
      jobsToSearch = getJobsOfDateRange(
        allJobsWithApplications,
        selectionRange,
      );

    let result = jobsToSearch;

    if (searchValue.trim().length > 0) {
      const [titleQuery, cityQuery] = searchValue.toLowerCase().split(',');

      result = jobsToSearch.filter((j: Job) => {
        const titleMatches = j.title
          ? j.title.toLowerCase().includes(titleQuery)
          : false;
        const employerCity = j.city
          ? j.city.toLowerCase().includes(cityQuery)
          : false;
        const jobCity = j.city
          ? j.city.toLowerCase().includes(searchValue.toLowerCase())
          : false;
        const employerMatches = j.employerName
          ? j.employerName.toLowerCase().includes(searchValue.toLowerCase())
          : false;

        return titleMatches || employerCity || employerMatches || jobCity;
      });
    }

    setPage(1);
    setTotalPages(computeTotalPages(result?.length));
    const activeJobs = result.filter((job) => job.isActive);
    setActiveJobsCount(activeJobs.length);
    setJobsWithApplications(result);
  };

  const onFilterJobByDateRange = (
    selection: { startDate: Date; endDate: Date } | null,
  ) => {
    let jobsToFilter = allJobsWithApplications;
    if (searchValue.trim().length > 0) {
      jobsToFilter = allJobsWithApplications.filter(
        (j: Job) =>
          j.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          j.employerName.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    let result = jobsToFilter;
    if (selection?.startDate) {
      result = getJobsOfDateRange(jobsToFilter, selection);
    }

    setPage(1);
    setTotalPages(computeTotalPages(result?.length));
    const activeJobs = result.filter((job) => job.isActive);
    setActiveJobsCount(activeJobs.length);
    setJobsWithApplications(result);
  };

  const getJobsOfDateRange = (
    jobs: Job[],
    selection: { startDate: Date; endDate: Date },
  ) => {
    const startDate = new Date(selection?.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(selection?.endDate);
    endDate.setHours(23, 59, 59, 999);

    const filtered = jobs.filter((j: Job) => {
      const dateCreated = j?.dateCreated?.seconds
        ? new Date(j?.dateCreated?.seconds * 1000)
        : new Date();
      return dateCreated >= startDate && dateCreated <= endDate;
    });

    return filtered;
  };

  const onRemoveSearch = () => {
    setSearchValue('');
    setSelectionRange(null);
    // Reset jobsWithApplications to all jobs
    setJobsWithApplications(allJobsWithApplications);
    // Reset pagination to show all pages
    setTotalPages(computeTotalPages(allJobsWithApplications.length));
    setPage(1);
  };

  const getStatus = (applyDate, expireDate) => {
    const currentDate = new Date();
    const aDate = applyDate?.seconds ? applyDate.toDate() : new Date(applyDate);
    const eDate = expireDate
      ? expireDate?.seconds
        ? expireDate.toDate()
        : new Date(expireDate)
      : null;
    if ((aDate < currentDate && eDate > currentDate) || !eDate) {
      return 'Active';
    } else if (eDate < currentDate) {
      return 'Expired';
    } else {
      return 'Paused';
    }
  };

  const computeTotalPages = (arrayLength: number) => {
    return Math.ceil(arrayLength / jobsPerPage);
  };

  const handleDateOrderChange = (event) => {
    setDateOrder(event.target.value);
  };
  ///////////////////////////////////////////////////////////// COMPONENTS ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////////////////
  return (
    <DefaultLayout>
      <ViewJobModal job={selectedJob} />
      <AnnounceJobModal
        open={openAnnounceModal}
        setOpen={setOpenAnnounceModal}
        job={selectedJob}
      />

      <Breadcrumb pageName="Job Central" />
      <Stats
        totalJobs={pageType === 'Employer' ? jobs.length : allJobs.length}
        activeJobs={activeJobsCount}
        employersCount={allEmployersCount}
        pageType={pageType}
        jobsWithApplications={jobsWithApplications}
      />

      <div className="mt-4 flex flex-col gap-4">
        {/* Topbar */}
        <div className="flex flex-col gap-4">
          {!showJobForm && (
            <DateRangee
              onFilterJobByDateRange={onFilterJobByDateRange}
              setSelectionRange={setSelectionRange}
              selectionRange={selectionRange}
            />
          )}
          <div
            className={`flex flex-col sm:flex-row items-center ${
              showJobForm ? 'justify-end' : 'justify-between'
            } w-full gap-4`}
          >
            {!showJobForm && (
              <div className="flex w-full items-center justify-start gap-2 lg:w-1/2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSearch();
                  }}
                  className="w-full"
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
                      placeholder="Search by position/employer"
                      className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white"
                    />
                  </div>
                </form>
                {searchValue?.length > 0 && (
                  <button
                    onClick={onRemoveSearch}
                    className="w-40 cursor-pointer text-primary hover:underline"
                  >
                    Remove Search
                  </button>
                )}
              </div>
            )}

            {pageType === 'Employer' ? (
              <div className="flex w-full sm:w-auto items-center justify-center gap-2">
                <button
                  className="flex h-fit justify-center rounded bg-[#1C2434] px-6 py-2 font-medium text-white hover:bg-opacity-90 disabled:bg-primary/50"
                  onClick={() => {
                    setInitialData(initialJobData);
                    setShowJobForm(!showJobForm);
                  }}
                >
                  {!showJobForm ? 'Add Job' : 'Show Job Postings'}
                </button>
                {role === 'SuperAdmin' && <BulkUploadModal />}
              </div>
            ) : null}
          </div>
          <select
            id="dateOrder"
            value={dateOrder}
            onChange={handleDateOrderChange}
            style={{ width: '200px' }}
            className="rounded border border-gray-300 bg-white text-gray-800 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition sm:w-auto"
          >
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>
        </div>

        {showJobForm ? (
          <CreateJob initialData={initialData} />
        ) : (
          <div className="overflow-hidden rounded-[10px]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1300px]">
                {/* table header start */}
                <div
                  style={{
                    gridTemplateColumns: `repeat(${
                      pageType == 'Employer' ? 31 : 31
                    }, minmax(0, 1fr))`,
                  }}
                  className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
                >
                  <div className="col-span-4">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Position
                    </h5>
                  </div>
                  {/* {pageType == 'Institution' && ( */}
                  <div className="col-span-3">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Employer
                    </h5>
                  </div>
                  {/* )} */}

                  <div className="col-span-3">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Applicants
                    </h5>
                  </div>
                  {pageType == 'Employer' ? (
                    <div className="col-span-3">
                      <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                        Status
                      </h5>
                    </div>
                  ) : null}
                  <div className="col-span-4 align-middle">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Photo Url
                    </h5>
                  </div>
                  <div className="col-span-4 align-middle">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Job Link
                    </h5>
                  </div>
                  <div className="col-span-4">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Actions
                    </h5>
                  </div>
                  <div className="col-span-3">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Date Created
                      {/* (mm/dd/yyyy) */}
                    </h5>
                  </div>
                  <div className="col-span-3 align-middle">
                    <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                      Date Updated
                    </h5>
                  </div>
                </div>

                {/* table header end */}

                {/* table body start */}
                <div className="bg-white dark:bg-boxdark">
                  {isLoading ? (
                    <CLoader />
                  ) : jobsWithApplications?.length == 0 ? (
                    <div className="flex h-40 w-full items-center justify-center ">
                      <p className="text-gray-400 dark:text-bodylight text-center">
                        {searchValue?.length > 0 &&
                          Boolean(selectionRange?.startDate) &&
                          'No jobs found for the selected date range and search query'}
                        {searchValue?.length > 0 &&
                          !selectionRange?.startDate &&
                          'No jobs found for the search query'}
                        {Boolean(selectionRange?.startDate) &&
                          searchValue?.length == 0 &&
                          'No jobs found for the selected date range'}
                        {searchValue?.length == 0 &&
                          selectionRange?.startDate == null &&
                          'No jobs found'}
                      </p>
                    </div>
                  ) : (
                    sortedJobs
                      ?.slice((page - 1) * jobsPerPage, page * jobsPerPage)
                      ?.map(
                        (
                          tempJob: Job & { applicationsCount: number },
                          index,
                        ) => {
                          const status = tempJob?.isActive
                            ? getStatus(tempJob?.applyDate, tempJob?.expireDate)
                            : 'Inactive';

                          return (
                            <div
                              key={index}
                              style={{
                                gridTemplateColumns: `repeat(${
                                  pageType == 'Employer' ? 31 : 31
                                }, minmax(0, 1fr))`,
                              }}
                              className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                            >
                              <div className="col-span-4 mr-1">
                                <p
                                  onClick={() => onOpenViewModal(tempJob)}
                                  className="cursor-pointer text-center text-[#637381] hover:text-primary dark:text-bodydark "
                                >
                                  {tempJob?.title}, {tempJob?.city}
                                </p>
                              </div>
                              {/* {pageType == 'Institution' && ( */}
                              <div className="col-span-3">
                                <p className="text-center text-[#637381] dark:text-bodydark">
                                  {tempJob?.employerName}
                                </p>
                              </div>
                              {/* )} */}

                              <div className="col-span-3 cursor-pointer">
                                <Tooltip
                                  title="View Applicants"
                                  placement="top"
                                >
                                  <p
                                    className="cursor-pointer text-center text-[#637381] hover:text-primary dark:text-bodydark "
                                    onClick={() =>
                                      onOpenApplicationModal(tempJob)
                                    }
                                  >
                                    {/* {tempJob?.applicationsCount ?? 0} */}
                                    {tempJob?.jobApplications
                                      ? tempJob?.jobApplications?.length
                                      : 0}
                                  </p>
                                </Tooltip>
                              </div>

                              {pageType == 'Employer' ? (
                                <div className="col-span-3">
                                  <p
                                    className={` text-center
                              ${
                                status == 'Active'
                                  ? 'text-meta-3'
                                  : status == 'Inactive'
                                    ? 'text-meta-8'
                                    : status == 'Paused'
                                      ? 'text-meta-5'
                                      : status == 'Expired'
                                        ? 'text-meta-1'
                                        : 'text-[#637381]'
                              } dark:text-bodydark`}
                                  >
                                    {status}
                                  </p>
                                </div>
                              ) : null}
                              <div className="col-span-4 mr-1">
                                <p className="text-center text-[#637381] dark:text-bodydark mr-2">
                                  {tempJob?.photoUrl ? (
                                    <a
                                      href={tempJob.photoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block max-w-[150px] truncate"
                                    >
                                      {tempJob.photoUrl.slice(0, 20)}
                                      {tempJob.photoUrl.length > 20
                                        ? '...'
                                        : ''}
                                    </a>
                                  ) : (
                                    ''
                                  )}
                                </p>
                              </div>

                              <div className="col-span-4 ml-2">
                                <p className="text-center text-[#637381] dark:text-bodydark">
                                  {tempJob?.jobLink ? (
                                    <a
                                      href={tempJob.jobLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block max-w-[150px] truncate"
                                    >
                                      {tempJob.jobLink.slice(0, 20)}
                                      {tempJob.jobLink.length > 20 ? '...' : ''}
                                    </a>
                                  ) : (
                                    ''
                                  )}
                                </p>
                              </div>

                              <div className="col-span-4">
                                <div className="flex items-start justify-center gap-1">
                                  <Tooltip title="View" placement="top">
                                    <IconButton
                                      onClick={() => onOpenViewModal(tempJob)}
                                    >
                                      <Eye className="text-gray-icon" />
                                    </IconButton>
                                  </Tooltip>
                                  {pageType == 'Employer' ? (
                                    <>
                                      <Tooltip title="Edit" placement="top">
                                        <IconButton
                                          onClick={() =>
                                            onOpenUpdateForm(tempJob)
                                          }
                                        >
                                          <Pencil className="text-gray-icon" />
                                        </IconButton>
                                      </Tooltip>
                                      <button
                                        disabled={activatingJob == tempJob?.id}
                                        onClick={() => onToggleActive(tempJob)}
                                        className="rounded-md bg-black px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50 "
                                      >
                                        {tempJob?.isActive
                                          ? 'Deactivate'
                                          : 'Activate'}
                                      </button>
                                      {status == 'Expired' && (
                                        <RenewJob
                                          job={tempJob}
                                          className="rounded-md bg-black px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50 "
                                        />
                                      )}
                                    </>
                                  ) : (
                                    <Tooltip title="Announce" placement="top">
                                      <IconButton
                                        onClick={() =>
                                          onOpenAnnounceModal(tempJob)
                                        }
                                      >
                                        <Volume2 className="text-gray-icon" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-3">
                                <p className="text-center text-[#637381] dark:text-bodydark">
                                  {tempJob?.dateCreated
                                    ? extractDateTimeFromTimestamp(
                                        tempJob?.dateCreated,
                                      )?.date
                                    : '-'}
                                </p>
                              </div>
                              <div className="col-span-3">
                                <p className="text-center text-[#637381] dark:text-bodydark">
                                  {tempJob?.dateUpdated
                                    ? extractDateTimeFromTimestamp(
                                        tempJob?.dateUpdated,
                                      )?.date
                                    : '-'}
                                </p>
                              </div>
                            </div>
                          );
                        },
                      )
                  )}
                </div>

                {/* Pagination */}
                <div className="mb-2 mt-4 flex w-full justify-center">
                  <Pagination
                    count={totalPages}
                    defaultPage={1}
                    page={page}
                    siblingCount={0}
                    onChange={(_: any, page: number) => setPage(page)}
                    size="large"
                  />
                </div>
                {/* table body end */}
              </div>
            </div>
          </div>
        )}
        {isApplicationsModalOpen && (
          <ApplicationsModal
            open={isApplicationsModalOpen}
            onClose={onCloseApplicationsModal}
            applications={selectedJob?.jobApplications}
            job={selectedJob}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default JobCentral;
