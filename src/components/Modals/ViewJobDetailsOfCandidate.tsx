import { IconButton, Modal } from '@mui/material';
import CLoader from '../../common/CLoader';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { UserApplicationStatus } from '../../utils/enums';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { UserApplication } from '../../interfaces';
import { X } from 'lucide-react';

const ViewJobDetailsOfCandidate = ({
  open,
  setOpen,
  applicantEmail,
}: {
  open: boolean;
  setOpen: any;
  applicantEmail: string;
}) => {
  ////////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////////////////
  const { userApplications: fetchedUserApplications, isLoading } = useSelector(
    (state: RootState) => state.userApplication,
  );

  ////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////////////////
  const [userApplications, setUserApplications] = useState([]);

  ////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////////////////
  useEffect(() => {
    setUserApplications(
      fetchedUserApplications.filter(
        (userApplication) => userApplication?.applicantEmail == applicantEmail,
      ),
    );
  }, [fetchedUserApplications, applicantEmail]);

  ////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////////////////
  const onClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[1000px] md:px-8 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 ">
          <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2 ">
            Applications History
          </h4>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4">
            <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
              <h5 className="text-lg font-bold xsm:text-base">Position</h5>
            </div>

            <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
              <h5 className="text-lg font-bold xsm:text-base">Apply Date</h5>
            </div>

            <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5 ">
              <h5 className="text-lg font-bold xsm:text-base">Status</h5>
            </div>
          </div>
          {isLoading ? (
            <div className="flex w-full items-center justify-center ">
              <CLoader />
            </div>
          ) : (
            <>
              {userApplications?.length > 0
                ? userApplications
                    ?.filter((item: any) => {
                      return (
                        item?.status?.toLowerCase() !=
                          UserApplicationStatus.Rejected &&
                        item?.status?.toLowerCase() !=
                          UserApplicationStatus.Skipped
                      );
                    })
                    ?.map((userApplication: UserApplication, index) => {
                      return (
                        <div
                          className={`grid grid-cols-3 ${index === userApplications?.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}
                          key={index}
                        >
                          {/* Applicant Title */}
                          <div className="flex items-center justify-center p-2.5 xl:p-5">
                            <p className="text-center text-black dark:text-white ">
                              {userApplication?.job?.title},{' '}
                              {userApplication?.job?.city}
                            </p>
                          </div>

                          {/* Applicant Apply Date */}
                          <div className="flex items-center justify-center p-2.5 xl:p-5">
                            <p className="hidden text-center text-black dark:text-white sm:block">
                              {
                                extractDateTimeFromTimestamp(
                                  userApplication?.dateCreated,
                                )?.date
                              }
                            </p>
                          </div>

                          {/* Applicant Status */}
                          <div className="flex items-center justify-center p-2.5 xl:p-5">
                            <p
                              className={`${
                                userApplication?.status.toLowerCase() ==
                                UserApplicationStatus.Interviewing
                                  ? 'text-meta-10'
                                  : userApplication?.status.toLowerCase() ==
                                      UserApplicationStatus.Disqualified
                                    ? 'text-meta-1'
                                    : userApplication?.status.toLowerCase() ==
                                        UserApplicationStatus.Hired
                                      ? 'text-meta-3'
                                      : 'text-meta-6'
                              } text-center`}
                            >
                              {userApplication?.status.toLowerCase() ==
                              UserApplicationStatus.Interviewing
                                ? 'Invite To Interview'
                                : userApplication?.status.toLowerCase() ==
                                    UserApplicationStatus.Disqualified
                                  ? 'Rejected'
                                  : userApplication?.status.toLowerCase() ==
                                      UserApplicationStatus.Hired
                                    ? 'Hired'
                                    : 'Chatting'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                : 'No application against this candidate.'}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewJobDetailsOfCandidate;
