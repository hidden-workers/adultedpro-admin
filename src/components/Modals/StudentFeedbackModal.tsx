import React from 'react';
import { Modal, Tooltip, IconButton } from '@mui/material';
import { JoinedCompany } from '../../interfaces';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  companyDetails: JoinedCompany | null;
}

const StudentFeedback: React.FC<Props> = ({
  open,
  onClose,
  companyDetails,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/70"
    >
      <div className="max-h-[90vh] w-full max-w-[700px] p-6 rounded-lg bg-white shadow-lg overflow-auto">
        {companyDetails ? (
          <>
            <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md mb-4 px-4 py-3">
              <div className="flex-grow flex justify-center items-center">
                <h4 className="text-2xl font-semibold text-black text-center dark:text-white">
                  Feedback Details
                </h4>
              </div>
              <div className="flex justify-end items-center gap-4.5">
                <Tooltip title="Close" placement="top">
                  <IconButton onClick={onClose}>
                    <X />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-gray rounded-md p-3 bg-gray-50">
                <div>
                  <strong>Employer Name:</strong> {companyDetails.employerName}
                </div>
              </div>

              <div className="border border-gray rounded-md p-3 bg-gray-50">
                <div>
                  <strong>Position Hired:</strong>{' '}
                  {companyDetails.positionHired}
                </div>
              </div>

              <div className="border border-gray rounded-md p-3 bg-gray-50">
                <div>
                  <strong>Pay:</strong> {companyDetails.pay}
                </div>
              </div>

              <div className="border border-gray rounded-md p-3 bg-gray-50">
                <div>
                  <strong>Date of Hire:</strong> {companyDetails.dateOfHire}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600">No Feedback Provided.</div>
        )}
      </div>
    </Modal>
  );
};

export default StudentFeedback;
