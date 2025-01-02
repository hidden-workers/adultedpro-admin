import React, { useEffect, useState } from 'react';
import { Event, Employer } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { X } from 'lucide-react';
import { Tooltip, IconButton, Modal } from '@mui/material';
import CardsOne from '../../images/cards/cards-01.png';
import { useDispatch, useSelector } from 'react-redux';
import {
  setEvent,
  fetchEventsParticipants,
} from '../../store/reducers/eventSlice';
import toast from 'react-hot-toast';
import { EventStatus } from '../../utils/enums';
import { RootState } from '../../store/store';
import { fetchEmployerById } from '../../store/reducers/employersSlice';

const ViewEventModal = ({
  selectedEvent,
  setSelectedEvent,
  showProposeDateForm,
  setShowProposeDateForm,
}: {
  selectedEvent: Event;
  setSelectedEvent: any;
  showProposeDateForm: boolean;
  setShowProposeDateForm: any;
}) => {
  /////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const { showEventViewModal, setShowEventViewModal, page } = useStateContext();
  const dispatch = useDispatch();
  const role = String(localStorage.getItem('Role'));
  const { employer } = useSelector((state: RootState) => state.employer);
  const { partner } = useSelector((state: RootState) => state.partner);
  const initialData = {
    eventDate: '',
    eventFrom: '',
    eventTo: '',
    proposedBy: page == 'Employer' ? employer?.name : partner?.name,
    proposerRole: role,
  };
  const { employerParticipants, candidateParticipants, instituteParticipants } =
    useSelector((state: RootState) => state.event);
  /////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////
  const [loading, setLoading] = useState({
    accept: false,
    cancelled: false,
    reschedule: false,
  });
  const [formData, setFormData] = useState<any>(initialData);
  const [employers, setEmployers] = useState([]);
  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(
      fetchEventsParticipants({
        eventId: selectedEvent.id,
        page: 1,
        limit: 1000000,
      }),
    );
  }, [selectedEvent]);

  useEffect(() => {
    const fetchEmployers = async () => {
      if (selectedEvent?.employerIds) {
        try {
          const fetchedEmployers = await Promise.all(
            selectedEvent?.employerIds?.map(async (id) => {
              const response = await dispatch<any>(fetchEmployerById(id));
              return response.payload;
            }),
          );
          setEmployers(fetchedEmployers);
        } catch (error) {
          console.error('Error fetching employers:', error);
        }
      }
    };

    fetchEmployers();
  }, [selectedEvent, dispatch]);
  const employerNames = employers?.map((employer) => employer?.name).join(', ');
  /////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
  const onChange = (e) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onClose = () => {
    setShowProposeDateForm(false);
    setFormData(initialData);
  };
  const validateForm = () => {
    if (!formData.eventDate || !formData.eventFrom || !formData.eventTo) {
      alert('Please fill all required fields');
      return false;
    }
    return true;
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading((pre) => ({ ...pre, reschedule: true }));

    const updatedEvent: Event = {
      ...selectedEvent,
      proposedDates: [...selectedEvent.proposedDates, formData],
      status:
        page == 'Employer' ? EventStatus.Requested : EventStatus.Reschedule,
    };

    dispatch<any>(setEvent(updatedEvent))
      .then(() => {
        setFormData(initialData);
        setShowProposeDateForm(false);
        setSelectedEvent(updatedEvent);
        toast.success('Success.');
      })
      .catch((error) => {
        alert('Something went wrong!');
        console.error('error in create event: ', error);
      })
      .finally(() => {
        setLoading((prevState) => ({ ...prevState, reschedule: false }));
      });
  };
  const onCloseModal = () => {
    setShowEventViewModal(false);
  };
  const onAccept = () => {
    setLoading((pre) => ({ ...pre, accept: true }));
    dispatch<any>(
      setEvent({
        ...selectedEvent,
        status: EventStatus.Scheduled,
        eventDate:
          selectedEvent.proposedDates[selectedEvent.proposedDates.length - 1]
            .eventDate,
        eventFrom:
          selectedEvent.proposedDates[selectedEvent.proposedDates.length - 1]
            .eventFrom,
        eventTo:
          selectedEvent.proposedDates[selectedEvent.proposedDates.length - 1]
            .eventTo,
      }),
    )
      .then(({ payload }) => {
        setSelectedEvent(payload);
      })
      .finally(() => {
        setLoading((pre) => ({ ...pre, accept: false }));
      });
  };
  /////////////////////////////////////////////////////// COMPONENTS ///////////////////////////////////////////////////
  const EventElement: React.FC<{
    title: string;
    value: string | number | undefined;
  }> = ({ title, value }) => {
    return (
      <div className="grid grid-cols-4 border-t border-x border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7">
        <p className="col-span-1 font-semibold text-start  ">{title}:</p>
        <p className="col-span-3 text-start  ">{value}</p>
      </div>
    );
  };
  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  return (
    <Modal
      open={showEventViewModal}
      onClose={onCloseModal}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[1000px] md:px-8 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 ">
          <div className="w-fit flex justify-start items-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2 ">
              {showProposeDateForm ? 'Propose Date' : 'View Event'}
            </h4>
          </div>
          <div className="flex justify-end items-center gap-4.5 w-fit ">
            {page == 'Employer' && // dont show these buttons to partner/school
              selectedEvent?.proposedDates[
                selectedEvent?.proposedDates?.length - 1
              ]?.proposerRole != role && ( // if employer/school propose the date, dont show button to propose again
                <button
                  onClick={() => setShowProposeDateForm((pre) => !pre)}
                  className="rounded-md bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90 h-fit"
                >
                  Propose another date
                </button>
              )}
            <Tooltip title="Close" placement="top">
              <IconButton onClick={() => setShowEventViewModal(false)}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {showProposeDateForm ? (
          <form
            onSubmit={onSubmit}
            className="flex flex-col items-center w-full"
          >
            {/* Event Date */}
            <div className="mb-5.5 flex flex-col gap-2 w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white w-max"
                htmlFor="eventDate"
              >
                Event Date <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="datetime-local"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={onChange}
                  id="eventDate"
                />
              </div>
            </div>

            {/* Event From */}
            <div className="mb-5.5 flex flex-col gap-2 w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white w-max"
                htmlFor="eventFrom"
              >
                Event From <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="datetime-local"
                  name="eventFrom"
                  value={formData.eventFrom}
                  onChange={onChange}
                  id="eventFrom"
                />
              </div>
            </div>

            {/* Event To */}
            <div className="mb-5.5 flex flex-col gap-2 w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white w-max"
                htmlFor="eventTo"
              >
                Event To <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="datetime-local"
                  name="eventTo"
                  value={formData.eventTo}
                  onChange={onChange}
                  id="eventTo"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4.5 w-1/2">
              <button
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="flex justify-center rounded bg-primary disabled:bg-primary/50 py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                type="submit"
                disabled={loading.reschedule}
              >
                {loading.reschedule ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="block w-full h-[16rem] rounded-lg overflow-hidden ">
              <img
                src={selectedEvent?.carouselImages?.[0] || CardsOne}
                alt="Cards"
                className="w-full h-full rounded-lg object-cover "
              />
            </div>

            {selectedEvent?.status == EventStatus.Cancelled &&
              selectedEvent?.noteFromInstitution && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-black w-full text-start font-medium text-md ">
                    Reject Note From Institution
                  </span>
                  <p className="w-full p-2 rounded-md border bg-meta-1/10 text-meta-1 ">
                    {selectedEvent?.noteFromInstitution}
                  </p>
                </div>
              )}

            <div className="flex flex-col bg-[#F9FAFB] dark:bg-meta-4 rounded-lg overflow-hidden">
              <EventElement title="Title" value={selectedEvent?.title} />
              <EventElement title="Event Type" value={selectedEvent?.type} />
              <EventElement
                title="Start Date"
                value={
                  extractDateTimeFromTimestamp(selectedEvent?.eventFrom).date
                }
              />
              <EventElement
                title="End Date"
                value={
                  extractDateTimeFromTimestamp(selectedEvent?.eventTo)?.date
                }
              />
              <EventElement
                title="Description"
                value={selectedEvent?.description}
              />
              <EventElement
                title="Address Line 1"
                value={selectedEvent?.addressLine1}
              />
              <EventElement
                title="Address Line 2"
                value={selectedEvent?.addressLine2}
              />
              <EventElement title="City" value={selectedEvent?.city} />
              <EventElement title="State" value={selectedEvent?.state} />
              <EventElement title="Zip Code" value={selectedEvent?.zipCode} />
              {selectedEvent?.eventParticipants?.filter(
                (e: Employer) => e?.branchLocation,
              ) && (
                <EventElement
                  title="Employer Name"
                  value={
                    selectedEvent?.eventParticipants?.filter(
                      (e: Employer) => e?.branchLocation,
                    )?.[0]?.name
                  }
                />
              )}
              <EventElement
                title="Contact Email"
                value={selectedEvent?.contactEmail}
              />
              <EventElement
                title="Creater Name"
                value={selectedEvent?.createrName}
              />
              <EventElement
                title="Creater Email"
                value={selectedEvent?.createrEmail}
              />
              <EventElement
                title="Creater Role"
                value={selectedEvent?.createrRole}
              />
              <EventElement
                title="Approved By Admin"
                value={selectedEvent?.approvedByAdmin ? 'Yes' : 'No'}
              />
              <EventElement
                title="Rejected By Amdin"
                value={selectedEvent?.rejectedByAdmin ? 'Yes' :'No'}
              />
              <EventElement
                title="Dress Code"
                value={selectedEvent?.dressCode}
              />
              <EventElement
                title="Organized By"
                value={selectedEvent?.partnerId}
              />
              <EventElement
                title="Requested Program"
                value={selectedEvent?.requestedProgram}
              />
              <EventElement
                title="AV Equipment Needs"
                value={selectedEvent?.AVEquipmentNeeds}
              />
              <EventElement
                title="RSVP"
                value={selectedEvent?.RSVP}
              />
              <EventElement
                title="Additional Comments"
                value={selectedEvent?.additionalComments}
              />
              <EventElement
                title="Agenda"
                value={selectedEvent?.agenda}
              />
              <EventElement
                title="Carousel Images"
                value={selectedEvent?.carouselImages?.join(', ')}
              />
              <EventElement
                title="Catering Preferences"
                value={selectedEvent?.cateringPreferences}
              />
              <EventElement
                title="Emergency Contact No"
                value={selectedEvent?.emergencyContactPhone}
              />
              <EventElement
                title="Note From Institution"
                value={selectedEvent?.noteFromInstitution}
              />
              <EventElement
                title="Parking Arragements"
                value={selectedEvent?.parkingArrangements}
              />
              <EventElement
                title="Preffered Location In School"
                value={selectedEvent?.preferredLocationInSchool}
              />
              <EventElement
                title="Purpose"
                value={selectedEvent?.purpose}
              />
              <EventElement
                title="Expected Attendees"
                value={selectedEvent?.expectedAttendees}
              />
              <EventElement
                title="SetUp Requiremets"
                value={selectedEvent?.setupRequirements}
              />
              <EventElement
                title="Transportaion Details"
                value={selectedEvent?.transportationDetails}
              />
              <EventElement
                title="Url"
                value={selectedEvent?.url}
              />
              <EventElement
                title="Is Test"
                value={selectedEvent?.isTest ? 'Yes' : 'No'}
              />
              <EventElement
                title="Requested Partner"
                value={typeof selectedEvent?.requestedPartner === 'object' && selectedEvent?.requestedPartner?.name
                  ? String(selectedEvent.requestedPartner.name)
                  : String(selectedEvent?.requestedPartner)}
              />
              
              {/* <EventElement
                title="Event From"
                value={
                  extractDateTimeFromTimestamp(selectedEvent?.eventFrom)?.time
                }
              />
              <EventElement
                title="Event To"
                value={
                  extractDateTimeFromTimestamp(selectedEvent?.eventTo)?.time
                }
              /> */}
              {/* <EventElement title="Host Name" value={selectedEvent?.hostName} /> */}
              <EventElement title="Employers" value={employerNames} />
              <EventElement
                title="Participants"
                value={selectedEvent?.eventParticipants?.length}
              />
              <EventElement title="Status" value={selectedEvent?.status} />
            </div>

            {selectedEvent?.proposedDates?.length > 0 && (
              <div className="flex flex-col gap-4 w-full">
                <h3 className="font-medium text-lg w-full text-start">
                  Proposded Dates
                </h3>
                <div className="flex flex-col gap-2">
                  {selectedEvent?.proposedDates?.map((item, index) => (
                    <div
                      className="bg-[#F9FAFB] dark:bg-meta-4 rounded-lg overflow-hidden"
                      key={index}
                    >
                      <EventElement
                        title="Proposed By"
                        value={`${item?.proposedBy} (${item?.proposerRole || ''})`}
                      />
                      <EventElement
                        title="Event Date"
                        value={
                          extractDateTimeFromTimestamp(item?.eventFrom)?.date
                        }
                      />
                      <EventElement
                        title="Event From"
                        value={
                          extractDateTimeFromTimestamp(item?.eventFrom)?.time
                        }
                      />
                      <EventElement
                        title="Event To"
                        value={
                          extractDateTimeFromTimestamp(item?.eventTo)?.time
                        }
                      />
                      {selectedEvent?.proposedDates?.length - 1 === index &&
                        item.proposerRole != role &&
                        selectedEvent?.status == EventStatus.Reschedule && (
                          <div className="w-full flex justify-end items-center gap-4 px-1.5 pb-1.5 ">
                            <button
                              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium bg-meta-4 hover:bg-meta-4/75 text-white dark:border-strokedark"
                              onClick={() => setShowProposeDateForm(true)}
                              disabled={loading.reschedule}
                            >
                              Propose Date
                            </button>
                            <button
                              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium bg-meta-3 hover:bg-meta-3/75 text-white dark:border-strokedark"
                              onClick={onAccept}
                              disabled={loading.accept}
                            >
                              {loading.accept ? 'Processing...' : 'Accept'}
                            </button>
                          </div>
                        )}
                    </div>
                  ))}
                  <hr className="mt-1" />
                </div>
              </div>
            )}

            <div className="w-full rounded-lg bg-white py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4">
              <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 ">
                <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2 ">
                  Participants
                </h4>
              </div>

              <div className="flex flex-col">
                <div
                  style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}
                  className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
                >
                  <div className="col-span-3">
                    <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                      Name
                    </h5>
                  </div>
                  <div className="col-span-2">
                    <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                      Email
                    </h5>
                  </div>
                  <div className="col-span-2">
                    <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                      City/State
                    </h5>
                  </div>
                </div>

                {instituteParticipants?.length > 0 ||
                candidateParticipants?.length > 0 ||
                employerParticipants?.length > 0 ? (
                  <>
                    {instituteParticipants?.map((participant, index) => (
                      <div
                        key={`institute-${index}`}
                        style={{
                          gridTemplateColumns: `repeat(7, minmax(0, 1fr))`,
                        }}
                        className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                      >
                        <div className="col-span-3">
                          <p className="text-center text-[#637381] dark:text-bodydark hover:text-primary cursor-pointer">
                            {participant?.name}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center text-[#637381] dark:text-bodydark">
                            {participant?.email}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center text-[#637381] dark:text-bodydark">
                            {participant?.city}/{participant?.state}
                          </p>
                        </div>
                      </div>
                    ))}
                    {candidateParticipants?.map((participant, index) => (
                      <div
                        key={`candidate-${index}`}
                        style={{
                          gridTemplateColumns: `repeat(7, minmax(0, 1fr))`,
                        }}
                        className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                      >
                        <div className="col-span-3">
                          <p className="text-center text-[#637381] dark:text-bodydark hover:text-primary cursor-pointer">
                            {participant?.name}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center text-[#637381] dark:text-bodydark">
                            {participant?.email}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center text-[#637381] dark:text-bodydark">
                            {participant?.city}/{participant?.state}
                          </p>
                        </div>
                      </div>
                    ))}
                    {employerParticipants?.map((participant, index) => (
                      <div
                        key={`employer-${index}`}
                        style={{
                          gridTemplateColumns: `repeat(7, minmax(0, 1fr))`,
                        }}
                        className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                      >
                        <div className="col-span-3">
                          <p className="text-center text-[#637381] dark:text-bodydark hover:text-primary cursor-pointer">
                            {participant?.name}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center text-[#637381] dark:text-bodydark">
                            {participant?.email}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-center text-[#637381] dark:text-bodydark">
                            {participant?.city}/{participant?.state}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p>No participants.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ViewEventModal;
