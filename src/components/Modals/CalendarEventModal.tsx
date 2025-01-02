import { Modal, Tooltip, IconButton, Typography } from '@mui/material';
import { X, Eye, Clock } from 'lucide-react';
import { useState } from 'react';
import ViewBulkEventModal from '../../components/Modals/ViewBulkEventModal';
import { EventFile } from '../../interfaces';

const EventModal = ({ isOpen, Close, events }) => {
  const [viewBulkEventOpen, setViewBulkEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventFile | null>(null);

  const handleViewClick = (event: EventFile) => {
    setSelectedEvent(event);
    setViewBulkEventOpen(true);
  };

  const handleViewBulkEventClose = () => {
    setViewBulkEventOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={Close}
        className="flex items-center justify-center p-4 bg-black/90"
      >
        <div className="relative bg-white p-6 rounded-md shadow-md w-full max-w-[800px] max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 bg-[#F9FAFB] rounded-md px-4 py-3">
            <Typography variant="h6" className="text-black">
              All Classes
            </Typography>
            <Tooltip title="Close" placement="top">
              <IconButton onClick={Close}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
          <div className="space-y-2 bg-[#F9FAFB] w-full rounded-md px-4 py-3 border border-gray dark:border-gray-700">
            {events.length === 0 ? (
              <Typography>No events available.</Typography>
            ) : (
              <ul className="divide-y divide-gray/100">
                {events.map((event, index) => (
                  <li
                    key={index}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <Typography
                        variant="subtitle1"
                        className="font-semibold text-gray-800"
                      >
                        {event.program}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="flex text-gray-600"
                      >
                        <Clock size={20} className="px-1" />
                        {event.startTime} - {event.endTime}
                      </Typography>
                    </div>
                    <Tooltip title="View Class" placement="top">
                      <IconButton onClick={() => handleViewClick(event)}>
                        <Eye className="text-gray-icon" />
                      </IconButton>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      {/* ViewBulkEventModal */}
      {selectedEvent && (
        <ViewBulkEventModal
          open={viewBulkEventOpen}
          onClose={handleViewBulkEventClose}
          bulkevent={selectedEvent}
        />
      )}
    </>
  );
};

export default EventModal;
