import React, { useEffect, useRef } from 'react';
import { Job } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { Volume2, X } from 'lucide-react';
import { Tooltip, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ViewJobModal = ({ job }: { job: Job }) => {
  /////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const { showJobViewModal, setShowJobViewModal, page } = useStateContext();
  const modal = useRef<any>(null);
  const navigate = useNavigate();

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    // close if the esc key is pressed
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (showJobViewModal && keyCode === 27) {
        setShowJobViewModal(false);
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [showJobViewModal]);

  /////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
  const getStatus = (applyDate, expireDate) => {
    const currentDate = new Date();
    const aDate = applyDate?.seconds ? applyDate.toDate() : new Date(applyDate);
    const eDate = expireDate
      ? expireDate?.seconds
        ? expireDate.toDate()
        : new Date(expireDate)
      : null;
    if ((aDate < currentDate && eDate > currentDate) || !eDate) {
      return 'Active';
    } else if (eDate < currentDate) {
      return 'Expired';
    } else {
      return 'Paused';
    }
  };
  const onAnnounceJob = () => {
    setShowJobViewModal(false);
    navigate('/institution/chat');
  };

  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  return (
    <div>
      {showJobViewModal && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
          <div
            ref={modal}
            className="max-h-[90vh] min-h-[90vh] md:px-8 w-full max-w-150 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4"
            style={{ maxWidth: '1000px', width: '90vw' }}
          >
            <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-2 ">
              <div className="w-full flex justify-start items-center gap-4">
                <h4 className="text-2xl font-semibold text-black dark:text-white">
                  View Job
                </h4>
                {page == 'Institution' && (
                  <Tooltip title="Announce" placement="top">
                    <IconButton onClick={() => onAnnounceJob()}>
                      <Volume2 className="text-gray-icon" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
              <Tooltip title="View" placement="top">
                <IconButton onClick={() => setShowJobViewModal(false)}>
                  <X />
                </IconButton>
              </Tooltip>
            </div>

            <div className="flex flex-col bg-[#F9FAFB] dark:bg-meta-4 rounded-lg overflow-hidden">
              <JobDetail title="Title" value={job?.title} />
              <JobDetail title="Description" value={job?.description} />
              <JobDetail title="Address Line 1" value={job?.addressLine1} />
              <JobDetail title="Address Line 2" value={job?.addressLine2} />
              <JobDetail title="City" value={job?.city} />
              <JobDetail title="State" value={job?.state} />
              <JobDetail title="Country" value={job?.country} />
              <JobDetail title="Zip Code" value={job?.zipCode} />
              <JobDetail
                title="Geolocation"
                value={`Latitude: ${job?._geoloc?.lat}, Longitude: ${job?._geoloc?.lng}`}
              />
              <JobDetail title="Contact Name" value={job?.contactName} />
              <JobDetail title="Contact Email" value={job?.contactEmail} />
              <JobDetail title="Contact Number" value={job?.contactNumber} />
              <JobDetail title="Contact Bio" value={job?.contactBio} />
              <JobDetail title="Employer Name" value={job?.employerName} />
              <JobDetail title="Employer Bio" value={job?.employerBio} />
              <JobDetail title="Employer Email" value={job?.employerEmail} />
              <JobDetail title="Employer Number" value={job?.employerNumber} />
              <JobDetail title="Job Link" value={job?.jobLink} />
              <JobDetail title="Language" value={job?.language} />
              <JobDetail title="Pay" value={job?.pay} />
              <JobDetail title="Pay Description" value={job?.payDescription} />
              <JobDetail title="Pay Period" value={job?.payPeriod} />
              <JobDetail title="Hours" value={job?.hours} />
              <JobDetail title="Hours Description" value={job?.hoursDescription} />
              <JobDetail title="Rank Index" value={job?.rankIndex} />
              <JobDetail title="Search Keywords" value={job?.searchKeywords} />
              <JobDetail title="Shift" value={job?.shift?.join(', ')}  />
              <JobDetail
                title="Shift Description"
                value={job?.shiftDescription?.join(', ')} 
              />
              <JobDetail title="Days" value={job?.days?.join(', ')}  />
              <JobDetail title="Days Description" value={job?.daysDescription?.join(', ')}  />
              <JobDetail title="Program" value={job?.program?.join(', ')}  />
              <JobDetail title="Date Created" value={job?.dateCreated}  />
              <JobDetail title="Date Updated" value={job?.dateUpdated}  />
              <JobDetail
                title="Expire Date"
                value={
                  job?.expireDate
                    ? extractDateTimeFromTimestamp(job?.expireDate).date
                    : 'Ongoing recruitment'
                }
              />
              <JobDetail
                title="Apply Date"
                value={
                  job?.applyDate
                    ? extractDateTimeFromTimestamp(job?.applyDate).date
                    : 'Ongoing Recruitment'
                }
              />
              <JobDetail
                title="Number of Positions"
                value={job?.noOfPositions}
              />
              
              <JobDetail
                title="Branch Location"
                value={
                  typeof job?.branchLocation === 'object'
                  //@ts-expect-error: might give error
                    ? job.branchLocation?.branchLocation
                    : job?.branchLocation
                }
              />
              <JobDetail
                title="Is Remote"
                value={job?.isRemote ? 'Yes' : 'No'}
              />
              <JobDetail
                title="Status"
                value={
                  job?.isActive
                    ? getStatus(job?.applyDate, job?.expireDate)
                    : 'Inactive'
                }
              />
              <JobDetail title="Job Media" value={job?.photoUrl}  />
              <JobDetail title="Employer Image" value={job?.employerPhotoUrl}  />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface JobDetailProps {
  title: string;
  value: string | number | undefined;
}

const JobDetail: React.FC<JobDetailProps> = ({ title, value }) => {
  const isImage = typeof value === 'string' && value.startsWith('http');

  return (
    <div className="grid grid-cols-4 border-t border-x border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7">
      <p className="col-span-1 font-semibold text-start">{title}:</p>
      <div className="col-span-3 text-start">
        {isImage ? (
          <img
            src={value}
            alt={title}
            className="max-h-20 object-contain"
          />
        ) : (
          <p>{value}</p>
        )}
      </div>
    </div>
  );
};


export default ViewJobModal;
