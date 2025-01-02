import React, { useState, FormEvent, useRef } from 'react';
// import { Loader2, Check, PauseCircle } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { RootState } from '../../store/store';
import toast from 'react-hot-toast';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { validate } from 'email-validator';
import {
  deleteEmployerApi,
  fetchEmployersByEmailApi,
  // setEmployerApi,
} from '../../store/reducers/employersSlice';
// import { UserRolesEnum } from '../../utils/enums';
import { ChevronDown } from 'lucide-react';
import {
  deleteUserApi,
  fetchUserByEmailApi,
  // getIsAllowedDomain,
  // setUserApi,
} from '../../store/reducers/userSlice';
import {
  deleteJobApi,
  fetchJobByEmployerIdApi,
  // setJobApi,
} from '../../store/reducers/jobSlice';
// import { addLatLong } from '../../utils/functions';
import {
  deleteEventApi,
  fetchEventsByEmployerIdApi,
  fetchEventsByPartnerIdApi,
  // setEventApi,
} from '../../store/reducers/eventSlice';
import {
  deleteUserApplicationApi,
  fetchUserApplicationsByApplicantIdApi,
  // fetchUserApplicationsByEmployerEmail,
  fetchUserApplicationsByEmployerIdApi,
  // fetchUserApplicationsByJobIdApi,
  // setUserApplicationApi,
} from '../../store/reducers/userApplicationsSlice';
import {
  deleteChatApi,
  deleteMessageApi,
  fetchChatsByParticipantUserIdApi,
  fetchMessagesApi,
  // setChatApi,
  // setChatMessageApi,
} from '../../store/reducers/chatSlice';
import CLoader from '../../common/CLoader';
import StatusItem from '../../components/Status';
import {
  deletePartnerApi,
  fetchPartnerByEmailApi,
} from '../../store/reducers/partnerSlice';

const DeleteAccount: React.FC = () => {
  // const dispatch = useDispatch();
  const modal = useRef<any>(null);
  // const { user } = useSelector((state: RootState) => state.user);
  // const authUser = localStorage.getItem('auth')
  //   ? JSON.parse(localStorage.getItem('auth'))
  //   : null;

  const [email, setEmail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [disableRun, setDisableRun] = useState<boolean>(false);
  const [updateProcessRunning, setUpdateProcessRunning] =
    useState<boolean>(false);
  const [showDeleteAccountConfirmModal, setDeleteTransferAccountConfirmModal] =
    useState<boolean>(false);
  const [updatedUsersCount, setUpdatedUsersCount] = useState<{
    total: number;
    isProcessing: number;
  }>({
    total: 0,
    isProcessing: 0,
  });
  const [updatedEmployersCount, setUpdatedEmployersCount] = useState<{
    total: number;
    isProcessing: number;
  }>({
    total: 0,
    isProcessing: 0,
  });
  const [updatedPartnersCount, setUpdatedPartnersCount] = useState<{
    total: number;
    isProcessing: number;
  }>({
    total: 0,
    isProcessing: 0,
  });

  const [updatedJobsCount, setUpdatedJobsCount] = useState<{
    total: number;
    isProcessing: number;
  }>({
    total: 0,
    isProcessing: 0,
  });

  const [updatedEventsCount, setUpdatedEventsCount] = useState<{
    total: number;
    isProcessing: number;
  }>({
    total: 0,
    isProcessing: 0,
  });
  const [updatedUserApplicationsCount, setUpdatedUserApplicationsCount] =
    useState<{
      total: number;
      isProcessing: number;
    }>({
      total: 0,
      isProcessing: 0,
    });
  const [updatedChatsCount, setUpdatedChatsCount] = useState<{
    total: number;
    isProcessing: number;
  }>({
    total: 0,
    isProcessing: 0,
  });
  const [updatedMessagesCount, setUpdatedMessagesCount] = useState<{
    total: number;
    isProcessing: number;
  }>({
    total: 0,
    isProcessing: 0,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEmp, setIsOpenEmp] = useState(false);
  const [isOpenPartner, setIsOpenPartner] = useState(false);
  const [showEmpDropDown, setShowEmpDropDown] = useState(false);
  const [showPartnerDropDown, setShowPartnerDropDown] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedOptionEmp, setSelectedOptionEmp] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [selectedOptionPartner, setSelectedOptionPartner] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [employers, setEmployers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [allChats, setAllChats] = useState([]);
  const [allUserApplications, setAllUserApplications] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  // const [user] = useState<any>(undefined);
  const [userSpecified, setUserSpecified] = useState<any>(undefined);
  // const [employerSpecified, setEmployerSpecified] = useState<any>(undefined);
  const [employerSpecified] = useState<any>(undefined);
  const [partnerSpecified, setPartnerSpecified] = useState<any>(undefined);
  const [allMessages, setAllMessages] = useState([]);
  const [isEmployersChecked, setIsEmployersChecked] = useState(false);
  const [isPartnersChecked, setIsPartnersChecked] = useState(false);
  const [isUsersChecked, setIsUsersChecked] = useState(false);
  const [isJobsChecked, setIsJobsChecked] = useState(false);
  const [isEventsChecked, setIsEventsChecked] = useState(false);
  const [isUserApplicationsChecked, setIsUserApplicatiosChecked] =
    useState(false);
  const [isChatsChecked, setIsChatsChecked] = useState(false);
  const [isMessagesChecked, setIsMessagesChecked] = useState(false);

  const handleUsersCheckboxChange = (e) => {
    setIsUsersChecked(e.target.checked);
  };
  const handleEmployersCheckboxChange = (e) => {
    setIsEmployersChecked(e.target.checked);
  };
  const handlePartnersCheckboxChange = (e) => {
    setIsPartnersChecked(e.target.checked);
  };

  const handleJobsCheckboxChange = (e) => {
    setIsJobsChecked(e.target.checked);
  };

  const handleEventsCheckboxChange = (e) => {
    setIsEventsChecked(e.target.checked);
  };
  const handleUserApplicationsCheckboxChange = (e) => {
    setIsUserApplicatiosChecked(e.target.checked);
  };
  const handleChatsCheckboxChange = (e) => {
    setIsChatsChecked(e.target.checked);
  };
  const handleMessagesCheckboxChange = (e) => {
    setIsMessagesChecked(e.target.checked);
  };

  const handleBlur = async () => {
    if (!!email && validate(email)) {
      if (selectedOption?.id === 'employer') {
        const tempEmployers = await fetchEmployersByEmailApi(email);
        if (tempEmployers?.length === 0) {
          setEmployers([]);
          toast.error('Employers not found. Please try again');
        } else {
          const sortedEmployers = sortByName(tempEmployers);
          setEmployers(sortedEmployers);
        }
      } else if (selectedOption.id === 'institution') {
        const tempPartners = await fetchPartnerByEmailApi(email);
        if (tempPartners?.length === 0) {
          setPartners([]);
          toast.error('Partners not found. Please try again');
        } else {
          const sortedPartners = sortByName(tempPartners);
          setPartners(sortedPartners);
        }
      } else if (!email) {
        toast.error('Operation cannot be performed without a valid From email');
      }
    }
  };

  const handleFocus = () => {
    setIsOpen(false);
  };

  const sortByName = (unsorted) => {
    if (unsorted?.length === 0) {
      return;
    }

    let sorted = [...unsorted].sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    sorted = sorted.map((e) => {
      if (!e.name || e.name.trim() === '') {
        e.name = e.id; // Replace name with id if it's undefined, null, or an empty string
      }
      return e; // Return the updated object
    });
    return sorted;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdownEmp = () => {
    setIsOpenEmp(!isOpenEmp);
  };

  const toggleDropdownPartner = () => {
    setIsOpenPartner(!isOpenPartner);
  };

  const handleSelectEmp = (id: string, name: string) => {
    setSelectedOptionEmp({ id, name });
    setIsOpenEmp(false);
  };

  const handleSelectPartner = (id: string, name: string) => {
    setSelectedOptionPartner({ id, name });
    setIsOpenPartner(false);
  };

  const handleSelect = (id: string, name: string) => {
    setSelectedOption({ id, name });
    setIsOpen(false);
    if (id === 'employer') {
      setShowEmpDropDown(true);
    } else {
      setShowEmpDropDown(false);
    }

    if (id === 'institution') {
      setShowPartnerDropDown(true);
    } else {
      setShowPartnerDropDown(false);
    }
  };

  const handleDeleteAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isEmailCorrect = !!email && validate(email);

    if (!selectedOption) {
      toast.error('Account type should be selected');
      return;
    }

    if (!isEmailCorrect) {
      toast.error('Email should be a valid email');
      return;
    }

    if (selectedOption.id === 'employer' && !selectedOptionEmp) {
      toast.error('Employer should be selected');
      return;
    }

    setIsProcessing(true);
    setDeleteTransferAccountConfirmModal(true);
    try {
      let tempAllJobs;
      let tempAllEvents;
      let tempAllUserApplications;
      let tempAllChats;

      // Fetch user by email
      const tempUser = await fetchUserByEmailApi(email);
      if (!(tempUser && tempUser.email)) {
        toast.error('No user found, please try again');
        return;
      }

      setUserSpecified(tempUser.id);

      // Validate user roles and retrieve data based on selected options
      if (selectedOption.id === 'employer') {
        if (
          tempUser.role?.some((role) =>
            ['SuperAdmin', 'Counsellor', 'Teacher', 'JobSeeker'].includes(role),
          )
        ) {
          toast.error('Cannot retrieve data. User is not an Employer');
          return;
        }

        if (selectedOptionEmp.id === 'select-all-employers') {
          // Iterate over all employers if 'select-all-employers' is selected
          const employersData = employers.map(async (employer) => {
            const jobs = await fetchJobByEmployerIdApi(employer.id);
            const events = await fetchEventsByEmployerIdApi(employer.id);
            const userApplications = await fetchUserApplicationsByEmployerIdApi(
              employer.id,
            );
            const allChatsArray = await fetchChatsByParticipantUserIdApi(
              tempUser.id,
            );
            const allChats = allChatsArray.filter((chat) =>
              chat.participantsDetails?.some(
                (participant) =>
                  participant.isEmployer &&
                  participant.userId === tempUser.id &&
                  participant.id === employer.id,
              ),
            );

            return {
              employer,
              jobs,
              events,
              userApplications,
              allChats,
            };
          });
          const allEmployersData = await Promise.all(employersData);

          tempAllJobs = allEmployersData.flatMap((data) => data.jobs);
          tempAllEvents = allEmployersData.flatMap((data) => data.events);
          tempAllUserApplications = allEmployersData.flatMap(
            (data) => data.userApplications,
          );
          tempAllChats = allEmployersData.flatMap((data) => data.allChats);
        } else {
          // Fetch data for a single selected employer
          const employerId = selectedOptionEmp.id;
          tempAllJobs = await fetchJobByEmployerIdApi(employerId);
          tempAllEvents = await fetchEventsByEmployerIdApi(employerId);
          tempAllUserApplications =
            await fetchUserApplicationsByEmployerIdApi(employerId);

          const allChatsArray = await fetchChatsByParticipantUserIdApi(
            tempUser.id,
          );
          tempAllChats = allChatsArray.filter((chat) =>
            chat.participantsDetails?.some(
              (participant) =>
                participant.isEmployer &&
                participant.userId === tempUser.id &&
                participant.id === employerId,
            ),
          );
        }
      }

      if (selectedOption.id === 'institution') {
        if (
          tempUser.role?.some((role) =>
            ['SuperAdmin', 'Employer', 'Student', 'JobSeeker'].includes(role),
          )
        ) {
          toast.error('Cannot retrieve data. User is not a Partner');
          return;
        }
        setPartnerSpecified(selectedOptionPartner.id);
        const partnerId = selectedOptionPartner.id;
        tempAllEvents = await fetchEventsByPartnerIdApi(partnerId);

        const allChatsArray = await fetchChatsByParticipantUserIdApi(
          selectedOptionPartner.id,
        );

        tempAllChats = allChatsArray.filter((chat) => {
          const remainingParticipants = chat.participantsDetails?.filter(
            (participant) => participant.userId !== selectedOptionPartner.id,
          );

          return remainingParticipants?.length < 2;
        });
      }

      if (selectedOption.id === 'student') {
        if (
          tempUser.role?.some((role) =>
            [
              'SuperAdmin',
              'Admin',
              'Employer',
              'Counsellor',
              'Teacher',
            ].includes(role),
          )
        ) {
          toast.error(
            'Cannot retrieve data. User is a Superadmin, Employer Or Partner',
          );
          return;
        }
        const studentUser = tempUser.id;
        tempAllUserApplications =
          await fetchUserApplicationsByApplicantIdApi(studentUser);

        const allChatsArray = await fetchChatsByParticipantUserIdApi(
          tempUser.id,
        );
        tempAllChats = allChatsArray.filter((chat) => {
          const remainingParticipants = chat.participantsDetails?.filter(
            (participant) => participant.userId !== tempUser.id,
          );
          return remainingParticipants?.length < 2;
        });
      }

      const messagesArray = await Promise.all(
        tempAllChats.map(async (chat) => {
          const messages = await fetchMessagesApi(chat.id, tempUser.id);
          return messages.map((message) => ({ ...message, chatId: chat.id }));
        }),
      );

      const tempAllMessages = messagesArray.flat();

      setAllJobs(tempAllJobs);
      setAllEvents(tempAllEvents);
      setAllUserApplications(tempAllUserApplications);
      setAllChats(tempAllChats);
      setAllMessages(tempAllMessages);

      setUpdatedUsersCount({ total: 1, isProcessing: 0 });
      if (selectedOption.id === 'employer') {
        const t =
          selectedOptionEmp.id === 'select-all-employers'
            ? employers.length
            : 1;
        setUpdatedEmployersCount({ total: t, isProcessing: 0 });
      }

      if (selectedOption.id === 'institution') {
        setUpdatedPartnersCount({ total: 1, isProcessing: 0 });
      }

      setUpdatedJobsCount({
        total: tempAllJobs?.length || 0,
        isProcessing: 0,
      });
      setUpdatedEventsCount({
        total: tempAllEvents?.length || 0,
        isProcessing: 0,
      });
      setUpdatedUserApplicationsCount({
        total: tempAllUserApplications?.length || 0,
        isProcessing: 0,
      });
      setUpdatedChatsCount({
        total: tempAllChats?.length || 0,
        isProcessing: 0,
      });
      setUpdatedMessagesCount({
        total: tempAllMessages?.length || 0,
        isProcessing: 0,
      });
    } catch (error) {
      console.error('Error during retrieval:', error);
      toast.error('An error occurred during the data retrieval process');
    } finally {
      // Set processing to false after everything is done
      setIsProcessing(false);
    }
  };

  async function handleYesClick(): Promise<void> {
    setDisableRun(true);
    setUpdateProcessRunning(true);
    const isEmailCorrect = !!email && validate(email);

    if (!selectedOption) {
      toast.error('Account type should be selected');
      return;
    }

    if (!isEmailCorrect) {
      toast.error('Email should be a valid email');
      return;
    }

    if (selectedOption.id === 'employer' && !selectedOptionEmp) {
      toast.error('Employer should be selected');
      return;
    }

    if (selectedOption.id === 'institution' && !selectedOptionPartner) {
      toast.error('Partner should be selected');
      return;
    }

    try {
      if (isEmployersChecked && selectedOption.id === 'employer') {
        if (selectedOptionEmp.id === 'select-all-employers') {
          await Promise.all(
            employers.map(async (emp) => {
              await deleteEmployer(emp.id);

              return emp;
            }),
          );
          setUpdatedEmployersCount({
            ...updatedEmployersCount,
            isProcessing: 2,
          });
        } else {
          await deleteEmployer(employerSpecified);
        }
      }

      if (isEmployersChecked && selectedOption.id === 'institution') {
        await deletePartner(partnerSpecified);
      }
      if (isJobsChecked && allJobs?.length > 0) {
        await deleteJobs(allJobs);
      }
      if (isEventsChecked && allEvents?.length > 0) {
        await deleteEvents(allEvents);
      }
      if (isUserApplicationsChecked && allUserApplications?.length > 0) {
        await deleteUserApplications(allUserApplications);
      }
      if (isChatsChecked && allChats?.length > 0) {
        await deleteChats(allChats);
      }
      if (isMessagesChecked && allMessages?.length > 0) {
        await deleteMessages(allMessages);
      }

      if (isUsersChecked) {
        await deleteUser(userSpecified);
      }

      setSelectedOption(null);
      setUpdateProcessRunning(false);
    } catch (error) {
      console.error('Error during handleYesClick:', error);
      toast.error('An error occurred while processing the request.');
    } finally {
      window.location.reload();
    }
  }
  async function deleteUser(_id: string) {
    setUpdatedUsersCount({
      ...updatedUsersCount,
      isProcessing: 1,
    });

    const response = await deleteUserApi(_id);

    if (response.success) {
      toast.success('User deleted successfully');
    } else {
      toast.error(`Failed to delete user`);
    }

    setUpdatedEmployersCount({
      ...updatedEmployersCount,
      isProcessing: 2,
    });
  }

  async function deleteEmployer(_id) {
    setUpdatedEmployersCount({
      ...updatedEmployersCount,
      isProcessing: 1,
    });
    await deleteEmployerApi(_id);
    setUpdatedEmployersCount({
      ...updatedEmployersCount,
      isProcessing: 2,
    });
  }
  async function deletePartner(_id) {
    setUpdatedPartnersCount({
      ...updatedPartnersCount,
      isProcessing: 1,
    });
    await deletePartnerApi(_id);
    setUpdatedPartnersCount({
      ...updatedPartnersCount,
      isProcessing: 2,
    });
  }

  async function deleteMessages(allMessagesArray: any[]) {
    //allMessagesArray = allMessagesArray.slice(0, 1);
    setUpdatedMessagesCount({
      ...updatedMessagesCount,
      isProcessing: 1,
    });

    await Promise.all(
      allMessagesArray.map(async (message) => {
        await deleteMessageApi(message.chatId, message.id);
        return message;
      }),
    );

    setUpdatedMessagesCount({
      ...updatedMessagesCount,
      isProcessing: 2,
    });
  }

  async function deleteChats(allChats: any[]) {
    //allChats = allChats.slice(0, 1);
    setUpdatedChatsCount({
      ...updatedChatsCount,
      isProcessing: 1,
    });

    await Promise.all(
      allChats.map(async (c) => {
        await deleteChatApi(c.id);
        return c;
      }),
    );

    setUpdatedChatsCount({
      ...updatedChatsCount,
      isProcessing: 2,
    });
  }

  async function deleteUserApplications(allUserApplications: any[]) {
    //allUserApplications = allUserApplications.slice(0, 1);
    setUpdatedUserApplicationsCount({
      ...updatedUserApplicationsCount,
      isProcessing: 1,
    });

    await Promise.all(
      allUserApplications.map(async (userApplication) => {
        await deleteUserApplicationApi(userApplication.id);

        return userApplication;
      }),
    );
    setUpdatedUserApplicationsCount({
      ...updatedUserApplicationsCount,
      isProcessing: 2,
    });
  }

  async function deleteEvents(allEvents: any[]) {
    setUpdatedEventsCount({
      ...updatedEventsCount,
      isProcessing: 1,
    });

    await Promise.all(
      allEvents.map(async (event) => {
        await deleteEventApi(event.id);
        return event;
      }),
    );

    setUpdatedEventsCount({
      ...updatedEventsCount,
      isProcessing: 2,
    });
  }

  async function deleteJobs(allJobs: any[]) {
    //allJobs = allJobs.slice(0, 1);
    setUpdatedJobsCount({
      ...updatedJobsCount,
      isProcessing: 1,
    });

    await Promise.all(
      allJobs.map(async (job) => {
        await deleteJobApi(job.id);
        return job;
      }),
    );
    setUpdatedJobsCount({
      ...updatedJobsCount,
      isProcessing: 2,
    });
  }

  function handleNoClick(): void {
    reset();
  }

  function handleCloseClick(): void {
    reset();
  }

  function reset(): void {
    setUpdatedJobsCount({ isProcessing: 0, total: 0 });
    setUpdatedUsersCount({ isProcessing: 0, total: 0 });
    setUpdatedChatsCount({ isProcessing: 0, total: 0 });
    setUpdatedEmployersCount({ isProcessing: 0, total: 0 });
    setUpdatedPartnersCount({ isProcessing: 0, total: 0 });
    setUpdatedEventsCount({ isProcessing: 0, total: 0 });
    setUpdatedUserApplicationsCount({ isProcessing: 0, total: 0 });
    setUpdatedMessagesCount({ isProcessing: 0, total: 0 });
    setIsProcessing(false);
    setDeleteTransferAccountConfirmModal(false);
    setDisableRun(false);
    setUpdateProcessRunning(false);
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="mx-auto max-w-md w-full">
          <div className="mb-4">
            <Breadcrumb pageName="Delete Account" />
          </div>
          <div className="mb-8">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-7">
                <form onSubmit={handleDeleteAccount}>
                  <div className="mb-5.5">
                    <label className="mb-3 block text-medium font-medium text-black dark:text-white">
                      Account type
                    </label>
                    <div className="relative w-full">
                      <div
                        onClick={toggleDropdown}
                        className="border border-gray-300 text-start w-full rounded bg-white px-5 py-2.5 font-normal text-black outline-none transition dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary cursor-pointer flex justify-between items-center"
                      >
                        {selectedOption
                          ? selectedOption.name
                          : 'Select an Option'}
                        <span className="flex items-center pr-2">
                          <ChevronDown />
                        </span>
                      </div>
                      {isOpen && (
                        <ul className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto bg-white border border-stroke rounded shadow-lg dark:bg-form-input dark:border-form-strokedark">
                          <li
                            onClick={() => handleSelect('student', 'Student')}
                            className={`px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                              selectedOption?.id === 'student'
                                ? 'bg-gray-300 dark:bg-gray-600'
                                : ''
                            }`}
                          >
                            Student
                          </li>
                          <li
                            onClick={() => handleSelect('employer', 'Employer')}
                            className={`px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                              selectedOption?.id === 'employer'
                                ? 'bg-gray-300 dark:bg-gray-600'
                                : ''
                            }`}
                          >
                            Employer
                          </li>
                          <li
                            onClick={() =>
                              handleSelect('institution', 'Institution')
                            }
                            className={`px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                              selectedOption?.id === 'institution'
                                ? 'bg-gray-300 dark:bg-gray-600'
                                : ''
                            }`}
                          >
                            Institution
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="mb-5.5">
                    <label className="mb-3 block text-medium font-medium text-black dark:text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                    />
                  </div>
                  {showEmpDropDown && (
                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-medium font-medium text-black dark:text-white"
                        htmlFor="newPassword"
                      >
                        Select Employer
                      </label>
                      <div className="relative w-full">
                        <div
                          onClick={toggleDropdownEmp}
                          className="border border-gray-300 text-start w-full rounded bg-white px-5 py-2.5 font-normal text-black outline-none transition dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary cursor-pointer flex justify-between items-center"
                        >
                          {selectedOptionEmp
                            ? selectedOptionEmp.name
                            : 'Select an Employer'}
                          <span className="flex items-center pr-2">
                            <ChevronDown />
                          </span>
                        </div>
                        {isOpenEmp && (
                          <ul className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto bg-white border border-stroke rounded shadow-lg dark:bg-form-input dark:border-form-strokedark">
                            {employers?.map((emp) => (
                              <li
                                key={emp.id}
                                onClick={() =>
                                  handleSelectEmp(emp.id, emp.name)
                                }
                                className={`px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                  selectedOptionEmp?.id === emp.id
                                    ? 'bg-gray-300 dark:bg-gray-600'
                                    : ''
                                }`}
                              >
                                {emp.name}
                              </li>
                            ))}
                            <li
                              key="select-all-employers"
                              onClick={() =>
                                handleSelectEmp(
                                  'select-all-employers',
                                  'All Employers',
                                )
                              }
                              className={`px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                selectedOptionEmp?.id === 'all'
                                  ? 'bg-gray-300 dark:bg-gray-600'
                                  : ''
                              }`}
                            >
                              Select All
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  {showPartnerDropDown && (
                    <div className="mb-5.5">
                      <label className="mb-3 block text-medium font-medium text-black dark:text-white">
                        Select Partner
                      </label>
                      <div className="relative w-full">
                        <div
                          onClick={toggleDropdownPartner}
                          className="border border-gray-300 text-start w-full rounded bg-white px-5 py-2.5 font-normal text-black outline-none transition dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary cursor-pointer flex justify-between items-center"
                        >
                          {selectedOptionPartner
                            ? selectedOptionPartner.name
                            : 'Select an institution'}
                          <span className="flex items-center pr-2">
                            <ChevronDown />
                          </span>
                        </div>
                        {isOpenPartner && (
                          <ul className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto bg-white border border-stroke rounded shadow-lg dark:bg-form-input dark:border-form-strokedark">
                            {partners?.map((p) => (
                              <li
                                key={p.id}
                                onClick={() =>
                                  handleSelectPartner(p.id, p.name)
                                }
                                className={`px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                  selectedOptionPartner?.id === p.id
                                    ? 'bg-gray-300 dark:bg-gray-600'
                                    : ''
                                }`}
                              >
                                {p.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-[#1C2434] px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                      type="submit"
                      disabled={isProcessing}
                    >
                      Delete Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDeleteAccountConfirmModal && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
          <div
            ref={modal}
            className="relative max-h-[90vh] max-w-[600px] min-h-[40vh] w-[90vw] space-y-4 overflow-auto rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:px-12 md:py-8"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseClick}
              disabled={updateProcessRunning}
              className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 text-white text-2xl font-bold bg-blue-500 rounded-full hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              aria-label="Close"
            >
              &times;
            </button>

            {isProcessing ? (
              <div className="flex justify-center items-center w-full h-full absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <CLoader size="lg" />
              </div>
            ) : (
              <>
                <div className="flex w-full items-center justify-between">
                  <h4 className="text-2xl font-semibold text-black dark:text-white">
                    Are you sure you want to delete all records of this account?
                    This operation cannot be stopped.
                  </h4>
                </div>
                <div className="flex w-full items-center justify-between">
                  <h5>Employer Id: {selectedOptionEmp?.id}</h5>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isUsersChecked}
                        onChange={handleUsersCheckboxChange}
                      />

                      <StatusItem
                        name="users"
                        status={updatedUsersCount.isProcessing}
                        total={updatedUsersCount.total}
                        isDelete={true}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isEmployersChecked}
                        onChange={handleEmployersCheckboxChange}
                      />

                      <StatusItem
                        name="employers"
                        status={updatedEmployersCount.isProcessing}
                        total={updatedEmployersCount.total}
                        isDelete={true}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isPartnersChecked}
                        onChange={handlePartnersCheckboxChange}
                      />

                      <StatusItem
                        name="partners"
                        status={updatedPartnersCount.isProcessing}
                        total={updatedPartnersCount.total}
                        isDelete={true}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isJobsChecked}
                        onChange={handleJobsCheckboxChange}
                      />

                      <StatusItem
                        name="jobs"
                        status={updatedJobsCount.isProcessing}
                        total={updatedJobsCount.total}
                        isDelete={true}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isEventsChecked}
                        onChange={handleEventsCheckboxChange}
                      />
                      <StatusItem
                        name="events"
                        status={updatedEventsCount.isProcessing}
                        total={updatedEventsCount.total}
                        isDelete={true}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isUserApplicationsChecked}
                        onChange={handleUserApplicationsCheckboxChange}
                      />
                      <StatusItem
                        name="user applications"
                        status={updatedUserApplicationsCount.isProcessing}
                        total={updatedUserApplicationsCount.total}
                        isDelete={true}
                      />{' '}
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isChatsChecked}
                        onChange={handleChatsCheckboxChange}
                      />
                      <StatusItem
                        name="chats"
                        status={updatedChatsCount.isProcessing}
                        total={updatedChatsCount.total}
                        isDelete={true}
                      />{' '}
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={isMessagesChecked}
                        onChange={handleMessagesCheckboxChange}
                      />
                      <StatusItem
                        name="messages"
                        status={updatedMessagesCount.isProcessing}
                        total={updatedMessagesCount.total}
                        isDelete={true}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleYesClick}
                      disabled={disableRun}
                      className="mr-4 bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Yes
                    </button>
                    <button
                      onClick={handleNoClick}
                      disabled={disableRun}
                      className="mr-4 bg-slate-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      No
                    </button>
                    <button
                      onClick={handleCloseClick}
                      disabled={updateProcessRunning}
                      className="bg-slate-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default DeleteAccount;
