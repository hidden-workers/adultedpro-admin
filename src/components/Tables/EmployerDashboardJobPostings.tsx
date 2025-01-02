import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { useStateContext } from '../../context/useStateContext';
import { useNavigate } from 'react-router-dom';
import { SquareArrowUpRight } from 'lucide-react';
import { Tooltip } from '@mui/material';
import CLoader from '../../common/CLoader';

const EmployerDashboardJobPostings = ({
  isLoading,
}: {
  isLoading: boolean;
}) => {
  //////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////
  const navigate = useNavigate();
  const { Dashjobs } = useSelector((state: RootState) => state.job); // Jobs call is being placed in main page
  const { setShowJobForm } = useStateContext();

  //////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////

  //////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////

  //////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////
  const navigateToJobCentral = () => {
    navigate('/employer/jobcentral');
    setShowJobForm(true);
  };

  return (
    <div className="min-h-[10rem] relative h-full overflow-y-auto rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-5.5 xl:pb-1">
      <div className="mb-[15px] flex items-center justify-between ">
        <h4 className="flex items-center gap-1 text-xl font-semibold text-black dark:text-white ">
          Recent Jobs{''}
          <Tooltip placement="top" title="View All">
            <SquareArrowUpRight
              onClick={() => navigate('/employer/jobcentral')}
              className="h-5 w-5 cursor-pointer text-black/60"
            />
          </Tooltip>
        </h4>

        <button
          onClick={navigateToJobCentral}
          className="flex h-fit justify-center text-sm rounded bg-[#1C2434] px-2.5 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
        >
          Create Job
        </button>
      </div>

      <div className="flex h-fit flex-col ">
        <div className="grid grid-cols-2 rounded-sm bg-gray-2 dark:bg-meta-4 ">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium xsm:text-base">Position</h5>
          </div>

          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium xsm:text-base">Candidates</h5>
          </div>
        </div>

        {isLoading ? (
          <div className="flex mt-3">
            <CLoader size="lg" />
          </div>
        ) : (
          Dashjobs.length == 0 && (
            <div className="flex items-center justify-center text-sm py-16 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <span className="text-center text-xl mt-30">No Job Posted</span>
            </div>
          )
        )}
        {Dashjobs.slice(0, 6).map((job, key) => (
          <div
            className={`grid grid-cols-2 ${
              key === Dashjobs.length - 1
                ? ''
                : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={job.id || key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="text-sm text-black dark:text-white sm:block truncate">
                {job?.title || 'No Title'}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3 text-sm">
                {job?.jobApplications?.length || 0}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployerDashboardJobPostings;
