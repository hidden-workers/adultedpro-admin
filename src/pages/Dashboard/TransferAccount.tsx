import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Loader2, Check, PauseCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import toast from 'react-hot-toast';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { validate } from 'email-validator';
import {
  fetchEmployersByEmailApi,
  setEmployerApi,
} from '../../store/reducers/employersSlice';
import { UserRolesEnum } from '../../utils/enums';
import { ChevronDown } from 'lucide-react';
import {
  fetchUserByEmail,
  fetchUserByEmailApi,
  getIsAllowedDomain,
  setUserApi,
} from '../../store/reducers/userSlice';
import {
  fetchJobByEmployerIdApi,
  setJobApi,
} from '../../store/reducers/jobSlice';
import { addLatLong } from '../../utils/functions';
import {
  fetchEventsByEmployerIdApi,
  setEventApi,
} from '../../store/reducers/eventSlice';
import {
  fetchUserApplicationsByJobIdApi,
  setUserApplicationApi,
} from '../../store/reducers/userApplicationsSlice';
import {
  fetchChatsByParticipantUserIdApi,
  fetchMessagesApi,
  setChatApi,
  setChatMessageApi,
} from '../../store/reducers/chatSlice';
import CLoader from '../../common/CLoader';
import StatusItem from '../../components/Status';

const TransferAccount: React.FC = () => {
  const dispatch = useDispatch();
  const modal = useRef<any>(null);
  const { user } = useSelector((state: RootState) => state.user);
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;

  const [toEmail, setToEmail] = useState<string>('');
  const [fromEmail, setFromEmail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [disableRun, setDisableRun] = useState<boolean>(false);
  const [updateProcessRunning, setUpdateProcessRunning] =
    useState<boolean>(false);
  const [showTransferAccountConfirmModal, setShowTransferAccountConfirmModal] =
    useState<boolean>(false);
  const [updatedUsersCount, setUpdatedUsersCount] = useState<{
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
  const [updatedEmployersCount, setUpdatedEmployersCount] = useState<{
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
  const [selectedOption, setSelectedOption] = useState<{
    id: string;
    name: string;
    photoUrl: string;
  } | null>(null);
  const [employers, setEmployers] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [allChats, setAllChats] = useState([]);
  const [allUserApplications, setAllUserApplications] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [fromUser, setFromUser] = useState<any>(undefined);
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    dispatch<any>(fetchUserByEmail(authUser?.email));
  }, []);

  const handleBlur = async () => {
    if (!!fromEmail && validate(fromEmail)) {
      const tempFromUser = await fetchUserByEmailApi(fromEmail);
      setFromUser(tempFromUser);

      const emps = await fetchEmployersByEmailApi(fromEmail);
      if (emps?.length === 0) {
        setEmployers([]);
        toast.error('Employers not found. Please try again');
      } else {
        const allEmployersForFromAddress = sortEmployers(emps);
        setEmployers(allEmployersForFromAddress);
      }
    } else if (fromEmail) {
      toast.error('Operation cannot be performed without a valid From email');
    }
  };

  const handleFocus = () => {
    setIsOpen(false);
  };

  const sortEmployers = (unsortedEmployers) => {
    if (unsortedEmployers?.length === 0) {
      return;
    }

    let sortedEmployers = [...unsortedEmployers].sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    sortedEmployers = sortedEmployers.filter((e) => e.name.trim() !== '');

    return sortedEmployers;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (id: string, name: string, photoUrl: string) => {
    setSelectedOption({ id, name, photoUrl });
    setIsOpen(false);
  };

  const handleTransferAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isFromEmailCorrect = !!fromEmail && validate(fromEmail);
    const isToEmailCorrect = !!toEmail && validate(toEmail);

    if (!isFromEmailCorrect) {
      toast.error('From Email should be a valid email');
      return;
    }

    if (!isToEmailCorrect) {
      toast.error('To Email should be a valid email');
      return;
    }

    if (!selectedOption) {
      toast.error('Employer should be selected');
      return;
    }

    if (!fromUser) {
      toast.error('From email user not found');
      return;
    }

    setIsProcessing(true);
    setShowTransferAccountConfirmModal(true);
    try {
      const employerId = selectedOption.id;

      // Fetch jobs
      const tempAllJobs = await fetchJobByEmployerIdApi(employerId);

      // Fetch events
      const tempAllEvents = await fetchEventsByEmployerIdApi(employerId);

      // Fetch applications
      const applicationsArray = await Promise.all(
        tempAllJobs.map((job) => fetchUserApplicationsByJobIdApi(job.id)),
      );
      const tempAllUserApplications = applicationsArray.flat();

      // Fetch chats
      const chatsArray = await fetchChatsByParticipantUserIdApi(fromUser?.id);
      const tempAllChats = chatsArray.filter((chat) =>
        chat.participantsDetails?.some(
          (participant) =>
            participant.isEmployer &&
            participant.userId === fromUser.id &&
            participant.id === employerId,
        ),
      );

      // Fetch messages
      const messagesArray = await Promise.all(
        tempAllChats.map((chat) => fetchMessagesApi(chat.id, fromUser.id)),
      );
      const tempAllMessages = messagesArray.flat();

      // Update state after all data has been fetched
      setAllJobs(tempAllJobs);
      setAllEvents(tempAllEvents);
      setAllUserApplications(tempAllUserApplications);
      setAllChats(tempAllChats);
      setAllMessages(tempAllMessages);

      // Update counts
      setUpdatedEmployersCount({ total: 1, isProcessing: 0 });
      setUpdatedUsersCount({ total: 1, isProcessing: 0 });
      setUpdatedJobsCount({ total: tempAllJobs.length || 0, isProcessing: 0 });
      setUpdatedEventsCount({
        total: tempAllEvents.length || 0,
        isProcessing: 0,
      });
      setUpdatedUserApplicationsCount({
        total: tempAllUserApplications.length || 0,
        isProcessing: 0,
      });
      setUpdatedChatsCount({
        total: tempAllChats.length || 0,
        isProcessing: 0,
      });
      setUpdatedMessagesCount({
        total: tempAllMessages.length || 0,
        isProcessing: 0,
      });
    } catch (error) {
      console.error('Error during transfer:', error);
      toast.error('An error occurred during the transfer process');
    } finally {
      // Set processing to false after everything is done
      setIsProcessing(false);
    }
  };

  async function handleYesClick(): Promise<void> {
    setDisableRun(true);
    setUpdateProcessRunning(true);
    if (!user?.role?.includes(UserRolesEnum.SuperAdmin)) {
      return;
    }

    try {
      if (selectedOption) {
        let toUser = await fetchUserByEmailApi(toEmail);
        if (!toUser) {
          const tempUser = {
            email: toEmail,
            name: selectedOption.name,
            photoUrl: selectedOption.photoUrl,
            role: [UserRolesEnum.Employer],
          };

          toUser = await setUserApi(tempUser);
          setUpdatedUsersCount({
            ...updatedUsersCount,
            isProcessing: updatedUsersCount.isProcessing + 1,
          });
        }

        if (!toUser) {
          toast.error('To User not found and could not be created');
          return;
        }

        const employer = employers.find((x) => x.id === selectedOption.id);
        if (!employer) {
          toast.error('Selected Employer not found');
          return;
        }

        await updateEmployer(employer, toUser);

        let updatedJobs;
        if (allJobs?.length > 0) {
          updatedJobs = await updateJobs(allJobs, toUser, employer, fromUser);
        }

        if (allEvents?.length > 0) {
          await updateEvents(allEvents, toUser, employer, fromUser);
        }

        if (allUserApplications?.length > 0) {
          await updateUserApplications(
            allUserApplications,
            toUser,
            employer,
            fromUser,
            updatedJobs,
          );
        }

        if (allChats?.length > 0) {
          await updateChats(allChats, toUser, employer, fromUser);
        }

        if (allMessages?.length > 0) {
          await updateMessages(allMessages, toUser, fromUser);
        }

        // Update employers state after all async tasks are done
        setEmployers((prevEmployers) =>
          prevEmployers.filter((employer) => employer.id !== selectedOption.id),
        );

        setSelectedOption(null);
        setUpdateProcessRunning(false);
      }
    } catch (error) {
      console.error('Error during handleYesClick:', error);
      toast.error('An error occurred while processing the request.');
    }
  }

  async function updateEmployer(employer, toUser) {
    setUpdatedEmployersCount({
      ...updatedEmployersCount,
      isProcessing: 1,
    });
    employer.userId = toUser.id;
    employer.email = toUser.email;
    if (getIsAllowedDomain(toUser.email)) {
      employer.contactEmail = toUser.email;
    }
    if (getIsAllowedDomain(toUser.email)) {
      employer.contactName = employer.name;
    }

    await setEmployerApi(employer);
    setUpdatedEmployersCount({
      ...updatedEmployersCount,
      isProcessing: 2,
    });
  }

  async function updateMessages(
    allMessagesArray: any[],
    toUser: any,
    fromUser: any,
  ): Promise<any[]> {
    setUpdatedMessagesCount({
      ...updatedMessagesCount,
      isProcessing: 1,
    });

    const updatedMessages = await Promise.all(
      allMessagesArray.map(async (message) => {
        const readByArray = message?.readBy || [];
        message.readBy = readByArray.filter((item) => item !== fromUser.id);
        message.senderId = toUser.id;
        await setChatMessageApi(message);
        return message;
      }),
    );

    setUpdatedMessagesCount({
      ...updatedMessagesCount,
      isProcessing: 2,
    });
    return updatedMessages;
  }

  async function updateChats(
    allChats: any[],
    toUser: any,
    employer: any,
    fromUser: any,
  ): Promise<any[]> {
    setUpdatedChatsCount({
      ...updatedChatsCount,
      isProcessing: 1,
    });

    const updatedChats = await Promise.all(
      allChats.map(async (chat) => {
        const updatedParticipantDetails = chat.participantsDetails.map(
          (participant) => {
            if (
              participant.isEmployer &&
              participant.id === employer.id &&
              participant.userId === fromUser.id
            ) {
              return {
                ...participant,
                userId: toUser.id,
                email: toUser.email,
              };
            }
            return participant;
          },
        );
        chat.participantsDetails = updatedParticipantDetails;
        const updatedParticipants = chat.participants.map((participantId) =>
          participantId === fromUser.id ? toUser.id : participantId,
        );
        chat.participants = updatedParticipants;
        await setChatApi(chat);

        return chat;
      }),
    );

    setUpdatedChatsCount({
      ...updatedChatsCount,
      isProcessing: 2,
    });
    return updatedChats;
  }

  async function updateUserApplications(
    allUserApplications: any[],
    toUser: any,
    employer: any,
    fromUser: any,
    updatedJobs: any,
  ): Promise<any[]> {
    setUpdatedUserApplicationsCount({
      ...updatedUserApplicationsCount,
      isProcessing: 1,
    });

    const updateUserApplications = await Promise.all(
      allUserApplications.map(async (userApplication) => {
        userApplication.employer = employer;
        userApplication.employerId = employer.id;
        userApplication.employerEmail = toUser.email;

        if (getIsAllowedDomain(fromUser.email)) {
          userApplication.contactEmail = toUser.email;
        }

        if (userApplication.job && updatedJobs?.length > 0) {
          const thisJob = updatedJobs.find(
            (x) => x.id === userApplication.jobId,
          );
          userApplication.job = thisJob;
        }

        await setUserApplicationApi(userApplication);

        return userApplication;
      }),
    );
    setUpdatedUserApplicationsCount({
      ...updatedUserApplicationsCount,
      isProcessing: 2,
    });
    return updateUserApplications;
  }

  async function updateEvents(
    allEvents: any[],
    toUser,
    employer: any,
    fromUser: any,
  ): Promise<any[]> {
    setUpdatedEventsCount({
      ...updatedEventsCount,
      isProcessing: 1,
    });

    const updatedEvents = await Promise.all(
      allEvents.map(async (event) => {
        event.contactEmail = event.contactEmail.toLowerCase();
        event.employer.email = event.employer.email.toLowerCase();

        if (getIsAllowedDomain(fromUser.email)) {
          event.contactEmail = toUser.email;
          event.contactName = employer.name;
          event.createrEmail = toUser.email;
          event.createrRole = [UserRolesEnum.Employer];
        }

        await setEventApi(event);
        return event;
      }),
    );

    setUpdatedEventsCount({
      ...updatedEventsCount,
      isProcessing: 2,
    });
    return updatedEvents;
  }

  async function updateJobs(
    allJobs: any[],
    toUser,
    employer: any,
    fromUser: any,
  ): Promise<any[]> {
    setUpdatedJobsCount({
      ...updatedJobsCount,
      isProcessing: 1,
    });

    const updatedJobs = await Promise.all(
      allJobs.map(async (job) => {
        // Convert contactEmail and employer.email to lowercase
        job.contactEmail = job.contactEmail.toLowerCase();
        job.employerEmail = job.employerEmail.toLowerCase();

        // Apply other changes based on getIsAllowedDomain check
        if (getIsAllowedDomain(fromUser.email)) {
          job.contactEmail = toUser.email;
          job.contactName = employer.name;
          job.employerEmail = toUser.email;
          job.employerName = employer.name;
        }

        // Add _geoLoc if it does not exist
        if (!job._geoLoc) {
          await addLatLong(job);
        }

        await setJobApi(job);
        return job;
      }),
    );
    setUpdatedJobsCount({
      ...updatedJobsCount,
      isProcessing: 2,
    });
    return updatedJobs;
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
    setUpdatedEventsCount({ isProcessing: 0, total: 0 });
    setUpdatedUserApplicationsCount({ isProcessing: 0, total: 0 });
    setUpdatedMessagesCount({ isProcessing: 0, total: 0 });
    setIsProcessing(false);
    setShowTransferAccountConfirmModal(false);
    setDisableRun(false);
    setUpdateProcessRunning(false);
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="mx-auto max-w-md w-full">
          <div className="mb-4">
            <Breadcrumb pageName="Transfer Account" />
          </div>
          <div className="mb-8">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-7">
                <form onSubmit={handleTransferAccount}>
                  <div className="mb-5.5">
                    <label className="mb-3 block text-medium font-medium text-black dark:text-white">
                      From Email
                    </label>
                    <input
                      type="email"
                      name="fromEmail"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="mb-3 block text-medium font-medium text-black dark:text-white">
                      To Email
                    </label>
                    <input
                      type="email"
                      name="toEmail"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="mb-3 block text-medium font-medium text-black dark:text-white">
                      Select Employer
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
                          {employers?.map((emp) => (
                            <li
                              key={emp.id}
                              onClick={() =>
                                handleSelect(emp.id, emp.name, emp.photoUrl)
                              }
                              className={`px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                selectedOption?.id === emp.id
                                  ? 'bg-gray-300 dark:bg-gray-600'
                                  : ''
                              }`}
                            >
                              {emp.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-[#1C2434] px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                      type="submit"
                      disabled={isProcessing}
                    >
                      Transfer Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showTransferAccountConfirmModal && (
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
                    Are you sure you want to transfer all records to this
                    account? This operation cannot be stopped.
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <StatusItem
                      name="employers"
                      status={updatedEmployersCount.isProcessing}
                      total={updatedEmployersCount.total}
                      isDelete={false}
                    />
                    <StatusItem
                      name="jobs"
                      status={updatedJobsCount.isProcessing}
                      total={updatedJobsCount.total}
                      isDelete={false}
                    />
                    <StatusItem
                      name="events"
                      status={updatedEventsCount.isProcessing}
                      total={updatedEventsCount.total}
                      isDelete={false}
                    />
                    <StatusItem
                      name="user applications"
                      status={updatedUserApplicationsCount.isProcessing}
                      total={updatedUserApplicationsCount.total}
                      isDelete={false}
                    />
                    <StatusItem
                      name="chats"
                      status={updatedChatsCount.isProcessing}
                      total={updatedChatsCount.total}
                      isDelete={false}
                    />
                    <StatusItem
                      name="messages"
                      status={updatedMessagesCount.isProcessing}
                      total={updatedMessagesCount.total}
                      isDelete={false}
                    />
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

export default TransferAccount;
