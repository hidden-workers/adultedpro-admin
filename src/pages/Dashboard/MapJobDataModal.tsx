import { useState } from 'react';
import { Modal } from '@mui/material';
import * as XLSX from 'xlsx';
import { ExcelRow } from './UploadJobData';
import { Employer, Job } from '../../interfaces';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerEmployer,
  fetchEmployerByCompanyAndBranch,
  fetchEmployerMainBranch,
} from '../../store/reducers/employersSlice';
import {
  fetchJobsByEmployerEmail,
  createJob,
} from '../../store/reducers/jobSlice';
import toast from 'react-hot-toast';
import { RootState } from '../../store/store';

interface Props {
  open: boolean;
  setOpen: any;
  setImportJobSteps: any;
  excelFileColumns: any;
  jobsExcelFile: any;
  uploadJobData: any;
}
interface ExcelRowValidation {
  lineNumber: number;
  field: string;
  value: string;
}

interface ExcelRowsValidationResult {
  pass: boolean;
  errors: ExcelRowValidation[];
}

const defaultMapping = {
  contactEmail: ['ContactEmail', 'EmployerEmail', 'Email'],
  country: ['Country'],
  description: ['Description'],
  city: ['City', 'Location'],
  employerEmail: ['EmployerEmail', 'Email'],
  employerName: ['EmployerName', 'Posted_By'],
  pay: ['Pay'],
  payDescription: ['PayDescription', 'Salary'],
  hoursDescription: ['HoursDescription', 'Job_Type'],
  branchLocation: ['BranchLocation', 'Location'],
  zipCode: ['ZipCode'],
  searchKeywords: ['Keywords', 'Search_Keyword'],
  addressLine1: ['AddressLine1'],
  payPeriod: ['PayPeriod'],
  shift: ['Shift'],
  addressLine2: ['AddressLine2'],
  contactBio: ['ContactBiography'],
  contactName: ['ContactName'],
  contactNumber: ['ContactNumber'],
  days: ['Days'],
  daysDescription: ['DaysDescription'],
  employerBio: ['EmployerBio'],
  hours: ['HoursPerWeek'],
  language: ['Language'],
  shiftDescription: ['ShiftDescription'],
  state: ['State'],
  title: ['Position', 'Title'],
  photoUrl: ['photoUrl'],
};

const getDefaultMappings = (item) => {
  const mappings = [];
  for (const [key, values] of Object.entries(defaultMapping)) {
    if (values.includes(item)) {
      mappings.push(key);
    }
  }
  return mappings.length ? mappings.join(', ') : '';
};

export const MapJobDataDialogue = ({
  uploadJobData,
  jobsExcelFile,
  excelFileColumns,
  setImportJobSteps,
  open,
  setOpen,
}: Props) => {
  ////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const userId = String(localStorage.getItem('userId'));
  ////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////
  const [mapping, setMapping] = useState({});
  ////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////

  // Firestore fields
  const firestoreFields = [
    'addressLine1',
    'city',
    'contactBio',
    'contactEmail',
    'contactName',
    'contactNumber',
    'country',
    'days',
    'daysDescription',
    'description',
    'employerBio',
    'employerEmail',
    'employerName',
    'branchLocation',
    'hours',
    'hoursDescription',
    'language',
    'pay',
    'payDescription',
    'payPeriod',
    'searchKeywords',
    'shift',
    'shiftDescription',
    'state',
    'title',
    'zipCode',
    'addressLine2',
    'id',
    'dateCreated',
    'dateUpdated',
    '_geoloc',
    'expireDate',
    'applyDate',
    'isActive',
    'isRemote',
    'rankIndex',
    'noOfPositions',
    'employerId',
    'employerNumber',
    'program',
    'photoUrl',
  ];

  const onCancel = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  function getJobCountByEmail(email: string): number {
    const emp = employerJobCounts.find((item) => item.email === email);
    return emp ? emp.jobCount : 0;
  }

  interface EmployerJobCount {
    email: string;
    jobCount: number;
  }
  const employerJobCounts: EmployerJobCount[] = [];

  async function updateEmployerJobCount(row) {
    const existingEmployerIndex = employerJobCounts.findIndex(
      (item) =>
        item.email === row?.[mapping?.['employerEmail']] ||
        row.EmployerEmail ||
        row?.Email ||
        user?.email,
    );

    if (existingEmployerIndex !== -1) {
      //employer exists
      employerJobCounts[existingEmployerIndex].jobCount++;
    } else {
      // If employer doesn't exist, add it to the array
      const employerJobs = await dispatch<any>(
        fetchJobsByEmployerEmail({
          email:
            row?.[mapping?.['employerEmail']] ||
            row.EmployerEmail ||
            row?.Email ||
            user?.email,
        }),
      ).then(({ payload }) => payload);
      employerJobCounts.push({
        email:
          row?.[mapping?.['employerEmail']] ||
          row.EmployerEmail ||
          row?.Email ||
          user?.email,
        jobCount: employerJobs?.length,
      });
    }
  }

  const parseExcelData = async (rows: ExcelRow[]): Promise<Job[]> => {
    const jobs: Job[] = [];

    setImportJobSteps('Parsing jobs data...');
    const executionResult = validateExcelRows(rows);

    if (!executionResult.pass) {
      const errorMessage = executionResult.errors
        .map(
          (error) =>
            `Line ${error.lineNumber} - ${error.field}: ${error.value}`,
        )
        .join(', ');
      toast.error(`Upload failed. Invalid information at ${errorMessage}`, {
        duration: 5000,
      });
      return [];
    }
    for (const row of rows) {
      let employer = await dispatch<any>(
        fetchEmployerByCompanyAndBranch({
          companyName:
            row?.[mapping?.['name']]?.trim?.() || row?.EmployerName?.trim?.(),
          branchLocation:
            row?.[mapping?.['branchLocation']]?.trim?.() ||
            row?.BranchLocation?.trim?.() ||
            row?.Location?.trim?.(),
        }),
      ).then(({ payload }) => payload);
      updateEmployerJobCount(row);

      let employerMainBranch = {};

      const apiKey = 'AIzaSyAsStHmbfEb90JiFTDExHOx-4Ge_zxn9nU';
      // get the zipcode from location
      let zipCodeFromLocation;

      try {
        const zipCodeFromLocationResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${row?.[mapping?.['zipCode']]?.trim?.() || row.ZipCode || encodeURIComponent(row?.Location?.trim?.())}&key=${apiKey}`,
        );
        const zipCodeFromLocationData =
          await zipCodeFromLocationResponse?.json();
        const addressComponents =
          zipCodeFromLocationData?.results?.[0]?.address_components;

        for (const component of addressComponents) {
          if (component?.types?.includes?.('postal_code')) {
            zipCodeFromLocation = component.long_name;
          }
        }
      } catch (error) {
        console.error('Got error => ', error);
      }

      // if there is employer but he doesn't have the photoUrl then fetch the main branch url
      if (employer && (!employer?.photoUrl || employer?.photoUrl === '')) {
        employerMainBranch = await dispatch<any>(
          fetchEmployerMainBranch({
            name:
              row?.[mapping?.['name']]?.trim?.() || row?.EmployerName?.trim?.(),
          }),
        ).then(({ payload }) => payload);
      }

      if (!employer) {
        //@ts-expect-error:isTest error
        const newEmployer: Employer = {
          // name , email required to create new employer
          name:
            row?.[mapping?.['name']]?.trim?.() ?? row?.EmployerName?.trim?.(),
          branchLocation:
            row?.[mapping?.['branchLocation']]?.trim?.() ??
            row.BranchLocation?.trim?.() ??
            row?.Location?.trim?.(),
          email:
            row?.[mapping?.['email']]?.trim?.() ??
            row?.EmployerEmail?.trim?.() ??
            row?.Email ??
            user?.email, //if there is no email then we need to attach the super-admin email
          zipCode:
            row?.[mapping?.['zipCode']]?.trim?.() ??
            row?.ZipCode ??
            zipCodeFromLocation?.trim?.(), //zipcode is required

          description:
            row?.[mapping?.['bio']]?.trim?.() ??
            row?.EmployerBio?.trim?.() ??
            '',
          addressLine1:
            row?.[mapping?.['addressLine1']]?.trim?.() ??
            row?.AddressLine1?.trim?.() ??
            '',
          addressLine2:
            row?.[mapping?.['addressLine2']]?.trim?.() ??
            row?.AddressLine2?.trim?.() ??
            '',
          city: row?.[mapping?.['city']]?.trim?.() ?? row?.City?.trim?.() ?? '',
          bio:
            row?.[mapping?.['bio']]?.trim?.() ??
            row?.EmployerBio?.trim?.() ??
            '',
          contactEmail:
            row?.[mapping?.['contactEmail']]?.trim?.() ??
            row?.ContactEmail?.trim?.() ??
            '',
          contactName:
            row?.[mapping?.['contactName']]?.trim?.() ??
            row?.ContactName?.trim?.() ??
            '',
          contactNumber:
            row?.[mapping?.['contactNumber']]?.trim?.() ??
            row?.ContactNumber?.trim?.() ??
            '',
          contactBio:
            row?.[mapping?.['contactBio']]?.trim?.() ??
            row?.ContactBiography?.trim?.() ??
            '',
          country:
            row?.[mapping?.['country']]?.trim?.() ??
            row?.Country?.trim?.() ??
            '',
          state:
            row?.[mapping?.['state']]?.trim?.() ?? row?.State?.trim?.() ?? '',
          photoUrl:
            row?.[mapping?.['photoUrl']]?.trim?.() ??
            row?.PhotoUrl?.trim?.() ??
            //@ts-expect-error: type error
            employerMainBranch?.photoUrl ??
            '',
          dateCreated: new Date(),
          dateUpdated: new Date(),

          userId: userId || user?.id,
          media: [],
          partnerId: '',

          requirements: '',
          tagLine: '',
          bannerImage: '',
          companySize: '',
          mission: '',
          alumniLinks: [],
          awardsAndAccolades: '',
          benefitsAndPerks: '',
          cultureAndEnvironment: '',
          socialMediaLinks: [],
          bookmarkedStudents: [],
          bookmarkedUserApplications: [],
          isHeadquarter: true,
          reviewedStudents: [],
          reviewedUserApplications: [],
        };
        setImportJobSteps('Fetching company details...');
        const createdEmployer = await dispatch<any>(
          registerEmployer(newEmployer),
        ).then(({ payload }) => payload);
        employer = createdEmployer;
      }

      let currentJobLat = 0;
      let currentJoblng = 0;
      if (
        row?.[mapping?.['zipCode']] ||
        row?.ZipCode ||
        encodeURIComponent(row?.Location)
      ) {
        await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${row?.[mapping?.['zipCode']]?.trim?.() || row.ZipCode || encodeURIComponent(row?.Location?.trim?.())}&key=${apiKey}`,
        )
          .then((response) => response?.json?.())
          .then((data) => {
            const { results } = data;

            if (results && results.length > 0) {
              const firstResult = results[0];
              const location = firstResult.geometry?.location;

              if (location) {
                const { lat, lng } = location;
                currentJobLat = lat;
                currentJoblng = lng;
              }
            }
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      }
      //@ts-expect-error: isTest error
      const newJob: Job = {
        // Must be available
        contactEmail:
          row?.[mapping?.['contactEmail']]?.trim?.() ??
          row?.[mapping?.['employerEmail']]?.trim?.() ??
          row.ContactEmail?.trim?.() ??
          row.EmployerEmail?.trim?.() ??
          row?.Email?.trim?.(),
        country:
          row?.[mapping?.['country']]?.trim?.() ?? row?.Country?.trim?.() ?? '',
        description:
          row?.[mapping?.['description']]?.trim?.() ??
          row?.Description?.trim?.() ??
          '',
        city:
          row?.[mapping?.['city']]?.trim?.() ??
          row?.City?.trim?.() ??
          row?.Location?.trim?.()?.split(',')?.[0] ??
          '',
        employerEmail:
          row?.[mapping?.['employerEmail']]?.trim?.() ??
          row.EmployerEmail?.trim?.() ??
          row?.Email?.trim?.() ??
          user?.email?.trim?.(),
        employerName:
          row?.[mapping?.['employerName']]?.trim?.() ??
          row?.EmployerName?.trim?.() ??
          '',
        pay: row?.[mapping?.['pay']]?.trim?.() ?? row?.Pay?.trim?.() ?? '',
        payDescription:
          row?.[mapping?.['payDescription']]?.trim?.() ??
          row?.PayDescription?.trim?.() ??
          row?.Salary?.trim?.() ??
          '',
        hoursDescription:
          row?.[mapping?.['hoursDescription']]?.trim?.() ??
          row?.HoursDescription?.trim?.() ??
          row?.Job_Type?.trim?.() ??
          '',
        branchLocation:
          row?.[mapping?.['branchLocation']]?.trim?.() ??
          row?.BranchLocation?.trim?.() ??
          row?.Location?.trim?.() ??
          '',
        zipCode:
          row?.[mapping?.['zipCode']]?.trim?.() ??
          row?.ZipCode ??
          zipCodeFromLocation?.trim?.() ??
          '',
        searchKeywords:
          row?.[mapping?.['searchKeywords']]?.trim?.() ??
          row?.Keywords?.trim?.() ??
          row?.Search_Keyword?.trim?.() ??
          '',

        // If not avaialbe then it's ok to add as empty
        addressLine1:
          row?.[mapping?.['addressLine1']]?.trim?.() ??
          row?.AddressLine1?.trim?.() ??
          '',
        payPeriod:
          row?.[mapping?.['payPeriod']]?.trim?.() ??
          row?.PayPeriod?.trim?.() ??
          '',
        shift:
          row?.[mapping?.['shift']]?.split?.(',') ??
          row?.Shift?.split(',') ??
          [],
        addressLine2:
          row?.[mapping?.['addressLine2']]?.trim?.() ??
          row?.AddressLine2?.trim?.() ??
          '',
        contactBio:
          row?.[mapping?.['contactBio']]?.trim?.() ??
          row?.ContactBiography?.trim?.() ??
          '',
        contactName:
          row?.[mapping?.['contactName']]?.trim?.() ??
          row?.ContactName?.trim?.() ??
          '',
        contactNumber:
          row?.[mapping?.['contactNumber']]?.trim?.() ??
          row?.ContactNumber?.trim?.() ??
          '',
        days:
          row?.[mapping?.['days']]?.split?.(',') ??
          row?.Days?.split?.(',') ??
          '',
        daysDescription:
          row?.[mapping?.['daysDescription']]?.trim?.() ??
          row?.DaysDescription?.trim?.() ??
          '',
        employerBio:
          row?.[mapping?.['employerBio']]?.trim?.() ??
          row?.EmployerBio?.trim?.() ??
          '',
        employerPhotoUrl:
          //@ts-expect-error: type error
          employer?.photoUrl ?? employerMainBranch?.photoUrl ?? '',
        hours:
          row?.[mapping?.['hours']]?.trim?.() ??
          row?.HoursPerWeek?.trim?.() ??
          '',
        language:
          row?.[mapping?.['language']]?.trim?.() ??
          row?.Language?.trim?.() ??
          '',
        shiftDescription:
          row?.[mapping?.['shiftDescription']]?.trim?.() ??
          row?.ShiftDescription?.trim?.() ??
          '',
        state:
          row?.[mapping?.['state']]?.trim?.() ?? row?.State?.trim?.() ?? '',
        title:
          row?.[mapping?.['title']]?.trim?.() ??
          row?.Position?.trim?.() ??
          row?.Title?.trim?.() ??
          '',

        id: '',
        dateCreated: new Date(),
        dateUpdated: new Date(),
        _geoloc: { lat: currentJobLat, lng: currentJoblng },
        expireDate: '',
        applyDate: new Date(),
        isActive: true,
        isRemote: false,
        rankIndex: getJobCountByEmail(
          row?.[mapping?.['employerEmail']] ||
            row.EmployerEmail ||
            row?.Email ||
            user?.email,
        ),
        noOfPositions: 1,
        employerId: employer?.id || '',
        employerNumber: '',
        program: [],
        photoUrl:
          row?.[mapping?.['photoUrl']] ??
          //@ts-expect-error: type error
          row?.photoUrl ??
          //@ts-expect-error: type error
          employerMainBranch?.photoUrl ??
          '',
      };
      jobs.push(newJob);
    }

    return jobs;
  };

  function validateExcelRows(rows: ExcelRow[]): ExcelRowsValidationResult {
    const validationResults: ExcelRowValidation[] = [];
    let pass = true;

    rows.forEach((row, index) => {
      // Validate Employer Name
      if (
        (!row?.[mapping?.['name']]?.trim?.() ||
          row?.[mapping?.['name']]?.trim?.()?.length < 1) &&
        (!row.EmployerName?.trim?.() ||
          row.EmployerName?.trim?.()?.length < 1) &&
        (!row.Posted_By?.trim?.() || row.Posted_By?.trim?.()?.length < 1)
      ) {
        validationResults.push({
          lineNumber: index + 1,
          field: 'EmployerName',
          value: row?.[mapping?.['name']] || row.EmployerName || row?.Posted_By,
        });
        pass = false;
      }
      // Validate Employer Branch
      if (
        (!row?.[mapping?.['branchLocation']]?.trim?.() ||
          row?.[mapping?.['branchLocation']]?.trim?.()?.length < 1) &&
        (!row.BranchLocation?.trim?.() ||
          row.BranchLocation?.trim?.()?.length < 1) &&
        (!row?.Location?.trim?.() || row?.Location?.trim?.()?.length < 1)
      ) {
        validationResults.push({
          lineNumber: index + 1,
          field: 'BranchLocation',
          value:
            row?.[mapping?.['branchLocation']] ||
            row.BranchLocation ||
            row?.Location,
        });
        pass = false;
      }

      // Validate Employer Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        (!row?.[mapping?.['employerEmail']]?.trim?.() ||
          !emailPattern.test(row?.[mapping?.['employerEmail']]?.trim?.())) &&
        (!row.EmployerEmail?.trim?.() ||
          !emailPattern.test(row.EmployerEmail?.trim?.())) &&
        (!row.Email?.trim?.() || !emailPattern.test(row.Email?.trim?.()))
      ) {
        validationResults.push({
          lineNumber: index + 1,
          field: 'EmployerEmail',
          value:
            row?.[mapping?.['employerEmail']] ||
            row.EmployerEmail ||
            row?.Email ||
            user?.email,
        });
        pass = false;
      }

      // Validate Position
      if (
        (!row?.[mapping?.['title']]?.trim?.() ||
          row?.[mapping?.['title']]?.trim?.()?.length < 2) &&
        (!row.Position?.trim?.() || row.Position?.trim?.()?.length < 2) &&
        (!row.Title?.trim?.() || row.Title?.trim?.()?.length < 2)
      ) {
        validationResults.push({
          lineNumber: index + 1,
          field: 'Position',
          value: row?.[mapping?.['title']] || row.Position || row?.Title,
        });
        pass = false;
      }

      const zipCode = String(
        row?.[mapping?.['zipCode']] || row.ZipCode || row?.Location,
      );
      if (!zipCode) {
        validationResults.push({
          lineNumber: index + 1,
          field: 'ZipCode',
          value: zipCode,
        });
        pass = false;
      }
    });

    return { pass, errors: validationResults };
  }

  const handleSave = () => {
    setImportJobSteps('Importing jobs...');
    setOpen(false);
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);
      rows = rows.filter((row) =>
        Boolean(row?.[mapping?.['title']] || row?.Position || row?.Title),
      );
      const jobs: Job[] = await parseExcelData(rows);

      if (jobs?.length > 0) {
        setImportJobSteps('Inserting job data in db...');
        jobs.map((job: Job, index: number) => {
          dispatch<any>(createJob(job))
            .then(() => {
              if (jobs?.length == index + 1) {
                setImportJobSteps('');
                toast.success('Jobs imported successfully');
              }
            })
            .catch((err) => {
              console.error('error', err);
              setImportJobSteps('');
            });
        });
      }

      if (uploadJobData?.current) {
        uploadJobData.current.value = null;
      }
    };

    reader.readAsArrayBuffer(jobsExcelFile);
  };

  const handleMappingChange = (excelColumn, firestoreField) => {
    setMapping((prevMapping) => ({
      ...prevMapping,
      [firestoreField]: excelColumn,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className="flex h-screen w-screen items-center justify-center"
    >
      <div className="w-full max-w-[60vw] rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-8">
        <h3 className="mt-5.5 pb-6 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Map job data fields
        </h3>
        {/* table header start */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '10px',
          }}
          className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
        >
          <div className="col-span-3">
            <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
              Imported Fields
            </h5>
          </div>
          <div className="col-span-2">
            <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
              Default Mapping
            </h5>
          </div>
          <div className="col-span-2">
            <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
              Alternate Mapping
            </h5>
          </div>
        </div>
        {/* table header end */}

        {/* table body start */}
        <div className="overflow-scroll overflow-x-hidden max-h-80 mb-4">
          <div className="bg-white dark:bg-boxdark">
            {excelFileColumns?.map((item, index) => {
              const defaultField = getDefaultMappings(item);
              return (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '10px',
                  }}
                  className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                >
                  <div className="col-span-3">
                    <p className="text-center text-[#637381] dark:text-bodydark hover:text-primary cursor-pointer ">
                      {item}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center text-[#637381] dark:text-bodydark">
                      {defaultField}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <select
                      onChange={(e) =>
                        handleMappingChange(item, e?.target?.value)
                      }
                    >
                      <option value="">Select field</option>
                      {firestoreFields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* table body end */}

        <div className="flex w-full flex-wrap justify-center gap-4">
          <button
            onClick={onCancel}
            className="rounded border-black bg-gray px-4 py-2 font-bold text-black hover:bg-opacity-90"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded border-black bg-primary px-4 py-2 font-bold text-gray hover:bg-opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};
