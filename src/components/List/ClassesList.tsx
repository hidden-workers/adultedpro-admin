import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Class, UnassignedStudent } from '../../interfaces';
import { CircularProgress } from '@mui/material';

interface Props {
  setSelectedClass: (selectedClass: Class | UnassignedStudent) => void;
  selectedClass: Class | UnassignedStudent;
}

const ClassesList: React.FC<Props> = React.memo(
  ({ selectedClass, setSelectedClass }) => {
    const { allClasses: classes } = useSelector(
      (state: RootState) => state.class,
    );
    const { unassignedClass } = useSelector((state: RootState) => ({
      unassignedClass: state.class.unassignedClass,
      isLoading: state.class.isLoading,
    }));
    return (
      <div className="min-w-[270px] min-h-[10rem] max-w-max rounded-md border border-stroke py-1 dark:border-strokedark">
        <ul className="flex flex-col">
          <div
            key={unassignedClass.id}
            className={`${selectedClass?.id === unassignedClass?.id ? 'bg-white' : ''} hover:bg-white cursor-pointer flex items-center gap-2.5 border-b border-stroke px-5 py-3 last:border-b-0 dark:border-strokedark`}
            onClick={() => setSelectedClass(unassignedClass)}
          >
            <span className="max-w-6.5 flex h-6.5 w-full items-center justify-center rounded-full bg-[#1C2434] text-white"></span>
            <span className="font-bold text-sm text-black">
              Unassigned Students
            </span>
          </div>
          {classes?.length === 0 && (
            <div className="flex h-[17rem] w-full items-center justify-center">
              <CircularProgress />
            </div>
          )}
          {classes.map((c, index) => (
            <li
              onClick={() => setSelectedClass(c)}
              key={index}
              className={`${selectedClass?.id === c?.id ? 'bg-white' : ''} hover:bg-white cursor-pointer flex items-center gap-2.5 border-b border-stroke px-5 py-3 last:border-b-0 dark:border-strokedark`}
            >
              <span className="max-w-6.5 flex h-6.5 w-full items-center justify-center rounded-full bg-[#1C2434] text-white">
                {index + 1}
              </span>
              <span className="text-sm">{c.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
ClassesList.displayName = 'ClassesList';
export default ClassesList;
