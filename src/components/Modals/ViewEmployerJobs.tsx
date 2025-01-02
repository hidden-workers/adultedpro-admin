import { IconButton, Modal } from '@mui/material';
import CLoader from '../../common/CLoader';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { X } from 'lucide-react';
import { Job } from '../../interfaces';
import { fetchJobsByEmployerId } from '../../store/reducers/jobSlice';

const ViewEmployerJobs = ({
  open,
  setOpen,
  employerId,
}: {
  open: boolean;
  setOpen: any;
  employerId?: string;
}) => {
  ////////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { jobs } = useSelector((state: RootState) => state.job);
  ////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////////////////
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  ////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////////////////
  useEffect(() => {
    setIsLoading(true);
    dispatch<any>(fetchJobsByEmployerId({ id: employerId })).then(
      setIsLoading(false),
    );
  }, [employerId]);
  useEffect(() => {
    if (jobs) {
      setJobsWithApplications(jobs);
    }
  }, [jobs]);
  ////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////////////////
  const onClose = () => {
    setOpen(false);
    setJobsWithApplications([]);
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
            Employer Jobs{' '}
            <span className="text-md text-body">
              ({jobsWithApplications?.length})
            </span>{' '}
          </h4>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </div>

        <div className="flex flex-col">
          <div
            style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}
            className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
          >
            <div className="col-span-3">
              <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                Position
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                Date Posted
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                Applicants
              </h5>
            </div>
          </div>
          {isLoading ? (
            <div className="flex min-h-[30rem] w-full items-center justify-center ">
              <CLoader size="xl" />
            </div>
          ) : (
            <>
              {jobsWithApplications?.map(
                (job: Job & { applicationsCount: number }, index) => {
                  return (
                    <div
                      key={index}
                      style={{
                        gridTemplateColumns: `repeat(7, minmax(0, 1fr))`,
                      }}
                      className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                    >
                      <div className="col-span-3">
                        <p className="text-center text-[#637381] dark:text-bodydark hover:text-primary cursor-pointer ">
                          {job?.title}, {job?.city}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-center text-[#637381] dark:text-bodydark">
                          {job?.dateCreated
                            ? extractDateTimeFromTimestamp(job?.dateCreated)
                                ?.date
                            : '-'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-center text-[#637381] dark:text-bodydark">
                          {job?.jobApplications?.length}
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewEmployerJobs;
