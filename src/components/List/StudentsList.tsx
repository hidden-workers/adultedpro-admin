import React from 'react';
import { User } from '../../interfaces';

interface Props {
  setSelectedStudent: any;
  selectedStudent: User;
  students: User[];
}

const StudentsList: React.FC<Props> = ({
  selectedStudent,
  setSelectedStudent,
  students,
}) => {
  // Currently its been using nowhere
  //////////////////////////////////////////////////// RENDER //////////////////////////////////////////////////////
  return (
    <div className="min-w-[270px] min-h-[10rem] max-w-max rounded-md border border-stroke py-1 dark:border-strokedark">
      <ul className="flex flex-col">
        {students?.length == 0 && (
          <div className="w-full h-full flex justify-center items-center">
            No Students Found.
          </div>
        )}
        {students.map((c, index) => (
          <li
            onClick={() => setSelectedStudent(c)}
            key={index}
            className={`${selectedStudent?.id == c?.id ? 'bg-white' : ''} hover:bg-white cursor-pointer flex items-center gap-2.5 border-b border-stroke px-5 py-3 last:border-b-0 dark:border-strokedark`}
          >
            <span className="max-w-6.5 flex h-6.5 w-full items-center justify-center rounded-full bg-primary text-white">
              {index + 1}
            </span>
            <span> {c.name} </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentsList;
