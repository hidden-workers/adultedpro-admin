import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobsByEmployerEmail } from '../../store/reducers/jobSlice';
import { formatDate } from '../../utils/datetime';
import { Job } from '../../interfaces';
import * as XLSX from 'xlsx';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import CLoader from '../../common/Loader';
import { UserApplicationStatus } from '../../utils/enums';
import { fetchUserApplicationsByEmployerEmail } from '../../store/reducers/userApplicationsSlice';
import { Search } from 'lucide-react';

import { MapJobDataDialogue } from './MapJobDataModal';

export interface ExcelRow {
  EmployerName: string;
  EmployerEmail: string;
  BranchLocation: string;
  EmployerBio: string;
  AddressLine1: string;
  Posted_By?: string;
  Job_Type?: string;
  Search_Keyword?: string;
  Title?: string;
  Location?: string;
  AddressLine2: string;
  Salary?: string;
  City: string;
  Email?: string;
  ContactEmail: string;
  ContactName: string;
  ContactNumber: string;
  ContactBiography: string;
  Days: string;
  DaysDescription: string;
  Keywords: string;
  Language: string;
  Position: string;
  State: string;
  Shift: string;
  ShiftDescription: string;
  ZipCode: string;
  Country: string;
  Description: string;
  Pay: string;
  PayPeriod: string;
  PayDescription: string;
  HoursDescription: string;
  HoursPerWeek: string;
  PhotoUrl: string;
}

const uploadJobData: React.FC = () => {
  //////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { jobs } = useSelector((state: RootState) => state.job);
  const { userApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );
  const uploadJobData = useRef(null);

  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;

  //////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [importJobSteps, setImportJobSteps] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [jobdataModalOpen, setJobdataModalOpen] = useState(false);
  const [jobsExcelFile, setJobsExcelFile] = useState(undefined);
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [allJobsWithApplications, setAllJobsWithApplications] = useState([]); // For search purpose
  const [applicationCounts, setApplicationCounts] = useState([
    { text: 'Applications', count: 0 },
    { text: 'Interviewed', count: 0 },
    { text: 'Hired', count: 0 },
  ]);
  const [excelFileColumns, setExcelFileColumns] = useState([]);
  //////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////
  useEffect(() => {
    setIsLoading(true);
    dispatch<any>(fetchJobsByEmployerEmail({ email: authUser.email })).then(
      () => {
        setIsLoading(false);
      },
    );
    dispatch<any>(fetchUserApplicationsByEmployerEmail(authUser?.email));
  }, []);

  useEffect(() => {
    if (userApplications && jobs) {
      const jobsWithApplicationsTemp = jobs.map((j) => {
        const tempJob = { ...j };
        tempJob.applicationsCount = userApplications.filter(
          (application) =>
            application.jobId === j.id &&
            application.status.toLowerCase() !==
              UserApplicationStatus.Rejected &&
            application.status?.toLowerCase() !==
              UserApplicationStatus.Bookmarked &&
            application.status.toLowerCase() !== UserApplicationStatus.Skipped,
        )?.length;
        return tempJob;
      });

      setJobsWithApplications(jobsWithApplicationsTemp);
      setAllJobsWithApplications(jobsWithApplicationsTemp);
      setApplicationCounts([
        {
          text: 'Applications',
          count: userApplications.filter(
            (application) =>
              application.status === UserApplicationStatus.Applied,
          ).length,
        },
        {
          text: 'Interviewed',
          count: userApplications.filter(
            (application) =>
              application.status === UserApplicationStatus.Interviewing,
          ).length,
        },
        {
          text: 'Hired',
          count: userApplications.filter(
            (application) => application.status === UserApplicationStatus.Hired,
          ).length,
        },
      ]);
    }
  }, [userApplications, jobs]);

  //////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////

  const onSearch = () => {
    const filtered = allJobsWithApplications.filter(
      (j: Job) =>
        j.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        j.description.toLowerCase().includes(searchValue.toLowerCase()),
    );
    setJobsWithApplications(
      searchValue.trim().length == 0 ? allJobsWithApplications : filtered,
    );
  };

  const onUploadExcelData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setJobdataModalOpen(true);

    setJobsExcelFile(file);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e?.target?.result);
      const workbook = XLSX?.read?.(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelFileColumns(json?.[0] as any);
    };
    reader.readAsArrayBuffer(file);
  };

  const onExportToExcel = () => {
    const jobsData: ExcelRow[] = jobs.map((job: Job) => {
      const row: ExcelRow = {
        EmployerName: job?.employerName || 'None',
        EmployerEmail: job?.employerEmail || 'None',
        BranchLocation: job?.branchLocation || 'None',
        EmployerBio: job?.employerBio || 'None',
        AddressLine1: job?.addressLine1 || 'None',
        AddressLine2: job?.addressLine2 || 'None',
        City: job?.city || 'None',
        ContactEmail: job?.contactEmail || 'None',
        ContactName: job?.contactName || 'None',
        ContactNumber: job?.contactNumber || 'None',
        ContactBiography: job?.contactBio || 'None',
        Days: typeof job?.days == 'string' ? job?.days : job?.days.join(','),
        //@ts-expect-error: type error
        DaysDescription: job?.daysDescription || 'None',
        Keywords: job?.searchKeywords || 'None',
        Language: job?.language || 'None',
        Position: job?.title || 'None',
        State: job?.state || 'None',
        Shift:
          typeof job?.shift == 'string' ? job?.shift : job?.shift.join(','),
        //@ts-expect-error: type error
        ShiftDescription: job?.shiftDescription || 'None',
        ZipCode: job?.zipCode || 'None',
        Country: job?.country || 'None',
        Description: job?.description || 'None',
        Pay: job?.pay || 'None',
        PayPeriod: job?.payPeriod || 'None',
        PayDescription: job?.payDescription || 'None',
        HoursDescription: job?.hoursDescription || 'None',
        HoursPerWeek: job?.hours || 'None',
        PhotoUrl: '', // TODO: export employer photoUrl
      };

      return row;
    });
    const ws = XLSX.utils.json_to_sheet(jobsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
    XLSX.writeFile(wb, 'jobs.xlsx');
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Job Central" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 2xl:gap-7.5">
        {/* Total jobs posted */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:col-span-1 md:p-6 xl:p-7.5">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="mb-4 text-title-lg font-bold text-black dark:text-white">
                {jobs?.length}
              </h3>
              <p className="ml-[-10px] pr-[10px] font-medium ">
                Total Jobs Posted
              </p>
            </div>

            <div>
              <svg className="h-17.5 w-17.5 -rotate-90 transform">
                <circle
                  className="text-stroke dark:text-strokedark"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                />
                <circle
                  className="text-primary"
                  strokeWidth="10"
                  strokeDasharray={30 * 2 * Math.PI}
                  strokeDashoffset={
                    30 * 2 * Math.PI - (50 / 100) * 30 * 2 * Math.PI
                  }
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Interviewing */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:col-span-1 md:p-6 xl:p-7.5">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="mb-4 text-title-lg font-bold text-black dark:text-white">
                {applicationCounts[1].count}
              </h3>
              <p className="ml-[-5px] pr-[10px] font-medium ">Interviewing</p>
            </div>

            <div>
              <svg className="h-17.5 w-17.5 -rotate-90 transform">
                <circle
                  className="text-stroke dark:text-strokedark"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                />
                <circle
                  className="text-primary"
                  strokeWidth="10"
                  strokeDasharray={30 * 2 * Math.PI}
                  strokeDashoffset={
                    30 * 2 * Math.PI - (30 / 100) * 30 * 2 * Math.PI
                  }
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Hired */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:col-span-1 md:p-6 xl:p-7.5">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="mb-4 text-title-lg font-bold text-black dark:text-white">
                {applicationCounts[2].count}
              </h3>
              <p className="font-medium">Hired</p>
            </div>

            <div>
              <svg className="h-17.5 w-17.5 -rotate-90 transform">
                <circle
                  className="text-stroke dark:text-strokedark"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                />
                <circle
                  className="text-primary"
                  strokeWidth="10"
                  strokeDasharray={30 * 2 * Math.PI}
                  strokeDashoffset={
                    30 * 2 * Math.PI - (70 / 100) * 30 * 2 * Math.PI
                  }
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-10">
        <div className="flex items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
            className="w-1/2"
          >
            <div className="relative w-full rounded-md bg-[#F9FAFB] px-4 py-3 dark:bg-meta-4 ">
              <button
                type="button"
                title="Search"
                className="absolute left-2 top-1/2 -translate-y-1/2"
              >
                <Search />
              </button>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyUp={() => onSearch()}
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
              />
            </div>
          </form>

          <div className="flex items-center justify-end gap-4">
            <button
              disabled={isLoading || importJobSteps.length > 0}
              onClick={() =>
                uploadJobData.current && uploadJobData.current.click()
              }
              className="flex max-w-60 justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50 "
            >
              Upload Job Data
              <input
                ref={uploadJobData}
                type="file"
                accept=".xls .xlsx"
                onChange={onUploadExcelData}
                className="hidden h-full w-full "
                title="Upload"
                placeholder="Upload"
              />
            </button>
            <button
              onClick={onExportToExcel}
              disabled={isLoading || importJobSteps.length > 0}
              className="flex max-w-48 justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:cursor-default disabled:bg-primary/50 "
            >
              Export To Excel
            </button>
          </div>
        </div>

        {
          <div className="overflow-hidden rounded-[10px]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* table header start */}
                <div
                  style={{ gridTemplateColumns: 'repeat(11, minmax(0, 1fr))' }}
                  className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
                >
                  <div className="col-span-3">
                    <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                      TITLE
                    </h5>
                  </div>

                  <div className="col-span-2">
                    <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                      PAY
                    </h5>
                  </div>

                  <div className="col-span-2">
                    <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                      LOCATION
                    </h5>
                  </div>

                  <div className="col-span-2">
                    <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                      DATE POSTED
                    </h5>
                  </div>
                  <div className="col-span-2">
                    <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                      APPLICANTS
                    </h5>
                  </div>
                </div>
                {/* table header end */}

                {/* table body start */}
                <div className="bg-white dark:bg-boxdark">
                  {isLoading ? (
                    <CLoader />
                  ) : importJobSteps?.length > 0 ? (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      {importJobSteps}
                      <CLoader />
                    </div>
                  ) : (
                    jobsWithApplications?.map((job, index) => (
                      <div
                        key={index}
                        style={{
                          gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
                        }}
                        className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                      >
                        <div className="col-span-3">
                          <p className="text-[#637381] dark:text-bodydark">
                            {job?.title}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-[#637381] dark:text-bodydark">
                            {job?.pay}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-[#637381] dark:text-bodydark">
                            {job?.city} , {job?.state}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="pl-2 text-[#637381] dark:text-bodydark">
                            {job?.dateCreated
                              ? formatDate(job?.dateCreated)
                              : formatDate(new Date())}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="pl-8 text-[#637381] dark:text-bodydark">
                            {job?.applicationsCount}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* table body end */}
              </div>
            </div>
          </div>
        }
      </div>
      <MapJobDataDialogue
        uploadJobData={uploadJobData}
        excelFileColumns={excelFileColumns}
        jobsExcelFile={jobsExcelFile}
        setImportJobSteps={setImportJobSteps}
        open={jobdataModalOpen}
        setOpen={setJobdataModalOpen}
      />
    </DefaultLayout>
  );
};

export default uploadJobData;
