import { useState, useEffect, useRef } from 'react';
import {
  // Class,
  EmailData,
  Event,
  LocalStorageAuthUser,
  Partner,
} from '../../interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { MediaPaths } from '../../constants';
import { createEvent, updateEvent } from '../../store/reducers/eventSlice';
import { RootState } from '../../store/store';
import {
  fetchPartnerById,
  fetchPartners,
} from '../../store/reducers/partnerSlice';
import toast from 'react-hot-toast';
import { useStateContext } from '../../context/useStateContext';
import { STATES } from '../../constants';
import {
  fetchEmployerById,
  fetchEmployers,
  setEmployer,
} from '../../store/reducers/employersSlice';
import SelectEmployerIds from '../Forms/SelectGroup/SelectEmployers';
import {
  sendEmail,
  sendEventEmailToAdmin,
} from '../../store/reducers/emailSlice';
import { EventStatus, EventTypes } from '../../utils/enums';
import { validate } from 'email-validator';
import { UserRolesEnum } from '../../utils/enums';
import {
  fetchClasses,
  fetchClassesByInstructorId,
} from '../../store/reducers/classSlice';
// import { ChevronDown } from 'lucide-react';
import { fetchStudentsOfInstitution } from '../../store/reducers/userSlice';
import { convertToPng } from '../../utils/functions';
import Select from 'react-select';
import { FixedSizeList as List } from 'react-window';

const CreateEvent = ({
  event,
  setInitialData,
}: {
  event: Event;
  setInitialData: (data: any) => void;
}) => {
  /////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const dispatch = useDispatch();
  // const dropdownRef = useRef();

  const { partner, partners } = useSelector(
    (state: RootState) => state.partner,
  );
  const { allClasses: fetchedAllClasses, classes: fetchedClasses } =
    useSelector((state: RootState) => state.class);
  const { user, students } = useSelector((state: RootState) => state.user);
  const { employer } = useSelector((state: RootState) => state.employer);
  const { showEventFormModal, setShowEventFormModal, page } = useStateContext();
  const role = String(localStorage.getItem('Role'));
  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? { ...JSON.parse(localStorage.getItem('auth')), ...user }
    : user;
  const initialEmployerData = {
    name: '',
    email: '',
    branchLocation: '',
    addressLine1: '',
  };
  const isInstitution =
    role == UserRolesEnum.SchoolAdmin ||
    role == UserRolesEnum.Teacher ||
    role == UserRolesEnum.Counsellor;
  const initialEventData: Event = {
    title: '',
    contactEmail: '',
    contactPhone: '',
    contactName: '',
    contactTitle: '',
    hostName: '',
    purpose: '',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    createrEmail: authUser?.email,
    employerId: role === UserRolesEnum.Employer ? employer?.id || '' : '',
    partnerId: isInstitution ? partner?.id || '' : '',
    createrRole: role,
    city: '',
    state: '',
    addressLine1: '',
    addressLine2: '',
    eventDate: '',
    eventFrom: '',
    eventTo: '',
    status: EventStatus.Requested,
    description: '', // optional
    zipCode: '', // optional
    url: '', // optional
    additionalComments: '', // optional
    studentIds: [], // optional
    carouselImages: [], // optional
    type: EventTypes.OffCampus,
    eventParticipants: [],
    noteFromInstitution: '',

    // for offcampus
    transportationDetails: '', // optional
    RSVP: '', // optional
    emergencyContactPhone: '', // optional
    agenda: '', // optional
    dressCode: '', // optional
    requestedEmployerIds: isInstitution ? [] : [employer?.id],

    // for oncampus
    proposedDates: [],
    requestedPartnerId: authUser?.partnerId || '', // required for oncampus
    requestedPartner: authUser?.partnerId || null,
    preferredLocationInSchool: '', // optional
    expectedAttendees: 0, // optional
    requestedProgram: '', // optional
    setupRequirements: '', // optional
    AVEquipmentNeeds: '', // optional
    cateringPreferences: '', // optional
    parkingArrangements: '', // optional
    isTest: false,
  };
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  const mongoUserId = localStorage.getItem('mongoUserId');

  /////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////
  const [formData, setFormData] = useState<Event>(event);
  const [inputImages, setInputImages] = useState([]);
  const [employerData, setEmployerData] =
    useState<typeof initialEmployerData>(initialEmployerData);

  const [isLoading, setIsLoading] = useState({
    submit: false,
    employers: false,
    partners: false,
  });
  // const [showDropdown, setShowDropdown] = useState(false);
  const [eventType, setEventType] = useState<EventTypes>(EventTypes.OnCampus);

  const [showEmployerFields, setShowEmployerFields] = useState(false);
  const [requestedSchool, setRequestedSchool] = useState<Partner>();
  const [classes, setClasses] = useState(
    role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses,
  );
  // const [toggle, setToggle] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  // const [searchValue, setSearchValue] = useState('');
  // const [showNestedDropdown, setShowNestedDropdown] = useState(false);
  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    // close on click outside
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !showEventFormModal ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [showEventFormModal]);
  useEffect(() => {
    // close if the esc key is pressed
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (showEventFormModal && keyCode === 27) {
        setShowEventFormModal(false);
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [showEventFormModal]);
  useEffect(() => {
    if (
      (role === UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses)
        ?.length > 0
    )
      return;
    if (role === UserRolesEnum.SchoolAdmin) {
      dispatch<any>(fetchClasses(authUser?.partnerId));
    } else {
      dispatch<any>(fetchClassesByInstructorId(authUser?.id));
    }
  }, []);
  useEffect(() => {
    dispatch<any>(
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      }),
    );
  }, []);
  useEffect(() => {
    if (isInstitution) {
      setIsLoading((pre) => ({ ...pre, employers: true }));
      dispatch<any>(fetchEmployers()).finally(() =>
        setIsLoading((pre) => ({ ...pre, employers: false })),
      ); // Being used in SelectEmployerIds
    } else {
      setIsLoading((pre) => ({ ...pre, partners: true }));
      dispatch<any>(
        fetchPartners({ approved: true, page: 1, limit: 100000 }),
      ).finally(() => setIsLoading((pre) => ({ ...pre, partners: false })));
    }
  }, []);
  useEffect(() => {
    if (!partner && page != 'Employer') {
      dispatch<any>(fetchPartnerById(authUser?.partnerId));
    }
    if (!employer) {
      dispatch<any>(fetchEmployerById(authUser?.employerId));
    }
  }, [partner, employer]);
  useEffect(() => {
    setFormData(event);
    setEventType(event?.type);
  }, [event]);
  useEffect(() => {
    setClasses(
      role == UserRolesEnum.SchoolAdmin ? fetchedAllClasses : fetchedClasses,
    );
  }, [fetchedAllClasses, fetchedClasses]);
  useEffect(() => {
    if (!event?.title) {
      if (eventType === EventTypes.OnCampus) {
        setFormData({
          ...formData,
          addressLine1: partner?.addressLine1 || partner?.address || '',
          addressLine2: partner?.addressLine2 || '',
          city: partner?.city || '',
          state: partner?.state || '',
          zipCode: partner?.zip || '',
        });
      } else if (eventType === EventTypes.OffCampus) {
        setFormData({
          ...formData,
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          zipCode: '',
        });
      }
    }
  }, [event, eventType, partner]);

  /////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
  const handleEventTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventType(e.target.value as EventTypes);
  };
  const openEventModal = () => {
    if (eventType === EventTypes.OnCampus) {
      setFormData({
        ...formData,
        addressLine1: partner?.addressLine1 || partner?.address || '',
        addressLine2: partner?.addressLine2 || '',
        city: partner?.city || '',
        state: partner?.state || '',
        zipCode: partner?.zip || '',
      });
    } else {
      setFormData(initialEventData);
    }
    setEventType(EventTypes.OnCampus); // Default to On-Campus
    setShowEventFormModal(true);
  };
  const onChange = (e) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onClose = () => {
    setShowEventFormModal(false);
    setEmployerData(initialEmployerData);
    setInputImages(null);
    setFormData(initialEventData);
    setInitialData(null);
    setSelectedValues([]);
  };
  const onUploadFile = async () => {
    const urls: string[] = [];

    if (inputImages?.length > 0) {
      // Initialize the progress array
      setUploadProgress(new Array(inputImages.length).fill(0));

      try {
        await Promise.all(
          inputImages.map(async (file, index) => {
            try {
              // Convert the file to PNG
              const pngFile = await convertToPng(file);

              // Create a reference to Firebase storage
              const storageRef = ref(
                storage,
                `${MediaPaths.EventMedia}/${pngFile.name}`,
              );
              const uploadTask = uploadBytesResumable(storageRef, pngFile);

              // Wait for the upload to complete
              await new Promise((resolve, reject) => {
                uploadTask.on(
                  'state_changed',
                  // Track progress
                  (snapshot) => {
                    const progress =
                      (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    // Update the file's progress
                    setUploadProgress((prevProgress) => {
                      const updatedProgress = [...prevProgress];
                      updatedProgress[index] = Math.round(progress);
                      return updatedProgress;
                    });
                  },
                  // Handle errors
                  (error) => {
                    console.error('Error uploading file:', error);
                    reject(error);
                  },
                  // Handle successful uploads
                  async () => {
                    try {
                      const downloadURL = await getDownloadURL(
                        uploadTask.snapshot.ref,
                      );
                      urls.push(downloadURL);
                      resolve(downloadURL);
                    } catch (error) {
                      console.error('Error retrieving download URL:', error);
                      reject(error);
                    }
                  },
                );
              });
            } catch (error) {
              console.error('Error converting file to PNG:', error);
              throw error;
            }
          }),
        );

        setFormData((prevFormData) => {
          let updatedCarouselImages;

          if (prevFormData?.carouselImages?.[0] === '') {
            // Replace the first empty string with the new URLs
            updatedCarouselImages = [...urls];
          } else {
            // Append the new URLs to the existing images
            updatedCarouselImages = [
              ...(prevFormData?.carouselImages || []),
              ...urls,
            ];
          }

          // Return the updated formData
          return {
            ...prevFormData,
            carouselImages: updatedCarouselImages,
          };
        });

        const appendedUrls =
          formData?.carouselImages?.[0] === ''
            ? [...urls]
            : [...(formData?.carouselImages || []), ...urls];

        return appendedUrls;
      } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
      }
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateEventForm()) return;
    setIsLoading((pre) => ({ ...pre, submit: true }));

    const imageUrls = await onUploadFile();
    // Helper function to parse dates and validate them
    const parseDate = (date) => {
      const parsedDate = new Date(date);
      return parsedDate instanceof Date && !isNaN(parsedDate.getTime())
        ? parsedDate
        : null;
    };

    // Parse and validate date fields
    const eventDate = parseDate(formData?.eventFrom);
    const eventFrom = parseDate(formData?.eventFrom);
    const eventTo = parseDate(formData?.eventTo);

    // Check if the date parsing was successful
    if (!eventFrom || !eventTo) {
      console.error('Invalid date values provided:', {
        eventFrom: formData?.eventFrom,
        eventTo: formData?.eventTo,
      });
      toast.error('Please provide valid dates.');
      setIsLoading((pre) => ({ ...pre, submit: false }));
      return;
    }

    let classStudentIds = classes
      ?.filter((c) => selectedValues?.includes(c?.id))
      ?.filter((c) => c)
      ?.map((c) => c?.students)
      ?.flat();
    classStudentIds = Array.from(new Set([...classStudentIds]));
    const classStudentsObjs = students?.filter((s) =>
      classStudentIds?.includes(s?.id),
    );

    const eventStatus =
      role == 'SuperAdmin' || role == 'Admin'
        ? EventStatus.Scheduled
        : EventStatus.Requested;

    const inputEvent: Event = {
      ...formData,
      eventDate,
      eventFrom,
      eventTo,
      dateCreated: new Date(),
      dateUpdated: new Date(),

      requestedPartner: requestedSchool?.id || null,
      // requestedPartnerId:
      //   eventType == EventTypes.OnCampus && page == 'Employer'
      //     ? formData?.requestedPartner?.id
      //     : '',

      requestedEmployerIds: isInstitution
        ? formData?.requestedEmployerIds?.filter((e) => e)
        : [], // Inviting employers to join the event

      approvedByAdmin: role === 'Admin' || role === 'SuperAdmin' ? true : false,
      addressLine2: formData?.addressLine2 || '',
      url: user?.photoUrl || '',
      createrEmail: authUser?.email,
      partnerId: isInstitution ? authUser?.partnerId : '',
      createrRole: role,
      carouselImages:
        (!imageUrls || imageUrls?.length == 0) &&
        event?.carouselImages?.length == 0
          ? page == 'Employer'
            ? [employer?.photoUrl]
            : [partner?.photoUrl]
          : imageUrls || event?.carouselImages,
      type: eventType,
      status: eventStatus, // Set the status based on authUser role
      eventParticipants: [
        isInstitution ? partner : employer,
        ...(classStudentsObjs || []),
      ],
      proposedDates:
        role == 'Employer'
          ? [
              {
                eventDate,
                eventFrom,
                eventTo,
                proposedBy: employer?.name,
                proposerRole: role,
              },
            ]
          : [],
      studentIds: [...(classStudentIds || [])],
      employerIds: isInstitution
        ? formData?.requestedEmployerIds
        : [employer?.id],
    };
    if (showEmployerFields) {
      if (!validateEmployerForm()) return '';
      dispatch<any>(setEmployer(employerData)).then(({ payload }) => {
        inputEvent.requestedEmployerIds = [
          ...inputEvent.requestedEmployerIds.filter((id) => id != 'other'),
          payload?.id,
        ];
        dispatch<any>(
          event?.title
            ? updateEvent({
                eventData: inputEvent,
                eventId: event.id,
                organizerType: page == 'Employer' ? 'branch' : 'institution',
                organizerId:
                  page == 'Employer' ? mongoUserId : mongoInstituteId,
              })
            : createEvent({
                eventData: inputEvent,
                organizerType: page == 'Employer' ? 'branch' : 'institution',
                organizerId:
                  page == 'Employer' ? mongoUserId : mongoInstituteId,
              }),
        )
          .then(({ payload }) => {
            sendEventEmailToAdmin(inputEvent);
            onClose();
            toast.success(event?.title ? 'Event updated' : 'Event created.');
            setIsLoading((pre) => ({ ...pre, submit: false }));

            if (isInstitution || eventType == EventTypes.OffCampus) {
              const emailForAdmin: EmailData = {
                to: 'support@adultedpro.com',
                template: {
                  name: 'event-approval',
                  data: {
                    ...payload,
                    eventDate: parseDate(payload?.eventFrom),
                    eventFrom: parseDate(payload?.eventFrom),
                    eventTo: parseDate(payload?.eventTo),
                    dateCreated: parseDate(payload?.dateCreated),
                    dateUpdated: parseDate(payload?.dateUpdated),
                  },
                },
                dateCreated: new Date(),
                dateUpdated: new Date(),
                isTest: false,
              };
              const emailForCreater: EmailData = {
                to: page == 'Employer' ? employer?.email : partner?.email,
                template: {
                  name: 'event-in-progress', // TODO: create template
                  data: {
                    ...payload,
                    eventDate: parseDate(payload?.eventFrom),
                    eventFrom: parseDate(payload?.eventFrom),
                    eventTo: parseDate(payload?.eventTo),
                    dateCreated: parseDate(payload?.dateCreated),
                    dateUpdated: parseDate(payload?.dateUpdated),
                  },
                },
                dateCreated: new Date(),
                dateUpdated: new Date(),
                isTest: false,
              };
              dispatch<any>(sendEmail(emailForAdmin));
              dispatch<any>(sendEmail(emailForCreater));
            }
          })
          .catch(() => {
            setIsLoading((pre) => ({ ...pre, submit: false }));
            toast.error('Something went wrong!');
          });
      });
    } else {
      dispatch<any>(
        event?.title
          ? updateEvent({
              eventData: inputEvent,
              eventId: event.id,
              organizerType: page == 'Employer' ? 'branch' : 'institution',
              organizerId: page == 'Employer' ? mongoUserId : mongoInstituteId,
            })
          : createEvent({
              eventData: inputEvent,
              organizerType: page == 'Employer' ? 'branch' : 'institution',
              organizerId: page == 'Employer' ? mongoUserId : mongoInstituteId,
            }),
      )
        .then(({ payload }) => {
          sendEventEmailToAdmin(inputEvent);
          onClose();
          toast.success(event?.title ? 'Event updated' : 'Event created.');

          if (isInstitution || eventType == EventTypes.OffCampus) {
            const data: EmailData = {
              to: 'support@adultedpro.com',
              template: {
                name: 'event-notification',
                data: {
                  ...payload,
                  eventDate: parseDate(payload?.eventFrom),
                  eventFrom: parseDate(payload?.eventFrom),
                  eventTo: parseDate(payload?.eventTo),
                  dateCreated: parseDate(payload?.dateCreated),
                  dateUpdated: parseDate(payload?.dateUpdated),
                },
              },
              dateCreated: new Date(),
              dateUpdated: new Date(),
              isTest: false,
            };
            const emailForCreater: EmailData = {
              to: page == 'Employer' ? employer?.email : partner?.email,
              template: {
                name: 'event-in-progress', // TODO: create template
                data: {
                  ...payload,
                  eventDate: parseDate(payload?.eventFrom),
                  eventFrom: parseDate(payload?.eventFrom),
                  eventTo: parseDate(payload?.eventTo),
                  dateCreated: parseDate(payload?.dateCreated),
                  dateUpdated: parseDate(payload?.dateUpdated),
                },
              },
              dateCreated: new Date(),
              dateUpdated: new Date(),
              isTest: false,
            };
            dispatch<any>(sendEmail(data));
            dispatch<any>(sendEmail(emailForCreater));
          }
        })
        .finally(() => {
          setIsLoading((pre) => ({ ...pre, submit: false }));
        });
    }
  };

  const validateEmployerForm = () => {
    if (!employerData?.name) {
      alert('Please enter a valid name.');
      return false;
    }
    const namePattern = /^[A-Za-z\s]+$/;

    if (!namePattern.test(employerData.name)) {
      alert('Name must contain only letters and spaces.');
      return false;
    }

    if (!employerData?.branchLocation) {
      alert('Branch location is required..');
      return false;
    }

    if (!employerData?.addressLine1) {
      alert('Address line 1 is required.');
      return false;
    }

    const addressPattern = /^[A-Za-z0-9\s,'-.#]+$/;
    const alphabetPattern = /[A-Za-z].*[A-Za-z]/; // Ensures at least 2 alphabetic characters

    if (!addressPattern.test(employerData.addressLine1)) {
      alert('Please enter a valid address.');
      return false;
    }

    if (employerData.addressLine1.length < 5) {
      alert('Address line 1 must be at least 5 characters long.');
      return false;
    }

    if (!alphabetPattern.test(employerData.addressLine1)) {
      alert('Address line 1 must contain at least 2 alphabetic characters.');
      return false;
    }

    if (!employerData?.email || !validate(employerData?.email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    return true;
  };
  const validateEventForm = () => {
    if (!formData?.title) {
      alert('Event Title is missing.');
      return false;
    }
    const titlePattern = /^[A-Za-z\s]+$/;

    if (!titlePattern.test(formData.title)) {
      alert('Title must contain only letters and spaces.');
      return false;
    }

    if (!formData?.contactEmail) {
      alert('Contact Email is missing.');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.contactEmail)) {
      alert('Please enter a valid email address.');
      return false;
    }

    if (!formData?.contactName) {
      alert('Contact Name is missing.');
      return false;
    }

    const namePattern = /^[A-Za-z\s]+$/;

    if (!namePattern.test(formData.contactName)) {
      alert('Contact name must contain only letters and spaces.');
      return false;
    }

    if (
      (!formData?.requestedPartner ||
        formData?.requestedPartner == null ||
        typeof formData?.requestedPartner === 'undefined') &&
      eventType == EventTypes.OnCampus &&
      page == 'Employer'
    ) {
      alert('School is missing.');
      return false;
    }

    if (!formData?.eventFrom) {
      alert('Event Start Time is missing.');
      return false;
    }

    if (!formData?.eventTo) {
      alert('Event End Time is missing.');
      return false;
    }

    if (formData?.eventFrom >= formData?.eventTo) {
      alert('Event Start Time must be earlier than End Time.');
      return false;
    }

    if (!formData?.addressLine1) {
      alert('Address Line 1 is missing.');
      return false;
    }

    const addressPattern = /^[A-Za-z0-9\s,'-.#]+$/;
    const alphabetPattern = /[A-Za-z].*[A-Za-z]/; // Ensures at least 2 alphabetic characters

    if (!addressPattern.test(formData.addressLine1)) {
      alert('Please enter a valid address.');
      return false;
    }

    if (formData.addressLine1.length < 5) {
      alert('Address line 1 must be at least 5 characters long.');
      return false;
    }

    if (!alphabetPattern.test(formData.addressLine1)) {
      alert('Address line 1 must contain at least 2 alphabetic characters.');
      return false;
    }

    if (!formData?.city) {
      alert('City is missing.');
      return false;
    }
    const cityName = /^[A-Za-z\s]+$/;

    if (!cityName.test(formData.city)) {
      alert('City must contain only letters and spaces.');
      return false;
    }

    if (!formData?.state) {
      alert('State is missing.');
      return false;
    }

    return true; // Return true if all validations pass
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const CustomMenuList = (props) => {
    const { options, setValue, ...rest } = props;

    if (options.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '10px',
            color: 'gray',
          }}
        >
          No school with the searched name
        </div>
      );
    }

    return (
      <div
        {...rest}
        style={{ maxHeight: '400px', overflowY: 'auto', width: '100%' }}
      >
        <List
          height={400}
          itemCount={options.length}
          itemSize={50}
          width="100%"
        >
          {({ index, style }) => {
            const option = options[index];
            return (
              <div
                style={{
                  ...style,
                  textAlign: 'left',
                  padding: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'normal',
                  overflow: 'hidden',
                }}
                key={option?.value}
                onClick={() => setValue(option)}
              >
                {option?.label}
              </div>
            );
          }}
        </List>
      </div>
    );
  };

  const filteredOptions = partners
    .filter((partner) =>
      partner?.name?.toLowerCase().includes(searchInput?.toLowerCase()),
    )
    .map((partner) => ({
      value: partner?.name,
      label: partner?.name,
    }));
  const handleInputChange = (inputValue: string) => {
    setSearchInput(inputValue);
  };

  const handlePartnerChange = (
    selectedOption: { value: string; label: string } | null,
  ) => {
    if (selectedOption) {
      const selectedPartner = partners?.find(
        (partner) => partner?.name === selectedOption.value,
      );

      setFormData((prevFormData) => ({
        ...prevFormData,
        requestedPartner: selectedPartner?.id || null,
      }));
      setRequestedSchool(selectedPartner);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        requestedPartner: prevFormData?.requestedPartner,
      }));
    }
  };
  ////////////////////////////////////////////////////////// DROPDOWN /////////////////////////////////////////////////////////////
  return (
    <div>
      <div className="relative inline-block text-left">
        <button
          ref={trigger}
          onClick={openEventModal}
          className="h-fit rounded-md text-sm bg-graydark px-8 py-3 font-medium text-white hover:bg-opacity-90"
        >
          Add Event
        </button>
      </div>

      {showEventFormModal && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
          <div
            ref={modal}
            className="max-h-[90vh] max-w-[1000px] min-h-[90vh] w-[90vw] space-y-4 overflow-auto rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:px-12 md:py-8 "
          >
            <div className="flex w-full items-center justify-center">
              <h4 className="text-2xl font-semibold text-black dark:text-white">
                {event?.title ? 'Update ' : 'Create '}Event
              </h4>
            </div>

            <form onSubmit={onSubmit}>
              {/* Radio Buttons for Event Type */}
              <div className="mb-5.5 flex items-center gap-5.5">
                <label
                  className="text-start text-sm font-medium text-black dark:text-white"
                  htmlFor="title"
                >
                  Event Type:
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value={EventTypes.OnCampus}
                    checked={eventType === EventTypes.OnCampus}
                    onChange={handleEventTypeChange}
                  />
                  <span
                    className={`ml-2 ${eventType === EventTypes.OnCampus ? 'font-bold text-black' : ''}`}
                  >
                    On Campus
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value={EventTypes.OffCampus}
                    checked={eventType === EventTypes.OffCampus}
                    onChange={handleEventTypeChange}
                  />
                  <span
                    className={`ml-2 ${eventType === EventTypes.OffCampus ? 'font-bold text-black' : ''}`}
                  >
                    Off Campus
                  </span>
                </label>
              </div>

              {/* Event Title & Event Contact Number */}
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="title"
                  >
                    Event Title <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="title"
                      value={formData?.title}
                      onChange={onChange}
                      id="title"
                      placeholder="Event Title"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="contactName"
                  >
                    Contact Name <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="contactName"
                      value={formData?.contactName}
                      onChange={onChange}
                      id="contactName"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Name & Contact Email */}
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="contactEmail"
                  >
                    Contact Email <span className="text-red">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="contactEmail"
                    value={formData?.contactEmail}
                    onChange={onChange}
                    id="contactEmail"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="contactPhone"
                  >
                    Contact Phone
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="contactPhone"
                    value={formData?.contactPhone}
                    onChange={onChange}
                    id="contactPhone"
                    placeholder="+990 3343 7865"
                  />
                </div>
              </div>

              {/* Event From - Event To */}
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="eventFrom"
                  >
                    Event From <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="datetime-local"
                      name="eventFrom"
                      value={formData?.eventFrom}
                      min={getCurrentDateTime()}
                      onChange={onChange}
                      id="eventFrom"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="eventTo"
                  >
                    Event To <span className="text-red">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="datetime-local"
                    name="eventTo"
                    value={formData?.eventTo}
                    min={getCurrentDateTime()}
                    onChange={onChange}
                    id="eventTo"
                  />
                </div>
              </div>

              {/* Address Line 1 - Address - Line 2 */}
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="addressLine1"
                  >
                    Address Line 1 <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="addressLine1"
                      value={formData?.addressLine1}
                      onChange={onChange}
                      id="addressLine1"
                      placeholder="1234 Main St"
                      disabled={
                        eventType === EventTypes.OnCampus &&
                        formData.addressLine1 !== '' &&
                        page !== 'Employer'
                      }
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="addressLine2"
                  >
                    Address Line 2
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="addressLine2"
                    value={formData?.addressLine2}
                    onChange={onChange}
                    id="addressLine2"
                    placeholder="1234 Main St"
                    disabled={
                      eventType === EventTypes.OnCampus &&
                      formData.addressLine2 !== '' &&
                      page !== 'Employer'
                    }
                  />
                </div>
              </div>

              {/* City - State */}
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="city"
                  >
                    City <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="city"
                      value={formData?.city}
                      onChange={onChange}
                      id="city"
                      placeholder="New York"
                      disabled={
                        eventType === EventTypes.OnCampus &&
                        formData.city !== '' &&
                        page !== 'Employer'
                      }
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="state"
                  >
                    State <span className="text-red">*</span>
                  </label>
                  <select
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    name="state"
                    onChange={onChange}
                    value={formData?.state}
                    id="state"
                    disabled={
                      eventType === EventTypes.OnCampus &&
                      formData.state !== '' &&
                      page !== 'Employer'
                    }
                  >
                    {STATES.map((e, index) => (
                      <option value={e.value} key={index}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purpose - ZipCode */}
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="zipCode"
                  >
                    Zip Code
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="zipCode"
                      value={formData?.zipCode}
                      onChange={onChange}
                      id="zipCode"
                      placeholder="Zip Code"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="images"
                  >
                    Select Files
                  </label>

                  {/* File Input */}
                  <input
                    type="file"
                    multiple={true}
                    onChange={(e) => setInputImages([...e.target.files])}
                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                    title="Select Multiple Images"
                    placeholder="Select Multiple Images"
                  />
                  {/* Display Existing Carousel Images */}
                  {formData?.carouselImages?.length > 0 && (
                    <div className="mb-3">
                      <div
                        className="flex overflow-x-auto gap-2 mt-2"
                        style={{ scrollSnapType: 'x mandatory' }}
                      >
                        {formData?.carouselImages.map((image, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 flex-shrink-0"
                            style={{ scrollSnapAlign: 'center' }}
                          >
                            <img
                              src={image}
                              alt={`Carousel Image ${idx + 1}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display Upload Progress */}
                  {inputImages?.map((file, index) => (
                    <div key={file.name} className="mt-2">
                      <span>{file.name}</span>
                      <div className="h-2 w-full bg-gray-200 rounded mt-1">
                        <div
                          className="h-2 bg-blue-500 rounded"
                          style={{ width: `${uploadProgress[index] || 0}%` }}
                        />
                      </div>
                      {/* <span className="text-sm text-gray-500">
                        {uploadProgress[index] || 0}% uploaded
                      </span> */}
                    </div>
                  ))}
                </div>
              </div>

              {/* OffCampus Fields */}
              {eventType == EventTypes.OffCampus ? (
                <>
                  {/* Agenda & RSVP */}
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                        htmlFor="agenda"
                      >
                        Agenda
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="agenda"
                          id="agenda"
                          value={formData?.agenda}
                          onChange={onChange}
                          rows={1}
                          placeholder="Agenda"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                        htmlFor="RSVP"
                      >
                        RSVP
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="RSVP"
                          value={formData?.RSVP}
                          onChange={onChange}
                          id="RSVP"
                          placeholder="RSVP"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Phone & Dress Code */}
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                        htmlFor="emergencyContactPhone"
                      >
                        Emergency Contact Phone
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="emergencyContactPhone"
                          value={formData?.emergencyContactPhone}
                          onChange={onChange}
                          id="emergencyContactPhone"
                          placeholder="+123 1234 1234"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                        htmlFor="dressCode"
                      >
                        Dress Code
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="dressCode"
                          value={formData?.dressCode}
                          onChange={onChange}
                          id="dressCode"
                          placeholder="Dress Code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transportation Details & Additional Comments */}
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                        htmlFor="transportationDetails"
                      >
                        Transportation Details
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="transportationDetails"
                          id="transportationDetails"
                          value={formData?.transportationDetails}
                          onChange={onChange}
                          rows={3}
                          placeholder="Transportation Details"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                        htmlFor="additionalComments"
                      >
                        Additional Comments
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="additionalComments"
                          id="additionalComments"
                          value={formData?.additionalComments}
                          onChange={onChange}
                          rows={3}
                          placeholder="Additional Comments"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Setup Requirements & School */}
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    {page === 'Employer' &&
                      eventType === EventTypes.OnCampus && (
                        <div className="w-full sm:w-1/2">
                          <label
                            className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                            htmlFor="school"
                          >
                            School <span className="text-red">*</span>
                          </label>
                          <Select
                            options={filteredOptions}
                            onChange={handlePartnerChange}
                            onInputChange={handleInputChange}
                            components={{ MenuList: CustomMenuList }}
                            placeholder="Select a school..."
                            noOptionsMessage={() =>
                              searchInput?.length > 0
                                ? 'No school with the searched name'
                                : 'No options available'
                            }
                            className="min-h-[48px] w-full "
                            value={
                              formData.requestedPartner
                                ? {
                                    value: formData.requestedPartner,
                                    label:
                                      partners.find(
                                        (partner) =>
                                          partner.id ===
                                          formData.requestedPartner,
                                      )?.name || '',
                                  }
                                : null
                            }
                          />
                        </div>
                      )}

                    {isInstitution && (
                      <>
                        <SelectEmployerIds
                          onChange={(name, value) =>
                            setFormData((pre) => ({ ...pre, [name]: value }))
                          }
                          defaultValue={formData?.requestedEmployerIds}
                          setShowEmployerFields={setShowEmployerFields}
                          loading={isLoading.employers}
                        />
                      </>
                    )}

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                        htmlFor="expectedAttendees"
                      >
                        Expected Attendees
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="number"
                          name="expectedAttendees"
                          value={formData?.expectedAttendees}
                          onChange={onChange}
                          id="expectedAttendees"
                          placeholder="Expected Attendees"
                        />
                      </div>
                    </div>
                  </div>

                  {isInstitution && showEmployerFields && (
                    <>
                      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/2">
                          <label className="mb-3 block text-start text-sm font-medium text-black dark:text-white">
                            Employer Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="name"
                              value={employerData?.name}
                              onChange={(e) =>
                                setEmployerData((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Enter your full name"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                          </div>
                        </div>
                        {/* Email */}
                        <div className="mb-4 w-full sm:w-1/2">
                          <label className="mb-3 block text-start text-sm font-medium text-black dark:text-white">
                            Employer Email
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              value={employerData?.email}
                              onChange={(e) =>
                                setEmployerData((p) => ({
                                  ...p,
                                  email: e.target.value,
                                }))
                              }
                              placeholder="Enter your email"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/2">
                          <label className="mb-3 block text-start text-sm font-medium text-black dark:text-white">
                            Branch Location
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="branchLocation"
                              value={employerData?.branchLocation}
                              onChange={(e) =>
                                setEmployerData((p) => ({
                                  ...p,
                                  branchLocation: e.target.value,
                                }))
                              }
                              placeholder="Enter branch location"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                          </div>
                        </div>
                        {/* Address Line 1 */}
                        <div className="mb-4 w-full sm:w-1/2">
                          <label className="mb-3 block text-start text-sm font-medium text-black dark:text-white">
                            Address Line 1
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="addressLine1"
                              value={employerData?.addressLine1}
                              onChange={(e) =>
                                setEmployerData((p) => ({
                                  ...p,
                                  addressLine1: e.target.value,
                                }))
                              }
                              placeholder="Enter address line 1"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Description */}
              <div className="mb-5.5">
                <label
                  className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                  htmlFor="description"
                >
                  Description
                </label>
                <div className="relative">
                  <textarea
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    name="description"
                    id="description"
                    value={formData?.description}
                    onChange={onChange}
                    rows={6}
                    placeholder="Write description here"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4.5">
                <button
                  className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="flex justify-center rounded bg-[#1C2434] px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                  type="submit"
                  disabled={isLoading.submit}
                >
                  {isLoading.submit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
