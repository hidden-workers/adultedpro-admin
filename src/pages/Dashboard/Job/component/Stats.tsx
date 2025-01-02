import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { UserApplication } from '../../../../interfaces';
import { UserApplicationStatus } from '../../../../utils/enums';
interface StatsProps {
  totalJobs: number;
  activeJobs: number;
  employersCount: number;
  pageType: string;
  jobsWithApplications: any;
}

export const Stats: React.FC<StatsProps> = ({
  activeJobs,
  pageType,
  jobsWithApplications,
  employersCount,
}) => {
  const { userApplications, allUserApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;

  const filterApplications = (applications: UserApplication[]) => {
    return applications?.filter(
      (item: any) =>
        item?.status?.toLowerCase() !== UserApplicationStatus.Rejected &&
        item?.status?.toLowerCase() !== UserApplicationStatus.Skipped &&
        item?.status?.toLowerCase() !== UserApplicationStatus.Bookmarked,
    );
  };

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
      <div className="col-span-12 rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-${pageType === 'Institution' ? '5' : '3'} place-items-center`}
        >
          {/* Total Jobs Posted */}
          <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
            <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
              {jobsWithApplications?.length}
            </h4>
            <p
              className={`text-sm text-center font-medium ${pageType !== 'Institution' ? 'px-28' : 'px-11'}`}
            >
              All Jobs
            </p>
          </div>
          {/* Active Jobs */}
          <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark sm:border-b-0 sm:pb-0 xl:border-r">
            <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
              {activeJobs}
            </h4>
            <p
              className={`text-sm text-center font-medium ${pageType !== 'Institution' ? 'px-30' : 'px-13'}`}
            >
              Active Jobs
            </p>
          </div>
          {/* Applicants */}
          <div
            className={`flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:pb-0 ${pageType === 'Institution' ? 'xl:border-r' : ''}`}
          >
            <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
              {filterApplications(userApplications)?.length}
            </h4>
            <p className="text-sm text-center font-medium px-18">Applicants</p>
          </div>
          {/* Total Employers */}
          {pageType === 'Institution' && (
            <div className="flex flex-col items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {employersCount}
              </h4>
              <p className="text-sm text-center font-medium px-13">
                Total Employers
              </p>
            </div>
          )}
          {/* Total Swipes */}
          {pageType === 'Institution' && (
            <div className="flex flex-col items-center justify-center gap-2">
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {
                  allUserApplications?.filter(
                    (u) => u?.applicant?.partnerId == authUser?.partnerId,
                  ).length
                }
              </h4>
              <p className="text-sm text-center font-medium px-13">
                Total Swipes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
