import React, { useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import CreateJob from '../Form/CreateJob';
import { RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateJob,
  fetchJobs,
} from '../../store/reducers/jobSlice';
import { Job } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Timestamp } from 'firebase/firestore';
import { Eye, Pencil, Search } from 'lucide-react';
import { Tooltip, IconButton, Pagination } from '@mui/material';
import ApplicationsModal from '../../components/Modals/ApplicationsModal';

// Calendar
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import ViewJobModal from '../../components/Modals/ViewJobModal';
import BulkUploadModal from '../../components/Modals/Popups/BulkUploadModal';
import AnnounceJobModal from '../../components/Modals/AnnounceJobModal';
import parseDate from '../../utils/datetime';
import CLoader from '../../common/Loader';


const Jobs: React.FC = () => {
  //////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const jobsPerPage = 30;
  const {
    showJobForm,
    setShowJobForm,
    setShowJobViewModal,
  } = useStateContext();
  const { jobs } = useSelector((state: RootState) => state.job);
  const { userApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const { user } = useSelector((state: RootState) => state.user);
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const initialJobData: Job = {
    title: '',
    employerId: '',
    employerName: '',
    employerEmail: '',
    employerNumber: '',
    employerBio: '',
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
  //////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////
  const [initialData, setInitialData] = useState(initialJobData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectionRange, setSelectionRange] = useState(null);
  const [activatingJob, setActivatingJob] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [jobsWithApplications, setJobsWithApplications] = useState<Job[]>([]);
  const [allJobsWithApplications, setAllJobsWithApplications] = useState([]); 
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [openAnnounceModal, setOpenAnnounceModal] = useState(false);
  // const [activeJobsCount, setActiveJobsCount] = useState(0); 
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] =
    useState<boolean>(false);
  const [dateOrder, setDateOrder] = useState('newest');
  const [sortedJobs, setSortedJobs] = useState<Job[]>([]);
  //////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////
  const fetchData = async (currentPage = page) => {
    setIsLoading(true);
    try {
      const response = await dispatch<any>(
        fetchJobs({
          limit: 15,
          page: currentPage, 
          includeJobApplications: true,
        }),
      );
      setTotalPages(response.payload.totalPages);
      setPage(response.payload.currentPage); 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [dispatch]);
  useEffect(() => {
    if (jobs?.length > 0) {
      const jobsToProcess =  jobs;
      setAllJobsWithApplications(jobsToProcess);

      // setActiveJobsCount(jobsToProcess.filter((job) => job.isActive).length);
      // setTotalPages(computeTotalPages(jobsToProcess?.length));
      if (page === 1) setPage(1);
    }
  }, [userApplications, jobs]);
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
    if (jobsWithApplications && jobsWithApplications.length > 0) {
      const sorted = jobsWithApplications.slice().sort((a, b) => {
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
  const truncate = (text: string | undefined, maxLength: number): string => {
    if (!text) {
      return '';
    }
    // Trim spaces from the start of the text
    const trimmedText = text.trimStart();
    if (trimmedText.length > maxLength) {
      return trimmedText.slice(0, maxLength) + '...';
    }
    return trimmedText;
};

  
  const onOpenUpdateForm = (job: Job) => {
    console.log('job update form opening: ', job)
    setSearchValue('');
    setInitialData({
      ...job,
      employerId: job?.employerId ?? '',
      employerName: job?.employerName ?? '',
      employerEmail: job?.employerEmail ?? '',
      employerNumber: job?.employerNumber ?? '',
      employerBio: job?.employerBio ?? '',
      employerPhotoUrl: job?.employerPhotoUrl ?? '',
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
      photoUrl: job?.photoUrl ?? '',
      isActive: job?.isActive ?? true,
      noOfPositions: job?.noOfPositions ?? 1,
      rankIndex: job?.rankIndex ?? 0,
      _geoloc: job?._geoloc ?? { lat: 0, lng: 0 },
      title: job?.title ?? '',
      isRemote: job?.isRemote ?? false,
      jobLink: job?.jobLink ?? '',
      program: job?.program ?? [],
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
  // const onOpenAnnounceModal = (job: Job) => {
  //   if (job?.employerName) {
  //     setSelectedJob(job);
  //     setOpenAnnounceModal(true);
  //   } else {
  //     alert('Employer name is empty. Cannot announce.');
  //   }
  // };
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
    // const activeJobs = result.filter((job) => job.isActive);
    // setActiveJobsCount(activeJobs.length);
    setJobsWithApplications(result);
  };

  const onFilterJobByDateRange = (
    selection: { startDate: Date; endDate: Date } | null,
  ) => {
    let jobsToFilter = allJobsWithApplications;
    console.log('jobs to filter',jobsToFilter)
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
    // const activeJobs = result.filter((job) => job.isActive);
    // setActiveJobsCount(activeJobs.length);
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
      
      <div className="mt-4 flex flex-col gap-4">
        {/* Topbar */}
        <div className="flex flex-col gap-4">
          
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
                <BulkUploadModal />
            </div>
          
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
              <div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Applicants</th>
                        <th>Is Remote</th>
                        <th>Description</th>
                        <th>Employer</th>
                        <th>Employer Bio</th>
                        <th>Employer Email</th>
                        <th>Employer Number</th>
                        <th>Employer PhotoUrl</th>
                        <th>Photo URL</th>
                        <th>Job Link</th>
                        <th>Actions</th>
                        <th>Date Created</th>
                        <th>Date Updated</th>
                        <th>Branch Location</th>
                        <th>Address Line 1</th>
                        <th>Address Line 2</th>
                        <th>Contact Bio</th>
                        <th>Contact Email</th>
                        <th>Contact Name</th>
                        <th>Contact Number</th>
                        <th>State</th>
                        <th>Country</th>
                        <th>Expire Date</th>
                        <th>Hours</th>
                        <th>Hours Description</th>
                        <th>Pay</th>
                        <th>Pay Description</th>
                        <th>Pay Period</th>
                        <th>Shift</th>
                        <th>Shift Description</th>
                        <th>No. of Positions</th>
                        <th>Days</th>
                        <th>Days Description</th>
                        <th>Language</th>
                        <th>Program</th>
                        <th>Rank Index</th>
                        <th>Search Keywords</th>
                        <th>Geo Location</th>

                      </tr>
                    </thead>
                    <tbody>

                      {isLoading? <CLoader/> :sortedJobs?.map((job) => (
                        <tr key={job.id}> 
                          <td> {truncate(job.title, 20)}</td>
                          <td>{truncate(job?.city,20)}</td>
                          <td>{getStatus(job.applyDate,job.expireDate)}</td>
                          {/* <td >{job?.isActive ? 'Active' : 'InActive'}</td> */}
                          <td>
                            <Tooltip
                              title="View Applicants"
                              placement="top"
                            >
                              <p
                                className="cursor-pointer text-center text-[#637381] hover:text-primary dark:text-bodydark "
                                onClick={() =>
                                onOpenApplicationModal(job)
                                }
                              >
                                {job?.jobApplications
                                  ? job?.jobApplications?.length
                                  : 0}
                              </p>
                              </Tooltip>
                          </td>
                          <td>{job?.isRemote ? 'Yes' : 'No'}</td>
                          <td>{truncate(job?.description,20)}</td>
                          <td>{truncate(job?.employerName,20)}</td>
                          <td>{truncate(job?.employerBio,20)}</td>
                          <td>{job?.employerEmail}</td>
                          <td>{job?.employerNumber}</td>
                          <td>{truncate(job?.employerPhotoUrl,20)}</td>
                          <td>
                            <a href={job.photoUrl} target="_blank" rel="noopener noreferrer">
                              {truncate(job.photoUrl, 20)}
                            </a>
                          </td>
                          <td>
                            <a href={job?.jobLink} target="_blank" rel="noopener noreferrer">
                              {truncate(job?.jobLink, 20)}
                            </a>
                          </td>
                          <td className="actions">
                          <Tooltip title="View" placement="top">
                                            <IconButton
                                            onClick={() => onOpenViewModal(job)}
                                            >
                                            <Eye className="text-gray-icon" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit" placement="top">
                                                <IconButton
                                                onClick={() =>
                                                    onOpenUpdateForm(job)
                                                }
                                                >
                                                <Pencil className="text-gray-icon" />
                                                </IconButton>
                                            </Tooltip>
                                            <button
                                                disabled={activatingJob == job?.id}
                                                onClick={() => onToggleActive(job)}
                                                className="rounded-md bg-black px-2 py-1 text-whiten hover:bg-black/75 disabled:bg-black/50 "
                                            >
                                                {job?.isActive
                                                ? 'Deactivate'
                                                : 'Activate'}
                                            </button>
                          </td>
                          <td>{new Date(job.dateCreated).toLocaleString()}</td>
                          <td>{new Date(job.dateUpdated).toLocaleString()}</td>
                          <td>{job?.branchLocation}</td>
                          <td>{truncate(job?.addressLine1,20)}</td>
                          <td>{truncate(job?.addressLine2,20)}</td>
                          <td>{truncate(job?.contactBio,20)}</td>
                          <td>{job?.contactEmail}</td>
                          <td>{job?.contactName}</td>
                          <td>{job?.contactNumber}</td>
                          <td>{job?.state}</td>
                          <td>{job?.country}</td>
                          <td>{job?.expireDate}</td>
                          <td>{job?.hours}</td>
                          <td>{truncate(job?.hoursDescription,20)}</td>
                          <td>{job?.pay}</td>
                          <td>{truncate(job?.payDescription,20)}</td>
                          <td>{job?.payPeriod}</td>
                          <td>{job?.shift?.join(', ')}</td>
                          <td>{job?.shiftDescription}</td>
                          <td>{job?.noOfPositions}</td>
                          <td>{job?.days?.join(', ')}</td>
                          <td>{job?.daysDescription?.join(', ')}</td>
                          <td>{job?.language}</td>
                          <td>{job?.program}</td>
                          <td>{job?.rankIndex}</td>
                          <td>{truncate(job?.searchKeywords,20)}</td>
                          <td>{job?._geoloc?.lng}-{job?._geoloc?.lat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mb-2 mt-4 flex w-full justify-center">
                <Pagination
                  count={totalPages}
                  defaultPage={1}
                  page={page}
                  siblingCount={0}
                  onChange={(_, newPage) => {
                    setPage(newPage); 
                    fetchData(newPage); 
                  }}
                  size="large"
                />

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

export default Jobs;
