import { useState } from 'react';
import { Modal, Tooltip, IconButton } from '@mui/material';
import { X, Calendar, Eye } from 'lucide-react';
import { parseDate } from '../../utils/datetime';
import ViewEventModal from '../../components/Modals/ViewEventModal';
import { useStateContext } from '../../context/useStateContext';
import { Event } from '../../interfaces';
import { format } from 'date-fns';

const CalendarShowMoreModal = ({ isOpen, onClose, events }) => {
  if (!isOpen) return null;
  const { setShowEventViewModal } = useStateContext();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showProposeDateForm, setShowProposeDateForm] = useState(false);
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center p-4 bg-black/90"
    >
      <div className="relative bg-white p-6 rounded-md shadow-md w-full max-w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 bg-[#F9FAFB] rounded-md px-4 py-3">
          <div className="flex-grow flex justify-center">
            <div className="text-2xl font-semibold text-black text-center dark:text-white">
              {' '}
              Events{' '}
            </div>
          </div>
          <Tooltip title="Close" placement="top">
            <IconButton onClick={onClose}>
              <X />
            </IconButton>
          </Tooltip>
        </div>

        <div className="space-y-2 bg-[#F9FAFB] w-full rounded-md px-4 py-3 border border-gray dark:border-gray-700">
          {events.length > 0 ? (
            <ul className="divide-y divide-gray/100">
              {events.map((event, index) => (
                <li
                  key={index}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <div className="font-semibold text-md text-black">
                      {event.title}
                    </div>
                    <div className="flex text-gray-600">
                      <Calendar size={22} className="px-1" />
                      {format(event.eventFrom, 'dd-mm-yyyy')} -{' '}
                      {format(event.eventTo, 'dd-mm-yyyy')}
                    </div>
                  </div>
                  <Tooltip title="View Event" placement="top">
                    <IconButton
                      onClick={() => {
                        setShowEventViewModal(true);
                        setSelectedEvent(event);
                        setShowProposeDateForm(false);
                      }}
                    >
                      <Eye className="text-gray-icon" />
                    </IconButton>
                  </Tooltip>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No events for this day.</div>
          )}
        </div>

        {selectedEvent && (
          <ViewEventModal
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            showProposeDateForm={showProposeDateForm}
            setShowProposeDateForm={setShowProposeDateForm}
          />
        )}
      </div>
    </Modal>
  );
};

export default CalendarShowMoreModal;
