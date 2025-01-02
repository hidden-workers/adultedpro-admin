import { useState, useEffect } from 'react';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { User } from '../../interfaces';
import CLoader from '../../common/CLoader';
import { Program } from '../../interfaces/index';
import parseDate from '../../utils/datetime';
import { Tooltip } from '@mui/material';
import dayjs from 'dayjs';

const SchoolStudents = ({ isLoading }: { isLoading: boolean }) => {
  //////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////
  const { dashboardStudents: fetchedStudents } = useSelector(
    (state: RootState) => state.user,
  );

  //////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////
  const [students, setStudents] = useState<User[]>([]);

  //////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////
  useEffect(() => {
    const sortedStudents = [...fetchedStudents].sort((a, b) => {
      const dateA = parseDate(a.dateCreated);
      const dateB = parseDate(b.dateCreated);
      return dateB.getTime() - dateA.getTime();
    });
    setStudents(sortedStudents);
  }, [fetchedStudents]);
  const formatDate = (dateInput: any) => {
    const parsedDate = parseDate(dateInput);
    return dayjs(parsedDate).format('MM-DD-YYYY');
  };
  //////////////////////////////////////////////////// RENDERS /////////////////////////////////////////////////////////
  return (
    <div className="min-h-[14rem] relative h-full overflow-y-auto rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-5.5 xl:pb-1">
      <div className="mb-3 flex items-center ">
        <h4 className="flex items-center gap-2 text-xl mb-2 font-semibold text-black dark:text-white">
          Students
        </h4>
        <Tooltip
          placement="top"
          title="In this tab, you can view information about the school's active students, the programs they are registered in, and their last activity status on the mobile application."
        >
          <p className="ml-2 cursor-pointer border border-black text-black font-bold rounded-full w-4 h-4 flex items-center justify-center text-xs">
            i
          </p>
        </Tooltip>
      </div>

      <div className="flex h-fit flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-base font-medium xsm:text-base">Name</h5>
          </div>

          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-base font-medium xsm:text-base">Program</h5>
          </div>

          <div className=" p-2.5 text-center sm:block xl:p-5">
            <h5 className="truncate text-base font-medium xsm:text-base">
              Activity
            </h5>
          </div>
        </div>

        {isLoading ? (
          <div className="flex mt-4">
            <CLoader size="lg" />
          </div>
        ) : (
          students.length === 0 && (
            <div className="flex h-full w-full items-center justify-center py-16 absolute top-[70%] left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <span className="text-center text-xl">No Students Fetched</span>
            </div>
          )
        )}

        {students.slice(0, 6).map((student, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-3 ${
              key === students.length - 1
                ? ''
                : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={student.id}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="text-sm text-black dark:text-white sm:block truncate">
                {student.name ? student.name : student.email}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="truncate text-sm text-meta-3">
                {typeof student.program === 'object' && student.program !== null
                  ? (student.program as Program).name
                  : String(student.program)}
              </p>
            </div>
            <div className="items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black text-sm dark:text-white text-center">
                {student?.lastActivity
                  ? formatDate(student?.lastActivity)
                  : 'Not Signedin'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolStudents;
