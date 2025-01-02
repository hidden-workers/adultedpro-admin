import React from 'react';
import { Modal, Tooltip, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import { EventFile } from '../../interfaces';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  bulkevent: EventFile | null;
}

const EventModal: React.FC<EventModalProps> = ({
  open,
  onClose,
  bulkevent,
}) => {
  if (!bulkevent) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[1000px] rounded-lg bg-white px-6 py-4 text-left dark:bg-boxdark md:px-8 md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
          <div className="w-fit flex justify-start items-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              Class Details
            </h4>
          </div>
          <div className="flex justify-end items-center gap-4.5 w-fit">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={onClose}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-2 bg-[#F9FAFB] w-full rounded-md px-4 py-3 border border-gray dark:border-gray-700">
          {[
            { label: 'Title', value: bulkevent.program },
            { label: 'Event Type', value: bulkevent.eventType },
            { label: 'Class', value: bulkevent.class },
            {
              label: 'Days',
              value: bulkevent.days || 'N/A',
            },
            { label: 'Start Time', value: bulkevent.startTime },
            { label: 'End Time', value: bulkevent.endTime },
            { label: 'Start Date', value: bulkevent.startDate },
            { label: 'End Date', value: bulkevent.endDate },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-left border-b ${
                index === 8 ? '' : 'border-gray'
              } p-4 last:border-b-0`}
            >
              <p className="font-semibold text-gray-600">{item.label}:</p>
              <p className="ml-4 text-gray-800">{item.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
