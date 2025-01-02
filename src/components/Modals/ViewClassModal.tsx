import { X } from 'lucide-react';
import { Tooltip, IconButton, Modal } from '@mui/material';
import { Program, User } from '../../interfaces';
import { maskEmail } from '../../utils/functions';

const ViewClassModal = ({
  open,
  setOpen,
  selectedClass,
  studentsInProgram,
}: {
  open: boolean;
  setOpen: any;
  selectedClass: Program;
  studentsInProgram: User[];
}) => {
  /////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////

  /////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////

  /////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
  const onCloseModal = () => {
    setOpen(false);
  };

  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[50vh] w-full max-w-[700px] md:px-8 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 ">
          <div className="w-fit flex justify-start items-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2 ">
              View Program
            </h4>
          </div>
          <div className="flex justify-end items-center gap-4.5 w-fit ">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={() => setOpen(false)}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 ">
          <h2 className="font-medium text-black flex gap-4 ">
            <span className="">Program Name:</span>
            <span className="text-body ">{selectedClass?.name}</span>
          </h2>
          <h2 className="font-medium text-black text-left">
            <span className="py-2 text-left">Students:</span>
            {studentsInProgram.length > 0 ? (
              <ul className="list-disc pl-6 text-gray-600 text-body">
                {studentsInProgram.map((s, index) => (
                  <li key={index} className="py-2 text-left">
                    {s?.name ? s?.name : maskEmail(s?.email)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body px-5 py-2">No Students Registered</p>
            )}
          </h2>
        </div>
      </div>
    </Modal>
  );
};

export default ViewClassModal;
