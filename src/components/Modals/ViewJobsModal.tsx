import React from 'react';
import { Modal, Tooltip, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

interface ViewJobsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  jobs: any[];
}

const ViewJobsModal: React.FC<ViewJobsModalProps> = ({
  open,
  setOpen,
  jobs,
}) => {
  const handleClose = () => {
    setOpen(false);
  };

  const formatDate = (timestamp: number) => {
    return dayjs(timestamp).format('MM-DD-YYYY');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5 overflow-auto"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[1000px] rounded-lg bg-white px-6 py-4 text-left dark:bg-boxdark md:px-8 md:py-8 overflow-auto">
        <div className="flex items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
          <div className="flex-grow flex justify-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              Jobs List
            </h4>
          </div>
          <div className="flex items-center gap-4.5">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={handleClose}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="mt-4 w-full rounded-md px-4 py-3 border border-gray dark:border-gray-700">
          {jobs?.length > 0 ? (
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th
                    className="border-b px-4 py-2 text-left font-semibold text-gray-600 dark:text-white"
                    colSpan={2}
                  >
                    Title
                  </th>
                  <th className="border-b px-4 py-2 text-left font-semibold text-gray-600 dark:text-white">
                    Active
                  </th>
                  <th className="border-b px-4 py-2 text-left font-semibold text-gray-600 dark:text-white">
                    Date Created
                  </th>
                  <th className="border-b px-4 py-2 text-left font-semibold text-gray-600 dark:text-white">
                    Date Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs?.map((job, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-slate-50 dark:bg-gray-900'
                    }
                  >
                    <td
                      className="border-b border-gray px-4 py-2 text-gray-800 dark:text-gray-300"
                      colSpan={2}
                    >
                      {job?.title || 'N/A'}
                    </td>
                    <td className="border-b border-gray px-4 py-2 text-gray-800 dark:text-gray-300">
                      {job?.is_active ? 'Yes' : 'No'}
                    </td>
                    <td className="border-b border-gray px-4 py-2 text-gray-800 dark:text-gray-300">
                      {formatDate(job?.createdAt)}
                    </td>
                    <td className="border-b border-gray px-4 py-2 text-gray-800 dark:text-gray-300">
                      {formatDate(job?.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-800 dark:text-gray-300">
              No jobs available for this program.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewJobsModal;
