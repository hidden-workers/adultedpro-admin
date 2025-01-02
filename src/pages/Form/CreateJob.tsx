import SelectPayPeriod from '../../components/Forms/SelectGroup/SelectPayPeriod';
import SelectLanguage from '../../components/Forms/SelectGroup/SelectLanguage';
import SelectShift from '../../components/Forms/SelectOption/SelectShifts';
import SelectDay from '../../components/Forms/SelectOption/SelectDays';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { useEffect, useState } from 'react';
import { Employer, Job } from '../../interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchEmployerBranchesByEmail } from '../../store/reducers/employersSlice';
import SelectShiftType from '../../components/Forms/SelectOption/SelectShiftType';
import SelectIsRemote from '../../components/Forms/SelectOption/SelectIsRemote';
import { STATES } from '../../constants';
import { createJob, updateJob } from '../../store/reducers/jobSlice';
import { useStateContext } from '../../context/useStateContext';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { convertToPng } from '../../utils/functions';
const CreateJob = ({ initialData }: { initialData: Job }) => {
  //////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { branches: fetchedBranches } = useSelector(
    (state: RootState) => state.employer,
  );
  const { isLoading, jobs } = useSelector((state: RootState) => state.job);
  const { setShowJobForm } = useStateContext();
  //////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////////
  const [formData, setFormData] = useState<Job>(initialData);
  const [branches, setBranches] = useState<Employer[]>(fetchedBranches || []);
  const [ongoingRecruitment, setOngoingRecruitment] = useState<boolean>(true);
  const [mediaState, setMediaState] = useState({ loading: false, progress: 0 });
console.log('initialData',initialData)
console.log('formData employer bio:', formData)
  //////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////
  // useEffect(() => {
  //   console.log('employer',employer)
  //   setFormData((pre) => ({
      
  //     ...pre,
  //     // employer data
  //     employerId: employer?.id,
  //     employerName: employer?.name || formData?.employerName,
  //     employerEmail: employer?.email || formData?.employerEmail,
  //     employerNumber: employer?.contactNumber || formData?.employerNumber,
  //     employerBio: employer?.bio ?? '',

  //     // contact/recuriter data
  //     contactBio: user?.bio ?? '',
  //     contactEmail: user?.email ?? '',
  //     contactName: user?.name ?? '',
  //     // @ts-expect-error: TypeScript error is ignored because `user?.contactNumber` may be undefined, and an empty string is used as a fallback.
  //     contactNumber: user?.contactNumber ?? initialData?.employerNumber,
  //     contactPhotoUrl: user?.photoUrl ?? '',
  //   }));
  // }, [user]);
  // useEffect(() => {
  //   console.log('email',initialData.employerEmail)
  //   dispatch<any>(fetchEmployersByEmail(initialData.employerEmail));
  // }, [initialData.employerEmail]);
  useEffect(() => {
    dispatch<any>(fetchEmployerBranchesByEmail(initialData.employerEmail));
  }, []);
  useEffect(() => {
    if (fetchedBranches) {
      setBranches(fetchedBranches);
      if (fetchedBranches.length == 1)
        setFormData((pre) => ({ ...pre, branchLocation: fetchedBranches[0] }));
    }
  }, [fetchedBranches]);

  //////////////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////////////////
  const onChange = (e) => {
    setFormData((pre) => ({ ...pre, [e.target?.name]: e.target?.value }));
  };
  const onOptionChange = (name: string, value: any | string[]) => {
    setFormData((pre) => ({ ...pre, [name]: value }));
  };
  const handleSubmit = async () => {
    const isFormValidated = validateForm();
    if (!isFormValidated) return;

    const apiKey = 'AIzaSyAsStHmbfEb90JiFTDExHOx-4Ge_zxn9nU';
    let currentJobLat = 0;
    let currentJoblng = 0;
    if (formData?.zipCode) {
      await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${formData?.zipCode}&key=${apiKey}`,
      )
        .then((response) => response?.json?.())
        .then((data) => {
          const { results } = data;
          if (
            results &&
            results.length > 0 &&
            results[0].geometry &&
            results[0].geometry.location
          ) {
            const { lat, lng } = results[0].geometry.location;
            currentJobLat = lat;
            currentJoblng = lng;
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
    const selectedBranch = branches.find(
      (branch) => branch.branchLocation === formData.branchLocation,
    );
    const jobData: Job = {
      ...formData,
      employerId: selectedBranch?.id,
      applyDate: new Date(),
      rankIndex: jobs.length + 1,
      _geoloc: { lat: currentJobLat, lng: currentJoblng },
    };
    // dispatch<any>(setJob(jobData)).then(() => {
    //   toast.success(`Job ${initialData.title ? 'updated' : 'created'}.`);
    //   setShowJobForm(false);
    // });

    if (initialData.title) {
      dispatch<any>(updateJob(jobData)).then(() => {
        toast.success(`Job updated.`);
        setShowJobForm(false);
      });
    } else {
      dispatch<any>(createJob(jobData)).then(() => {
        toast.success(`Job created.`);
        setShowJobForm(false);
      });
    }
  };

  const onUploadFile = async (file: File) => {
    try {
      // Convert the image to PNG before uploading
      const pngFile = await convertToPng(file);

      const storageRef = ref(
        storage,
        `user-display-pictures/${user?.id}/${pngFile.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, pngFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setMediaState({ loading: true, progress });
        },
        (error) => {
          console.error('Error uploading file:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setFormData((pre) => ({ ...pre, photoUrl: downloadURL }));
              setMediaState({ loading: false, progress: 0 });
            })
            .catch((error) => {
              console.error('Error retrieving download URL:', error);
            });
        },
      );
    } catch (error) {
      console.error('Error processing or uploading the file:', error);
    }
  };

  const validateForm = () => {
    if (!formData.title) {
      toast.error('Job Title is missing.');
      return false;
    }

    if (!formData.branchLocation) {
      toast.error('Branch Location is missing.');
      return false;
    }

    if (!formData.addressLine1) {
      toast.error('Address Line 1 is missing.');
      return false;
    }

    if (!formData.city) {
      toast.error('City is missing.');
      return false;
    }

    if (!formData.zipCode) {
      toast.error('Zip Code is missing.');
      return false;
    }

    if (!formData.state) {
      toast.error('State is missing.');
      return false;
    }

    if (!formData.language) {
      toast.error('Language is missing.');
      return false;
    }

    if (!formData.hours) {
      toast.error('Hours is missing.');
      return false;
    }

    if (!formData.pay) {
      toast.error('Pay is missing.');
      return false;
    }

    if (!formData.payPeriod) {
      toast.error('Pay Period is missing.');
      return false;
    }

    if (formData.days.length === 0) {
      toast.error('Days are missing.');
      return false;
    }

    if (formData.shift.length === 0) {
      toast.error('Shifts are missing.');
      return false;
    }

    if (ongoingRecruitment) {
      formData.expireDate = '';
    } else {
      if (!formData.expireDate) {
        toast.error('Expiration date is missing.');
        return false;
      }
      formData.expireDate = new Date(formData.expireDate);
    }

    if (
      Boolean(formData.expireDate) && // if expireDate exists then compare (as expireDate is optional)
      formData.expireDate <= new Date()
    ) {
      toast.error('Expiration date must be in future.');
      return false;
    }

    if (!formData.description) {
      toast.error('Job Description is missing.');
      return false;
    }

    return true; // Return true if all validations pass
  };

  return (
    <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div className="flex flex-col gap-9">
        {/* <!-- Contact Form 2 --> */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">Job Form</h3>
          </div>
          <form action="#">
            <div className="p-6.5">
              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                {/* Job Title */}
                <div className="w-full xl:w-1/2">
                  <label
                    htmlFor="title"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Job Title <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    placeholder="Title..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                {/* Branch Name */}
                <div className="mb-5 w-full xl:w-1/2">
                  <label
                    htmlFor="branchLocation"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Branch Name <span className="text-red">*</span>
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 pl-2 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    name="branchLocation"
                    onChange={onChange}
                    value={formData.branchLocation}
                    id="branchLocation"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((e, index) => (
                      <option value={e.branchLocation} key={index}>
                        {e.branchLocation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employer Name */}
              <div className="mb-6">
                <label
                  htmlFor="employerName"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Employer Name{' '}
                  <span className="text-body">(From Employer Profile)</span>
                </label>
                <input
                  type="text"
                  name="employerName"
                  disabled={true}
                  value={formData.employerName}
                  onChange={onChange}
                  placeholder="Name..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Employer Email */}
              <div className="mb-6">
                <label
                  htmlFor="employerEmail"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Employer Email{' '}
                  <span className="text-body">(From Employer Profile)</span>
                </label>
                <input
                  type="email"
                  name="employerEmail"
                  disabled={true}
                  value={formData.employerEmail}
                  onChange={onChange}
                  placeholder="yourmail@gmail.com"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Employer Phone */}
              <div className="mb-6">
                <label
                  htmlFor="employerNumber"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Employer Phone{' '}
                  <span className="text-body">(From Employer Profile)</span>
                </label>
                <input
                  type="text"
                  name="employerNumber"
                  disabled={Boolean(user?.phone)}
                  value={formData.employerNumber}
                  onChange={onChange}
                  placeholder="(321) 5555-0115"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Employer Bio */}
              <div className="mb-6">
                <label
                  htmlFor="employerBio"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Employer Bio{' '}
                  <span className="text-body">(From Employer Profile)</span>
                </label>
                <textarea
                  rows={6}
                  name="employerBio"
                  value={formData.employerBio}
                  onChange={onChange}
                  placeholder="Please tell us about yourself here"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Employer Photourl */}
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                Employer PhotoUrl
                </h3>
              </div>
              <div className="p-7">
                <div
                  className={`${formData?.employerPhotoUrl ? 'hidden' : 'flex'} mb-4 flex items-center gap-3`}
                >
                  <span className="mb-1.5 text-black dark:text-white">
                    {mediaState.loading
                      ? `Uploading your Media - ${mediaState.progress.toFixed(1)}% completed`
                      : 'Edit your Media'}
                  </span>
                </div>

                {formData?.employerPhotoUrl ? (
                  <div className="relative group h-60 mb-5.5 block w-full">
                    <button
                      title="Remove"
                      onClick={() =>
                        setFormData((pre) => ({ ...pre, employerPhotoUrl: '' }))
                      }
                      className="group-hover:block hidden cursor-pointer absolute top-2 right-2 bg-white text-black rounded-full "
                    >
                      <X />
                    </button>
                    <img
                      src={formData?.employerPhotoUrl}
                      alt="Media"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ) : (
                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onUploadFile(e.target.files[0])}
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                      title="Upload Employer PhotoUrl"
                      placeholder="Upload Employer PhotoUrl"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                            fill="#3C50E0"
                          />
                        </svg>
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                      <p>(max, 800 X 800px)</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contact Email */}
              <div className="mb-6">
                <label
                  htmlFor="contactEmail"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Contact Email{' '}
                </label>
                <input
                  type="text"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={onChange}
                  placeholder="xyz@gmail.com"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Contact Name */}
              <div className="mb-6">
                <label
                  htmlFor="contactName"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Contact Name{' '}
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={onChange}
                  placeholder="name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Contact Number */}
              <div className="mb-6">
                <label
                  htmlFor="contactNumber"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Contact Number{' '}
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={onChange}
                  placeholder="(321) 5555-0115"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Contact Biography */}
              <div className="mb-6">
                <label
                  htmlFor="contactBio"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Recruiter Profile
                </label>
                <textarea
                  rows={6}
                  name="contactBio"
                  value={formData.contactBio}
                  onChange={onChange}
                  placeholder="Please tell us about yourself here"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Job Link */}
              <div className="mb-6">
                <label
                  htmlFor="jobLink"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Job Link{' '}
                </label>
                <input
                  type="text"
                  name="jobLink"
                  value={formData.jobLink}
                  onChange={onChange}
                  placeholder="job link"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Address Line 1 */}
              <div className="xl:w-1/1 mb-5 w-full">
                <label
                  htmlFor="addressLine1"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Job Location Address 1 <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={onChange}
                  placeholder="ABC..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Address Line 2 */}
              <div className="xl:w-1/1 mb-5 w-full">
                <label
                  htmlFor="addressLine2"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Job Location Address 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={onChange}
                  placeholder="XYZ..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* City */}
              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label
                    htmlFor="noOfPositions"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    No of Positions <span className="text-red">*</span>
                  </label>
                  <input
                    type="number"
                    name="noOfPositions"
                    value={formData.noOfPositions}
                    onChange={onChange}
                    placeholder="XYZ..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label
                    htmlFor="city"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    City <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={onChange}
                    placeholder="XYZ..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label
                    htmlFor="country"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={onChange}
                    placeholder="XYZ..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                {/* Zip Code */}
                <div className="w-full xl:w-1/2">
                  <label
                    htmlFor="zipCode"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Zip-Code <span className="text-red">*</span>
                  </label>
                  <input
                    type="number"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={onChange}
                    placeholder="13422..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                {/* State */}
                <div className="w-full xl:w-1/2">
                  <label
                    htmlFor="state"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    State <span className="text-red">*</span>
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    name="state"
                    onChange={onChange}
                    value={formData?.state}
                    id="state"
                  >
                    {STATES.map((e, index) => (
                      <option value={e.value} key={index}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Job Expire Date */}
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Job Expire Date
                </label>

                <label className="relative flex cursor-pointer select-none items-center gap-2 py-3 text-sm font-medium text-black dark:text-white">
                  <input
                    className="sr-only"
                    type="checkbox"
                    name="recommend"
                    onChange={(e) => {
                      setOngoingRecruitment(e.target.checked);
                      setFormData((pre) => ({ ...pre, expireDate: '' }));
                    }}
                    checked={ongoingRecruitment}
                  />
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                      ongoingRecruitment ? 'border-primary' : 'border-body'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-sm bg-primary ${
                        ongoingRecruitment ? 'flex' : 'hidden'
                      }`}
                    />
                  </span>
                  Ongoing Recruitement
                </label>
                {!ongoingRecruitment && (
                  <input
                    type="date"
                    name="expireDate"
                    value={formData.expireDate}
                    onChange={onChange}
                    placeholder="Job Expire Date"
                    min={new Date().toISOString().split('T')[0]} // Set the minimum date to today
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                )}
              </div>

              {/* Keywords */}
              <div className="mb-6">
                <label
                  htmlFor="searchKeywords"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Keywords
                </label>
                <textarea
                  rows={2}
                  name="searchKeywords"
                  value={formData.searchKeywords}
                  onChange={onChange}
                  placeholder="Nursing, Care, CNA..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              
            </div>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-9 ">
        {/* <!-- Survey Form --> */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white ">
              Continuation
            </h3>
          </div>
          <form action="#">
            <div className="p-6.5">
              <SelectLanguage onChange={onChange} value={formData.language} />

              <SelectIsRemote
                onChange={onOptionChange}
                value={formData.isRemote}
              />

              {/* Hour in a week */}
              <div className="xl:w-1/1 mb-5 w-full">
                <label
                  htmlFor="hours"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Hours per week <span className="text-red">*</span>
                </label>
                <input
                  type="number"
                  max={144}
                  name="hours"
                  value={formData.hours}
                  onChange={onChange}
                  placeholder="numeric values only e.g: 10"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Hours Description */}
              <div className="mb-6">
                <label
                  htmlFor="hoursDescription"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Hours Description
                </label>
                <textarea
                  rows={2}
                  name="hoursDescription"
                  value={formData.hoursDescription}
                  onChange={onChange}
                  placeholder="e.g 2 hours on Sunday, 4 hours on Saturday..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Pay */}
              <div className="xl:w-1/1 mb-5 w-full">
                <label
                  htmlFor="pay"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Pay <span className="text-red">*</span>
                </label>
                <input
                  type="text" // Keep type as 'text' to avoid issues with 'e' input in 'number' type
                  name="pay"
                  value={formData.pay}
                  onChange={(e) => {
                    // Allow only numeric values (excluding "e", "+", "-", etc.)
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    onChange({ target: { name: e.target.name, value } });
                  }}
                  placeholder="Enter Figures In Numeric"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <SelectPayPeriod onChange={onChange} value={formData.payPeriod} />

              {/* Pay Description */}
              <div className="mb-6">
                <label
                  htmlFor="payDescription"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Pay Description
                </label>
                <textarea
                  rows={2}
                  name="payDescription"
                  value={formData.payDescription}
                  onChange={onChange}
                  placeholder="Negotiable Base 10$ an hour"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <SelectDay
                onChange={onOptionChange}
                defaultValue={initialData.days}
              />

              {/* Days Description */}
              <div className="mb-6">
                <label
                  htmlFor="daysDescription"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Days Description
                </label>
                <textarea
                  rows={2}
                  name="daysDescription"
                  value={formData.daysDescription}
                  onChange={onChange}
                  placeholder="Hours On Monday, Tuesday, Wednesday"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Shift */}
              <SelectShift
                onChange={onOptionChange}
                defaultValue={initialData.shift}
              />

              {/* Shift Description - FullTime/PartTime/Flexible*/}
              <SelectShiftType
                onChange={onOptionChange}
                defaultValue={initialData.shiftDescription}
              />

              {/* Job Description */}
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Job Description <span className="text-red">*</span>
                </label>
                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  placeholder="Preferred candidates will have background in Nursing program. Work in a dynamic environment, learn following skills etc"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Logo */}
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Job Media
                </h3>
              </div>
              <div className="p-7">
                <div
                  className={`${formData?.photoUrl ? 'hidden' : 'flex'} mb-4 flex items-center gap-3`}
                >
                  <span className="mb-1.5 text-black dark:text-white">
                    {mediaState.loading
                      ? `Uploading your Media - ${mediaState.progress.toFixed(1)}% completed`
                      : 'Edit your Media'}
                  </span>
                </div>

                {formData?.photoUrl ? (
                  <div className="relative group h-60 mb-5.5 block w-full">
                    <button
                      title="Remove"
                      onClick={() =>
                        setFormData((pre) => ({ ...pre, photoUrl: '' }))
                      }
                      className="group-hover:block hidden cursor-pointer absolute top-2 right-2 bg-white text-black rounded-full "
                    >
                      <X />
                    </button>
                    <img
                      src={formData?.photoUrl}
                      alt="Media"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ) : (
                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onUploadFile(e.target.files[0])}
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                      title="Upload Logo"
                      placeholder="Upload Logo"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                            fill="#3C50E0"
                          />
                        </svg>
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                      <p>(max, 800 X 800px)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Program */}
              {/* <div className="mb-6">
                <label
                  htmlFor="program"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Program 
                </label>
                <textarea
                  rows={5}
                  name="program"
                  value={formData.program}
                  onChange={onChange}
                  placeholder=""
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div> */}

              {/* Rank Index */}
              {/* <div className="w-full xl:w-1/2">
                <label
                  htmlFor="rankIndex"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Rank Index
                </label>
                <input
                  type="number"
                  name="rankIndex"
                  value={formData.rankIndex}
                  onChange={onChange}
                  placeholder="1..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div> */}

              {/* Geo Location*/}
              {/* <div className="w-full xl:w-1/2 mt-10">
                <label
                  htmlFor="geoLocation"
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                >
                  Geo Location
                </label>
                <input
                  type="text"
                  name="geoLocation"
                  value={`${formData._geoloc.lat}, ${formData._geoloc.lng}`} 
                  onChange={onChange}
                  placeholder="Enter geo location"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div> */}
            </div>
          </form>

          <div className="flex items-center justify-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex w-[90%] justify-center rounded bg-primary p-3 mb-4 font-medium text-gray hover:bg-opacity-90 disabled:cursor-default disabled:opacity-75 "
            >
              {isLoading
                ? 'Processing...'
                : initialData.title
                  ? 'Save changes'
                  : 'Complete Form'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
