import React from 'react';
import { Modal, Tooltip, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import { extractDateTimeFromTimestamp } from '../../utils/functions';

interface ViewAnnouncementProps {
  open: boolean;
  onClose: () => void;
  announcement: any;
}

const ViewAnnouncement: React.FC<ViewAnnouncementProps> = ({
  open,
  onClose,
  announcement,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
          <div className="flex-grow text-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white">
              View Announcement
            </h4>
          </div>

          <Tooltip title="Close" placement="top">
            <IconButton onClick={onClose}>
              <X />
            </IconButton>
          </Tooltip>
        </div>

        {/* Modal Content */}
        <div className="mt-6 space-y-4">
          <div>
            <h5 className="text-lg font-medium text-black">Title:</h5>
            <p className="text-gray-600">{announcement?.title}</p>
          </div>

          <div>
            <h5 className="text-lg font-medium text-black">Type:</h5>
            <p className="text-gray-600">
              {announcement?.type === 'EmailAndNotification'
                ? 'Email & Notification'
                : announcement?.type}
            </p>
          </div>

          <div>
            <h5 className="text-lg font-medium text-black">Date Created:</h5>
            <p className="text-gray-600">
              {extractDateTimeFromTimestamp(announcement?.dateCreated)?.date}
            </p>
          </div>

          <div>
            <h5 className="text-lg font-medium text-black">Description:</h5>
            <p className="text-gray-600 whitespace-pre-wrap break-words">
              {announcement?.description}
            </p>
          </div>

          <div>
            <h5 className="text-lg font-medium text-black">Emails:</h5>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {announcement?.toEmails?.map((email, index) => (
                <li key={index} className="break-words">
                  {email}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewAnnouncement;
