import { useState } from 'react';
import { updateEvent } from '../../store/reducers/eventSlice.ts';
import { EmailData, Event } from '../../interfaces';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, IconButton, Modal } from '@mui/material';
import toast from 'react-hot-toast';
import { EventStatus } from '../../utils/enums.ts';
import { RootState } from '../../store/store.ts';
import { useStateContext } from '../../context/useStateContext.tsx';
import { sendEmail } from '../../store/reducers/emailSlice.ts';

const NoteFromInstitution = ({
  open,
  setOpen,
  selectedEvent,
  status,
  setFilteredEvents,
}: {
  open: boolean;
  setOpen: any;
  selectedEvent: Event;
  status: EventStatus;
  setFilteredEvents: any;
}) => {
  /////////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { employer } = useSelector((state: RootState) => state.employer);
  const { partner } = useSelector((state: RootState) => state.partner);
  const { page } = useStateContext();
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  const mongoUserId = localStorage.getItem('mongoUserId');
  /////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<any>('');

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////
  const onChange = (e) => {
    setNote(e.target.value);
  };
  const onSubmit = async (e) => {
    e.preventDefault();

    if (status == EventStatus.Cancelled && !note)
      return toast.error('Note is required.');

    setLoading(true);
    const updatedEvent = {
      ...selectedEvent,
      noteFromInstitution: note,
      status,
    };
    dispatch<any>(
      updateEvent({
        eventData: updatedEvent,
        eventId: updatedEvent?.id,
        organizerType: page == 'Employer' ? 'branch' : 'institution',
        organizerId: page == 'Employer' ? mongoUserId : mongoInstituteId,
      }),
    )
      .then(({ payload }) => {
        setFilteredEvents((pre) => ({
          ...pre,
          scheduled:
            status == EventStatus.Scheduled
              ? [payload, ...pre.scheduled]
              : pre.scheduled,
          requestedByEmployers: pre.requestedByEmployers.filter(
            (e) => e?.id != payload?.id,
          ),
        }));

        // Inform the creater of event about event acceptance or rejection
        const emailForCreater: EmailData = {
          to: page == 'Employer' ? employer?.email : partner?.email,
          isTest: false,
          template: {
            name:
              status == EventStatus.Scheduled
                ? 'event-accepted'
                : 'event-rejected', // TODO: create template
            data: {
              ...payload,
              eventDate: payload?.eventDate?.seconds
                ? payload?.eventDate?.toDate()
                : new Date(payload?.eventDate),
              eventFrom: payload?.eventFrom?.seconds
                ? payload?.eventFrom?.toDate()
                : new Date(payload?.eventFrom),
              eventTo: payload?.eventTo?.seconds
                ? payload?.eventTo?.toDate()
                : new Date(payload?.eventTo),
              dateCreated: payload?.dateCreated?.seconds
                ? payload?.dateCreated?.toDate()
                : new Date(payload?.dateCreated),
              dateUpdated: payload?.dateUpdated?.seconds
                ? payload?.dateUpdated?.toDate()
                : new Date(payload?.dateUpdated),
            },
          },
          dateCreated: new Date(),
          dateUpdated: new Date(),
        };
        dispatch<any>(sendEmail(emailForCreater));
      })
      .finally(() => {
        setLoading(false);
        setOpen(false);
      });
  };
  const onClose = () => {
    setOpen(false);
    setNote('');
  };

  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="h-fit w-full max-w-[500px] md:px-8 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 ">
          <div className="w-fit flex justify-start items-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2 ">
              Your note
            </h4>
          </div>
          <div className="flex justify-end items-center gap-4.5 w-fit ">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={() => onClose()}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col items-center w-full">
          <p className="text-black ">
            {status == EventStatus.Cancelled
              ? 'Please tell us why are you rejecting this event?'
              : 'You can add an accept note here.'}
          </p>

          {/* Note */}
          <div className="mb-5.5 flex flex-col gap-1 w-full mt-4">
            <label
              className="text-start mb-3 block text-sm font-medium text-black dark:text-white w-max"
              htmlFor="note"
            >
              Note <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="note"
                value={note}
                onChange={onChange}
                id="note"
                placeholder="Enter your note here..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4.5 w-full">
            <button
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="flex justify-center rounded bg-primary disabled:bg-primary/50 py-2 px-6 font-medium text-gray hover:bg-opacity-90"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NoteFromInstitution;
