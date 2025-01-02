import React, { useState, useEffect } from 'react';
import StudentProfileModal from '../../components/Modals/ViewStudentsModal';
import DefaultLayout from '../../layout/DefaultLayout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { User } from '../../interfaces';
import { fetchStudentsOfInstitution } from '../../store/reducers/userSlice';
import InstituteStudents from '../../components/Tables/InstituteStudents';
import CreateStudent from '../../components/Modals/CreateStudent';
import { CircularProgress } from '@mui/material';

import {
  fetchPrograms,
  selectPrograms,
  selectProgramStatus,
} from '../../store/reducers/programSlice';
import { parseDate } from '../../utils/datetime';
import SearchIcon from '@mui/icons-material/Search';
import ProgramFilter from './ProgramFilter';
import useMobile from '../../hooks/useMobile';

const SchoolStudents: React.FC = () => {
  /////////////////////////////////////////////variables//////////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { students: fetchedStudents } = useSelector(
    (state: RootState) => state.user,
  );

  const programs = useSelector((state: RootState) => selectPrograms(state));
  const status = useSelector((state: RootState) => selectProgramStatus(state));

  const [isMobile] = useMobile();
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  /////////////////////////////////////////////states//////////////////////////////////////////////////////////////////////
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openCreateStudentModal, setOpenCreateStudentModal] = useState(false);
  const [filteredStudents, setFilteredStudents] =
    useState<User[]>(fetchedStudents);
  const [students, setStudents] = useState<User[]>(fetchedStudents);
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setLoading] = useState(false);
  ///////////////////////////////////////////////useEffect//////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (fetchedStudents.length === 0) {
      setLoading(true);

      dispatch<any>(
        fetchStudentsOfInstitution({
          instituteId: mongoInstituteId,
          limit: 1000,
          page: 1,
        }),
      );
      setLoading(false);
    }
  }, [fetchedStudents]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch<any>(fetchPrograms(true));
    }
  }, [status, dispatch]);

  useEffect(() => {
    setFilteredStudents(fetchedStudents);
  }, [fetchedStudents]);

  useEffect(() => {
    const sortedStudents = [...filteredStudents].sort((a, b) => {
      const dateA = parseDate(a.dateCreated);
      const dateB = parseDate(b.dateCreated);
      return dateB.getTime() - dateA.getTime();
    });
    setStudents(sortedStudents);
  }, [filteredStudents]);
  ////////////////////////////////////////////////Functions//////////////////////////////////////////////////////////////////
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = fetchedStudents.filter((student) => {
      const studentName = student.name ? student.name.toLowerCase() : '';
      return studentName.includes(value);
    });
    setFilteredStudents(filtered);
  };
  const handleProgramFilterChange = (programName: string | null) => {
    if (programName) {
      const programNameLower = programName?.toLowerCase() || '';
      setFilteredStudents(
        fetchedStudents.filter((student) => {
          let studentProgramName = '';

          if (typeof student.program === 'string') {
            studentProgramName = student?.program?.toLowerCase();
          } else if (student?.program && typeof student?.program === 'object') {
            studentProgramName = student?.program?.name?.toLowerCase();
          }

          return studentProgramName === programNameLower;
        }),
      );
    } else {
      setFilteredStudents(fetchedStudents);
    }
  };
  const handleSortByApplications = () => {
    const sortedStudents = [...students].sort((a, b) => {
      const aApplications = a.jobApplications?.length || 0;
      const bApplications = b.jobApplications?.length || 0;
      return bApplications - aApplications;
    });
    setStudents(sortedStudents);
  };

  //////////////////////////////////////////////// RENDER //////////////////////////////////////////////////////////////////
  return (
    <DefaultLayout>
      <CreateStudent
        open={openCreateStudentModal}
        setOpen={setOpenCreateStudentModal}
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <CircularProgress />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <div className="col-span-12 flex w-full xl:col-span-12">
            <div className="w-full">
              {!isMobile && (
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                  <h3
                    className={` font-bold text-black dark:text-white ${isMobile ? 'text-xl' : 'text-title-md2'}`}
                  >
                    Students:
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <ProgramFilter
                      programs={programs}
                      onFilterChange={handleProgramFilterChange}
                    />
                    <div className="relative">
                      <SearchIcon
                        className={`absolute  top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'left-1.5' : 'left-3'}`}
                      />
                      <input
                        type="text"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`border rounded-md  text-sm ${isMobile ? 'p-1 pl-7' : 'p-2 pl-10'}`}
                      />
                    </div>

                    <button
                      onClick={() => setOpenCreateStudentModal(true)}
                      className={`rounded-md bg-graydark px-3 py-2.5  font-medium text-white hover:bg-opacity-90 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    >
                      Add Student
                    </button>
                  </div>
                </div>
              )}
              {isMobile && (
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                  <h3
                    className={` font-bold text-black dark:text-white ${isMobile ? 'text-xl' : 'text-title-md2'}`}
                  >
                    Students:
                  </h3>
                  <div className="flex flex-row items-center space-x-2">
                    <ProgramFilter
                      programs={programs}
                      onFilterChange={handleProgramFilterChange}
                    />
                    <div className="relative">
                      <SearchIcon
                        className={`absolute  top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'left-1.5' : 'left-3'}`}
                      />
                      <input
                        type="text"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`border rounded-md text-sm ${isMobile ? 'p-1 pl-7' : 'p-2 pl-10'}`}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenCreateStudentModal(true)}
                    className={`rounded-md bg-graydark px-3 py-2.5  font-medium text-white hover:bg-opacity-90 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    Add Student
                  </button>
                </div>
              )}

              <InstituteStudents
                students={students}
                setSelectedStudent={(student) => {
                  setSelectedStudent(student);
                  setIsModalOpen(true);
                }}
                onSortByApplications={handleSortByApplications}
              />
              <StudentProfileModal
                open={isModalOpen}
                setOpen={setIsModalOpen}
                selectedStudent={selectedStudent}
                applicationData={selectedStudent?.jobApplications}
              />
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default SchoolStudents;
