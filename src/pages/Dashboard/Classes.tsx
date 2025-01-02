import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { IconButton, Tooltip, MenuItem, Select } from '@mui/material';
import { Eye, Trash } from 'lucide-react';
import ViewClassModal from '../../components/Modals/ViewClassModal';
import { fetchStudentsOfInstitution } from '../../store/reducers/userSlice';
import Loader from '../../common/Loader';
import { UserRolesEnum } from '../../utils/enums';
import algoliasearch_index from '../../algolia/algolia';
import ViewJobsModal from '../../components/Modals/ViewJobsModal';
import AddProgramModal from '../../components/Modals/AddProgramModal';
import { fetchUserApplicationsForPartner } from '../../store/reducers/userApplicationsSlice';
import {
  fetchPrograms,
  getInstituteProgramsApi,
  selectPrograms,
  selectInstitutePrograms,
  getInstituteApi,
  linkProgramWithInstitute,
  getProgramsWithStudentsApi,
  selectProgramsWithStudents,
} from '../../store/reducers/programSlice';
// import CLoader from '../../common/CLoader';
import useMobile from '../../hooks/useMobile';
import { User, Institute } from '../../interfaces';
const Classes: React.FC = () => {
  /////////////////////////////////////////////variables//////////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const allPrograms = useSelector((state: RootState) => selectPrograms(state));
  const programsWithStudents = useSelector((state: RootState) =>
    selectProgramsWithStudents(state),
  );
  const institutePrograms = useSelector((state: RootState) =>
    selectInstitutePrograms(state),
  );
  const role: UserRolesEnum = String(
    localStorage.getItem('Role'),
  ) as UserRolesEnum;
  const { allUserApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  /////////////////////////////////////////////states//////////////////////////////////////////////////////////////////
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openJobsModal, setOpenJobsModal] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobCounts, setJobCounts] = useState<{ [key: string]: number }>({});
  const [sortColumn, setSortColumn] = useState('students');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swipeCounts, setSwipeCounts] = useState<{ [key: string]: number }>({});
  const [studentsInSelectedProgram, setStudentsInSelectedProgram] = useState<
    User[]
  >([]);
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(
    null,
  );
  const [isMobile] = useMobile();
  const [sortedPrograms, setSortedPrograms] = useState(programsWithStudents);
  ///////////////////////////////////////////////useEffect//////////////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(
      getProgramsWithStudentsApi({
        instituteId: mongoInstituteId,
        limit: 70,
        page: 1,
      }),
    );
  }, []);
  useEffect(() => {
    if (programsWithStudents?.length > 0) {
      // Filter out programs with no students and sort the remaining programs
      const filteredPrograms = programsWithStudents.filter(
        (program) => program.students?.length > 0,
      );

      setSortedPrograms(
        [...filteredPrograms].sort(
          (a, b) => b.students.length - a.students.length,
        ),
      );
    }
  }, [programsWithStudents]);
  useEffect(() => {
    dispatch<any>(
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      }),
    );
    setLoading(false);
    dispatch<any>(fetchUserApplicationsForPartner(mongoInstituteId));
  }, [mongoInstituteId, dispatch]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const instituteData = await dispatch<any>(
          getInstituteApi(mongoInstituteId),
        ).unwrap();
        setInstitute(instituteData.institute);
      } catch (error) {
        console.error('Error fetching institute data:', error);
      }
    };
    fetchData();
  }, [dispatch, mongoInstituteId]);
  useEffect(() => {
    dispatch<any>(getInstituteProgramsApi(mongoInstituteId));
  }, [mongoInstituteId, dispatch]);
  useEffect(() => {
    if (sortedPrograms?.length > 0) {
      fetchJobAndSwipeCounts();
    }
  }, [sortedPrograms, allUserApplications]);
  useEffect(() => {
    dispatch<any>(fetchPrograms(true));
  }, [dispatch]);

  ////////////////////////////////////////////////Functions//////////////////////////////////////////////////////////////////
  const searchJobs = async (programName: string) => {
    try {
      const searchParams = {
        hitsPerPage: 99999,
      };
      const result = await algoliasearch_index.search(
        programName,
        searchParams,
      );
      return Array.isArray(result.hits) ? result.hits : [];
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  };

  const fetchJobAndSwipeCounts = async () => {
    if (allUserApplications.length > 0) {
      const jobCountsObj: { [key: string]: number } = {};
      const swipeCountsObj: { [key: string]: number } = {};
      for (const program of sortedPrograms) {
        const jobs = await searchJobs(program?.name);
        jobCountsObj[program?.name] = jobs.length;
        const jobIds = jobs.map((job) => job.objectID);
        const filteredApplications = allUserApplications.filter((app) =>
          jobIds.includes(app.job_id),
        );
        swipeCountsObj[program?.name] = filteredApplications.length;
      }
      setJobCounts(jobCountsObj);
      setSwipeCounts(swipeCountsObj);
    }
  };
  const onOpenViewModal = (p) => {
    setSelectedClass(p);
    setStudentsInSelectedProgram(p?.students || []);
    setOpenViewModal(true);
  };

  const onOpenJobsModal = async (program: any) => {
    const jobsList = await searchJobs(program?.name);
    setJobs(jobsList);
    setOpenJobsModal(true);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
      setSortedPrograms((prevPrograms) =>
        [...prevPrograms].sort((a, b) => {
          if (column === 'students') {
            return newSortOrder === 'asc'
              ? a?.students?.length - b?.students?.length
              : b?.students?.length - a?.students?.length;
          } else if (column === 'jobs') {
            // Safely accessing job counts
            const jobCountA = jobCounts[a?.name] || 0;
            const jobCountB = jobCounts[b?.name] || 0;

            return newSortOrder === 'asc'
              ? jobCountA - jobCountB
              : jobCountB - jobCountA;
          }
          return 0;
        }),
      );
    } else {
      setSortColumn(column);
      setSortOrder('desc');
      setSortedPrograms((prevPrograms) =>
        [...prevPrograms].sort((a, b) => {
          if (column === 'students') {
            return b?.students?.length - a?.students?.length;
          } else if (column === 'jobs') {
            // Safely accessing job counts
            const jobCountA = jobCounts[a?.name] || 0;
            const jobCountB = jobCounts[b?.name] || 0;

            return jobCountB - jobCountA;
          }
          return 0;
        }),
      );
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleRemoveProgram = async (programId: string) => {
    setDeletingProgramId(programId);

    if (!institute) {
      console.error('Institute data is not available');
      setDeletingProgramId(null);
      return;
    }
    const updatedProgramIds = institute.program.filter(
      //@ts-expect-error:might give error
      (program) => program._id !== programId,
    );

    const updatedInstitute: Institute = {
      ...institute,
      program: updatedProgramIds,
    };

    try {
      await dispatch<any>(
        linkProgramWithInstitute({
          instituteId: mongoInstituteId,
          updatedInstitute,
        }),
      );

      setDeletingProgramId(null);
    } catch (error) {
      console.error('Error removing program from institute:', error);
    } finally {
      setDeletingProgramId(null);
    }
  };
  //////////////////////////////////////////////// RENDER //////////////////////////////////////////////////////////////////
  return (
    <DefaultLayout>
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <div className="rounded-sm border border-stroke bg-white px-4 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between">
              <h4 className="text-center text-xl sm:text-2xl font-extrabold mt-4 tracking-widest text-black dark:text-white">
                Programs
              </h4>

              <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-0">
                <Select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as 'asc' | 'desc');
                    handleSort(sortColumn); // Trigger the sort when the order changes
                  }}
                  className="bg-gray-100 rounded-md text-xs sm:text-sm h-8"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
                {role === 'Admin' && (
                  <button
                    className={`flex h-fit justify-center  rounded bg-graydark px-2.5 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    onClick={handleOpenModal}
                  >
                    Add Program
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div
                className={`grid ${
                  role == UserRolesEnum.SchoolAdmin
                    ? 'grid-cols-5'
                    : 'grid-cols-4'
                } rounded-sm bg-gray-2 dark:bg-meta-4`}
              >
                <div className="col-span-1 p-2 text-center">
                  <h5 className="text-xs sm:text-sm md:text-base font-bold ">
                    Program Name
                  </h5>
                </div>

                <div className="col-span-1 p-2 text-center cursor-pointer">
                  <Tooltip title="Sort by Students" placement="top">
                    <h5
                      className={`text-xs sm:text-sm md:text-base font-bold  ${
                        sortColumn === 'students' ? 'text-black' : ''
                      }`}
                      onClick={() => handleSort('students')}
                    >
                      Active Students
                    </h5>
                  </Tooltip>
                </div>

                <div className="col-span-1 p-2 text-center cursor-pointer">
                  <Tooltip title="Sort by Jobs" placement="top">
                    <h5
                      className={`text-xs sm:text-sm md:text-base font-bold  ${
                        sortColumn === 'jobs' ? 'text-black' : ''
                      }`}
                      onClick={() => handleSort('jobs')}
                    >
                      Total Jobs
                    </h5>
                  </Tooltip>
                </div>

                <div className="col-span-1 p-2 text-center">
                  <h5 className="text-xs sm:text-sm md:text-base font-bold ">
                    Swipes
                  </h5>
                </div>

                {role == UserRolesEnum.SchoolAdmin && (
                  <div className="col-span-1 p-2 text-center">
                    <h5 className="text-xs sm:text-sm md:text-base font-bold ">
                      Action
                    </h5>
                  </div>
                )}
              </div>

              {loading ? (
                <Loader />
              ) : sortedPrograms?.length === 0 ? (
                <div className="flex h-[17rem] w-full items-center justify-center">
                  <p className="text-3xl font-semibold">No Program.</p>
                </div>
              ) : (
                sortedPrograms.map((program, key) => (
                  <div
                    className={`grid ${
                      role == UserRolesEnum.SchoolAdmin
                        ? 'grid-cols-5'
                        : 'grid-cols-4'
                    } ${
                      key !== sortedPrograms?.length - 1 &&
                      'border-b border-stroke dark:border-strokedark'
                    }`}
                    key={program?.id}
                  >
                    {/* Program Name */}
                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                      <Tooltip title="View Program" placement="top">
                        <a
                          className="truncate cursor-pointer text-sm text-black dark:text-white font-semibold hover:underline"
                          onClick={() => onOpenViewModal(program)}
                        >
                          {program?.name}
                        </a>
                      </Tooltip>
                    </div>

                    {/* Total Students */}
                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                      <p className="text-meta-3 text-sm">
                        {program?.students?.length}
                      </p>
                    </div>

                    {/* Total Jobs */}
                    <div className="flex items-center justify-center p-2.5 xl:p-5 cursor-pointer">
                      <p
                        className="text-meta-3 text-sm"
                        onClick={() => onOpenJobsModal(program)}
                      >
                        {jobCounts[program?.name] ?? 'Loading...'}
                      </p>
                    </div>

                    {/* Total Swipes */}
                    <div className="flex items-center justify-center p-2.5 xl:p-5 ">
                      <p className="text-meta-3 text-sm">
                        {swipeCounts[program?.name] ?? 'Loading...'}
                      </p>
                    </div>

                    {role == UserRolesEnum.SchoolAdmin && (
                      <div className="flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip title="View" placement="top">
                            <IconButton
                              onClick={() => onOpenViewModal(program)}
                            >
                              <Eye className="text-gray-icon" />
                            </IconButton>
                          </Tooltip>
                          {/* <Tooltip title="Remove Program" placement="top">
                            <IconButton
                              onClick={() => handleRemoveProgram(program?.id)}
                            >
                              {deletingProgramId === program?.id ? (
                                <CLoader size="xs" />
                              ) : (
                                <Trash className="text-gray-icon" />
                              )}
                            </IconButton>
                          </Tooltip> */}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedClass && (
        <ViewClassModal
          open={openViewModal}
          setOpen={setOpenViewModal}
          selectedClass={selectedClass}
          studentsInProgram={studentsInSelectedProgram}
        />
      )}

      {openJobsModal && (
        <ViewJobsModal
          open={openJobsModal}
          setOpen={setOpenJobsModal}
          jobs={jobs}
        />
      )}
      <AddProgramModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        programs={institutePrograms}
        partnerId={mongoInstituteId}
        allPrograms={allPrograms}
      />
    </DefaultLayout>
  );
};

export default Classes;
