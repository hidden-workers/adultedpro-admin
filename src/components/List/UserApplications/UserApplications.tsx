import { useStateContext } from '../../../context/useStateContext';
import { Partner, User, UserApplication } from '../../../interfaces';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Search } from 'lucide-react';

import { fetchEmployerById } from '../../../store/reducers/employersSlice';
import { Tooltip } from '@mui/material';
import { UserApplicationStatus } from '../../../utils/enums';
import { CandidateItem } from './component/CandidateItem';
import { selectPrograms } from '../../../store/reducers/programSlice';

interface Props {
  userApplications: UserApplication[];
  students: (User & { status: string })[];
  setStudents: any;
  setUserApplications: any;
  setVisitedCandidates: any;
  visitedCandidates: { students: User[]; applicants: UserApplication[] };
}

const UserApplications = ({
  students,
  setStudents,
  userApplications,
  setUserApplications,
  visitedCandidates,
  setVisitedCandidates,
}: Props) => {
  ////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { selectedCandidatesFilter } = useStateContext();
  const { userApplications: fetchedUserApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const { allStudents: fetchedAllStudents } = useSelector(
    (state: RootState) => state.user,
  );
  const { employer } = useSelector((state: RootState) => state.employer);
  const { partners: fetchedPartners } = useSelector(
    (state: RootState) => state.partner,
  );
  const fetchedPrograms = useSelector((state: RootState) =>
    selectPrograms(state),
  );
  // TODO: check whether selectedCandidate got updated when its been rejected from chat
  ////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////
  const [type, setType] = useState<'Students' | 'UserApplications'>('Students');
  const [searchQuery, setSearchQuery] = useState('');
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [program, setProgram] = useState('');
  const [school, setSchool] = useState('');
  const [category, setCategory] = useState<
    ('All' | 'Bookmarked' | 'Reviewed')[]
  >(['All']);

  const employerId =
    fetchedUserApplications && fetchedUserApplications.length > 0
      ? fetchedUserApplications[0].employerId
      : '';
  ////////////////////////////////////////////////// USE EFFECTS ////////////////////////////////////////////////
  useEffect(() => {
    if (selectedCandidatesFilter == 'all') {
      setType('Students');
    } else {
      setType('UserApplications');
    }
    setCategory(['All']);
  }, [selectedCandidatesFilter]);
  useEffect(() => {
    let allPrograms = [];
    if (fetchedUserApplications?.length || fetchedAllStudents?.length) {
      // Extract unique program IDs
      const programIds = [
        ...new Set([
          ...fetchedUserApplications
            .map((application) => application?.applicant?.programDetails.id)
            .filter((program) => typeof program === 'string'),
          ...fetchedAllStudents
            .map((student) => student?.program_id)
            .filter((program) => typeof program === 'string'),
        ]),
      ];

      // Map program IDs to both IDs and names
      allPrograms = programIds
        ?.map((id) => {
          const program = fetchedPrograms?.find(
            (program) => program?.id === id,
          );
          return program ? { id: program?.id, name: program?.name } : null;
        })
        ?.filter((program) => program !== null) // Remove null values
        ?.sort((a, b) => a?.name?.localeCompare(b?.name)); // Sort by program name

      setPrograms(allPrograms);
    }
  }, [fetchedUserApplications, fetchedAllStudents, fetchedPrograms]);

  useEffect(() => {
    if (!employer && employerId != '') {
      dispatch<any>(fetchEmployerById(employerId));
    }
  }, [employer, employerId]);
  useEffect(() => {
    setSchools(
      [...fetchedPartners].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }, [fetchedPartners]);

  ////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////
  const filterApplicationsByStatus = (status) => {
    return fetchedUserApplications?.filter(
      (u) => u?.status.toLowerCase() == status?.toLowerCase(),
    );
  };
  const onSearch = () => {
    setSchool('');
    // setProgram('');
    setCategory(['All']);

    if (type === 'Students') {
      setStudents((prev) => ({
        ...prev,
        all: searchQuery
          ? fetchedAllStudents?.filter((student) => {
              const programName =
                typeof student?.program === 'string'
                  ? student.program.toLowerCase()
                  : typeof student?.program === 'object' &&
                      student.program !== null &&
                      'name' in student.program &&
                      typeof student.program.name === 'string'
                    ? student.program.name.toLowerCase()
                    : '';

              return (
                programName?.includes(searchQuery?.toLowerCase()) ||
                (student?.name &&
                  student?.name
                    ?.toLowerCase()
                    ?.includes(searchQuery?.toLowerCase()))
              );
            })
          : fetchedAllStudents,
      }));
    } else {
      const applicationsToSearch = filterApplicationsByStatus(
        selectedCandidatesFilter,
      );

      setUserApplications((pre) => ({
        ...pre,
        [selectedCandidatesFilter]: searchQuery
          ? applicationsToSearch?.filter((userApplication) => {
              const applicantProgram =
                userApplication?.applicant?.program || '';
              const applicantName = userApplication?.applicant?.name || '';

              return (
                applicantProgram
                  ?.toLowerCase()
                  ?.includes(searchQuery?.toLowerCase()) ||
                applicantName
                  ?.toLowerCase()
                  ?.includes(searchQuery?.toLowerCase())
              );
            })
          : applicationsToSearch,
      }));
    }
  };
  const onProgramFilter = (programId: string) => {
    setSearchQuery('');
    if (selectedCandidatesFilter === 'all') {
      setStudents((prev) => ({
        ...prev,
        all:
          programId && programId !== 'all'
            ? fetchedAllStudents?.filter(
                (student) => student?.program_id === programId,
              )
            : fetchedAllStudents,
      }));
    } else {
      const applicationsToSearch = filterApplicationsByStatus(
        selectedCandidatesFilter,
      );
      setUserApplications((pre) => ({
        ...pre,
        [selectedCandidatesFilter]:
          programId && programId !== 'all'
            ? applicationsToSearch?.filter((userApplication) => {
                const applicant = userApplication?.applicant;
                return applicant?.programDetails?.id === programId;
              })
            : fetchedUserApplications,
      }));
    }
  };

  const onSchoolFilter = (school: string) => {
    setSearchQuery('');
    setCategory(['All']);
    if (selectedCandidatesFilter === 'all') {
      setStudents((pre) => ({
        ...pre,
        all:
          school && school !== 'all'
            ? fetchedAllStudents?.filter(
                (student) =>
                  student?.partnerId?.toLowerCase() === school.toLowerCase(),
              )
            : fetchedAllStudents,
      }));
    } else {
      const applicationsToSearch = filterApplicationsByStatus(
        selectedCandidatesFilter,
      );
      setUserApplications((pre) => ({
        ...pre,
        [selectedCandidatesFilter]:
          school && school !== 'all'
            ? applicationsToSearch?.filter(
                (userApplication) =>
                  userApplication?.applicant?.partnerId?.toLowerCase() ===
                  school?.toLowerCase(),
              )
            : fetchedUserApplications,
      }));
    }
  };
  const onCategoryFilter = (
    category: ('All' | 'Bookmarked' | 'Reviewed')[],
  ) => {
    setSearchQuery('');
    setSchool('');
    // setProgram('');
    if (type === 'Students') {
      const filteredStudents = {
        All:
          category?.includes('All') || category?.length == 0
            ? fetchedAllStudents
            : [],
        Reviewed:
          category?.includes('Reviewed') && !category?.includes('Bookmarked')
            ? fetchedAllStudents?.filter((student) =>
                employer?.reviewedStudents?.includes(student?.id),
              )
            : [],
        Bookmarked:
          !category?.includes('Reviewed') && category?.includes('Bookmarked')
            ? fetchedAllStudents?.filter((student) =>
                employer?.bookmarkedStudents?.includes(student?.id),
              )
            : [],
        Both:
          category?.includes('Reviewed') && category?.includes('Bookmarked')
            ? fetchedAllStudents?.filter(
                (student) =>
                  employer?.bookmarkedStudents?.includes(student?.id) &&
                  employer?.reviewedStudents?.includes(student?.id),
              )
            : [],
      };

      const uniqueStudents = [
        ...new Set([
          ...filteredStudents.All,
          ...filteredStudents.Reviewed,
          ...filteredStudents.Bookmarked,
          ...filteredStudents.Both,
        ]),
      ];

      setStudents((pre) => ({ ...pre, all: uniqueStudents }));
    } else {
      const all = fetchedUserApplications;
      const applied = fetchedUserApplications?.filter(
        (item: any) =>
          item?.status?.toLowerCase() != UserApplicationStatus.Rejected &&
          item?.status?.toLowerCase() != UserApplicationStatus.Skipped,
      );
      const rejected = filterApplicationByStatus(
        UserApplicationStatus.Disqualified,
      );
      const hired = filterApplicationByStatus(UserApplicationStatus.Hired);
      const applications = { all, applied, rejected, hired };

      const filteredApplications = {
        All:
          category.includes('All') || category.length == 0
            ? applications[selectedCandidatesFilter]
            : [],
        Reviewed:
          category.includes('Reviewed') && !category.includes('Bookmarked')
            ? applications[selectedCandidatesFilter]?.filter((application) =>
                employer?.reviewedUserApplications?.includes(application?.id),
              )
            : [],
        Bookmarked:
          !category.includes('Reviewed') && category.includes('Bookmarked')
            ? applications[selectedCandidatesFilter]?.filter((application) =>
                employer?.bookmarkedUserApplications?.includes(application?.id),
              )
            : [],
        Both:
          category.includes('Reviewed') && category.includes('Bookmarked')
            ? applications[selectedCandidatesFilter]?.filter(
                (application) =>
                  employer?.bookmarkedUserApplications?.includes(
                    application?.id,
                  ) &&
                  employer?.reviewedUserApplications?.includes(application?.id),
              )
            : [],
      };

      const uniqueApplications = [
        ...new Set([
          ...filteredApplications.All,
          ...filteredApplications.Reviewed,
          ...filteredApplications.Bookmarked,
          ...filteredApplications.Both,
        ]),
      ];
      setUserApplications((pre) => ({
        ...pre,
        [selectedCandidatesFilter]: uniqueApplications,
      }));
    }
  };

  const onCategoryChange = (value: 'All' | 'Bookmarked' | 'Reviewed') => {
    const updated = category.includes(value)
      ? category.filter((p) => p != value)
      : value != 'All'
        ? [...category.filter((p) => p != 'All'), value]
        : [value];
    setCategory(updated.length == 0 ? ['All'] : updated);
    onCategoryFilter(updated);
  };

  const filterApplicationByStatus = (status) => {
    return fetchedUserApplications?.filter(
      (u) => u?.status?.toLowerCase() == status?.toLowerCase(),
    );
  };

  ////////////////////////////////////////////////// COMPONENTS //////////////////////////////////////////////////

  ////////////////////////////////////////////////// RENDER //////////////////////////////////////////////////
  return (
    <div className="h-[90vh] w-full overflow-y-auto overflow-x-hidden rounded-md border border-stroke py-2.5 dark:border-strokedark">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="sticky mb-7 flex flex-col gap-2 px-4 "
      >
        <Tooltip
          placement="top-start"
          title={`Search for a specific ${type == 'Students' ? `student` : 'application'} or their tagline for a specific keyword`}
        >
          <div className="relative">
            <input
              type="text"
              className="w-full rounded border border-stroke bg-gray py-2.5 pl-5 pr-10 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2"
              placeholder={
                type == 'Students'
                  ? `Search for student...`
                  : 'Search for application...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={onSearch} // Call handleSearch on keyUp to update filteredUsers in real-time
            />
            <button
              type="button"
              title="Search"
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <Search />
            </button>
          </div>
        </Tooltip>
        <div className={`flex justify-start items-center gap-4 min-h-[40px] `}>
          <label
            key="all"
            className="cursor-pointer text-lg flex gap-1 text-black dark:text-white"
          >
            <input
              type="checkbox"
              name="recommend"
              checked={category.includes('All')}
              onChange={() => onCategoryChange('All')}
            />
            All
          </label>
          <label
            key="reviewed"
            className="cursor-pointer text-lg flex gap-1 text-black dark:text-white"
          >
            <input
              type="checkbox"
              name="recommend"
              checked={category.includes('Reviewed')}
              onChange={() => onCategoryChange('Reviewed')}
            />
            Reviewed
          </label>
          <label
            key="bookmarked"
            className="cursor-pointer text-lg flex gap-1 text-black dark:text-white"
          >
            <input
              type="checkbox"
              name="recommend"
              checked={category.includes('Bookmarked')}
              onChange={() => onCategoryChange('Bookmarked')}
            />
            Bookmarked
          </label>
        </div>
        {/* Program Filter */}
        <select
          className="w-full rounded border border-stroke bg-gray px-2 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          name="program"
          onChange={(e) => {
            const selectedProgramId = e.target.value; // Pass the program ID
            onProgramFilter(selectedProgramId);
            setProgram(selectedProgramId); // Update the selected program ID
          }}
          id="program"
          value={program || 'all'} // Keep the selected program ID as the value
          title="Select Program"
        >
          {programs?.length === 0 ? (
            <option value="">No Program</option>
          ) : (
            <option value="all">Select Program</option>
          )}
          {programs?.map((p, index) => (
            <option value={p.id} key={index}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded border border-stroke bg-gray px-2 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          name="school"
          onChange={(e) => {
            onSchoolFilter(e.target.value);
            setSchool(e.target.value);
          }}
          id="school"
          value={school}
          title="Select School"
        >
          {schools.length == 0 ? (
            <option value="">No School</option>
          ) : (
            <option value="all">Select School</option>
          )}
          {schools?.map((p: Partner, index: number) => (
            <option value={p?.id} key={index}>
              {p?.name}
            </option>
          ))}
        </select>
      </form>

      <div className="flex flex-col gap-1 p-2 ">
        {(type === 'Students' ? students : userApplications)?.filter(
          (item: (User & { status: string }) | UserApplication) =>
            (item as User)?.name ||
            (item as UserApplication)?.applicant?.name ||
            (item as UserApplication)?.applicantEmail ||
            (item as UserApplication)?.applicant?.email,
        )?.length == 0 ? (
          <div className="flex items-center justify-center rounded-md p-1 text-center ">
            {selectedCandidatesFilter === 'all'
              ? searchQuery.length > 0
                ? 'No students match your search criteria.'
                : 'No students to display.'
              : searchQuery.length > 0
                ? 'No candidates match your search criteria.'
                : 'No candidates have applied to any of your jobs yet.'}
          </div>
        ) : (
          (type == 'Students' ? students : userApplications)?.map(
            (
              item: (User & { status: string }) | UserApplication,
              index: number,
            ) => (
              <>
                {
                  // display only users that have set their names, because no employer will contact a candidate that hasn't even set the name yet
                  ((item as User)?.name ||
                    (item as UserApplication)?.applicant?.name ||
                    (item as UserApplication)?.applicant?.email ||
                    (item as UserApplication)?.applicantEmail) && (
                    <CandidateItem
                      visitedCandidates={visitedCandidates}
                      setVisitedCandidates={setVisitedCandidates}
                      key={index}
                      item={item}
                      type={
                        type == 'Students' ? 'Students' : 'UserApplications'
                      }
                    />
                  )
                }
              </>
            ),
          )
        )}
      </div>
    </div>
  );
};

export default UserApplications;
