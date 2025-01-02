import React from 'react';
import { Modal, Tooltip, IconButton } from '@mui/material';
import { X } from 'lucide-react';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: any;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  formData,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full overflow-auto">
        <div className="flex items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
          <div className="flex-grow text-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white">
              Message Preview
            </h4>
          </div>

          <Tooltip title="Close" placement="top">
            <IconButton onClick={onClose}>
              <X />
            </IconButton>
          </Tooltip>
        </div>

        <div className="mt-4">
          <p>
            <strong>Type:</strong> {formData.type}
          </p>
          <p>
            <strong>Message To:</strong> {formData.to}
          </p>
          <p>
            <strong>Subject:</strong> {formData.title}
          </p>
          <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
            <strong>Description:</strong>
            <p>{formData.description}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PreviewModal;
