import { ChangeEvent, FormEvent, useState } from 'react';
import NoUser from '../../images/user/no-user.jpg';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { registerEmployer } from '../../store/reducers/employersSlice';
import { Employer } from '../../interfaces';
import toast from 'react-hot-toast';
import { STATES } from '../../constants';
import { useStateContext } from '../../context/useStateContext';
import { Upload } from 'lucide-react';
import { convertToPng } from '../../utils/functions';

export const CreateBranch = ({
  initialData,
  branches,
}: {
  initialData: Employer;
  branches: Employer[];
}) => {
  //////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { setShowBranchForm } = useStateContext();

  //////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////
  const [formData, setFormData] = useState<Employer>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [logoState, setLogoState] = useState({ loading: false, progress: 0 });
  const [mediaState, setMediaState] = useState({ loading: false, progress: 0 });

  //////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////

  //////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };

  const onUploadFile = async (file: File) => {
    try {
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
          setLogoState({ loading: true, progress });
        },
        (error) => {
          console.error('Error uploading file:', error);
          setLogoState({ loading: false, progress: 0 });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setFormData((pre) => ({ ...pre, photoUrl: downloadURL }));
              setLogoState({ loading: false, progress: 0 });
            })
            .catch((error) => {
              console.error('Error retrieving download URL:', error);
              setLogoState({ loading: false, progress: 0 });
            });
        },
      );
    } catch (error) {
      console.error('Error converting file to PNG:', error);
      setLogoState({ loading: false, progress: 0 });
    }
  };

  const onUploadFiles = async (inputImages: any[]) => {
    if (inputImages.length > 0) {
      try {
        await Promise.all(
          inputImages.map(async (file) => {
            try {
              const pngFile = await convertToPng(file);
              const storageRef = ref(
                storage,
                `user-display-pictures/${user?.id}/${pngFile.name}`,
              );
              const uploadTask = uploadBytesResumable(storageRef, pngFile);
              await new Promise((resolve, reject) => {
                uploadTask.on(
                  'state_changed',
                  (snapshot) => {
                    const progress =
                      (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setMediaState({ loading: true, progress });
                  },
                  (error) => {
                    console.error('Error uploading file:', error);
                    reject(error);
                  },
                  async () => {
                    try {
                      const downloadURL = await getDownloadURL(
                        uploadTask.snapshot.ref,
                      );
                      setFormData((pre) => ({
                        ...pre,
                        media: [downloadURL, ...pre.media],
                      }));
                      resolve(downloadURL);
                    } catch (error) {
                      console.error('Error retrieving download URL:', error);
                      reject(error);
                    }
                  },
                );
              });
            } catch (error) {
              console.error('Error converting file to PNG:', error);
            }
          }),
        );

        setMediaState({ loading: false, progress: 0 });
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    }
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    dispatch<any>(registerEmployer(formData))
      .then(({ payload }) => {
        setLoading(false);
        if (payload) {
          setShowBranchForm(false);
          toast.success('Employer details updated.');
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error('Failed to update details.');
        console.error(error);
      });
  };

  const onCancel = (e) => {
    e.preventDefault();
    setShowBranchForm(false);
  };
  const validateForm = () => {
    if (!formData.branchLocation) {
      toast.error('Branch Location is missing.');
      return false;
    }

    // Check if the branch name already exists
    if (
      branches.some(
        (b) =>
          b.branchLocation.toLowerCase() ===
            formData.branchLocation.toLowerCase() && b.id !== initialData.id,
      )
    ) {
      toast.error('Branch name already exists.');
      return false;
    }
    if (
      branches.some(
        (b) =>
          b.branchLocation == formData.branchLocation &&
          initialData.branchLocation != formData.branchLocation,
      )
    ) {
      toast.error('Branch name already exists..');
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

    if (!formData.state) {
      toast.error('State is missing.');
      return false;
    }

    if (!formData.country) {
      toast.error('Country is missing.');
      return false;
    }

    if (!formData.zipCode) {
      toast.error('Zip Code is missing.');
      return false;
    }

    if (!formData.photoUrl) {
      toast.error('Logo is missing.');
      return false;
    }

    return true; // Return true if all validations pass
  };

  return (
    <div className="grid grid-cols-5 gap-8">
      <div className="col-span-5 xl:col-span-3 xl:order-1 order-2 ">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-7 dark:border-strokedark flex justify-between items-center ">
            <h3 className="font-medium text-black dark:text-white">
              Company profile
            </h3>
          </div>
          <div className="p-7">
            <form onSubmit={onSubmit}>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="name"
                  >
                    Company Name <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3  px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="name"
                      value={formData?.name}
                      onChange={onChange}
                      id="name"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="branchLocation"
                  >
                    Branch Name <span className="text-red">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="branchLocation"
                    value={formData?.branchLocation}
                    onChange={onChange}
                    id="branchLocation"
                    placeholder="Branch Name"
                  />
                </div>
              </div>

              <div className="mb-5.5">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="tagLine"
                >
                  Company Tagline
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3  px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="tagLine"
                    value={formData?.tagLine}
                    onChange={onChange}
                    id="tagLine"
                    placeholder="Tagline"
                  />
                </div>
              </div>

              <div className="mb-5.5">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="contactName"
                >
                  Recruiter name
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="contactName"
                  value={formData?.contactName}
                  onChange={onChange}
                  id="contactName"
                  placeholder="Devid Jhon"
                />
              </div>
              <div className="mb-5.5">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="email"
                >
                  Email <span className="text-red">*</span>
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="email"
                  disabled={true}
                  value={formData?.email}
                  onChange={onChange}
                  id="email"
                  placeholder="davidjhon@example.com"
                />
              </div>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="contactEmail"
                  >
                    Contact Email
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="contactEmail"
                    value={formData?.contactEmail || formData?.email}
                    onChange={onChange}
                    id="contactEmail"
                    placeholder={formData?.email}
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="contactNumber"
                  >
                    Contact Number
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="contactNumber"
                    value={formData?.contactNumber}
                    onChange={onChange}
                    id="contactNumber"
                    placeholder="+990 3343 7865"
                  />
                </div>
              </div>

              <div className="mb-5.5">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="description"
                >
                  Company Description
                </label>
                <div className="relative">
                  <textarea
                    className="w-full rounded border border-stroke bg-gray py-3  px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    name="description"
                    id="description"
                    value={formData?.description}
                    onChange={onChange}
                    rows={6}
                    placeholder="Write your company details here"
                  ></textarea>
                </div>
              </div>

              <div className="mb-5.5">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="addressLine1"
                >
                  Address Line 1 <span className="text-red">*</span>
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="addressLine1"
                  value={formData?.addressLine1}
                  onChange={onChange}
                  id="addressLine1"
                  placeholder="1234 Main St"
                />
              </div>

              <div className="mb-5.5">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="addressLine2"
                >
                  Address Line 2
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="addressLine2"
                  value={formData?.addressLine2}
                  onChange={onChange}
                  id="addressLine2"
                  placeholder="1234 Main St"
                />
              </div>

              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="city"
                  >
                    City <span className="text-red">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="city"
                    value={formData?.city}
                    onChange={onChange}
                    id="city"
                    placeholder="City"
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="state"
                  >
                    State <span className="text-red">*</span>
                  </label>
                  <select
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
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

              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="zipCode"
                  >
                    Zip Code <span className="text-red">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="zipCode"
                    value={formData?.zipCode}
                    onChange={onChange}
                    id="zipCode"
                    placeholder="Zip Code"
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="country"
                  >
                    Country <span className="text-red">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="country"
                    value={formData?.country}
                    onChange={onChange}
                    id="country"
                    placeholder="United State"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4.5">
                <button
                  onClick={onCancel}
                  className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  className="flex justify-center rounded bg-graydark disabled:bg-primary/50 py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                  type="submit"
                  disabled={loading || logoState.loading || mediaState.loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-span-5 xl:col-span-2 xl:order-2 order-1 space-y-2 ">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Logo */}
          <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Branch Logo
            </h3>
          </div>
          <div className="p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-14 w-14 rounded-full">
                <img
                  src={formData?.photoUrl || formData?.logo || NoUser}
                  alt="Logo"
                  className="object-cover rounded-full w-full h-full"
                />
              </div>
              <div>
                <span className="mb-1.5 text-black dark:text-white">
                  {logoState.loading
                    ? `Uploading your logo - ${logoState.progress.toFixed(1)}% completed`
                    : 'Edit your logo'}
                </span>
              </div>
            </div>

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
                  <Upload className="w-4 h-4" />
                </span>
                <p>
                  <span className="text-primary">Click to upload</span> or drag
                  and drop
                </p>
                <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                <p>(max, 800 X 800px)</p>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="border-t border-stroke py-4 px-7 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Branch Media
            </h3>
          </div>
          <div className="p-7">
            <div className="mb-4 flex flex-col items-center gap-3">
              <div>
                <span className="mb-1.5 text-black dark:text-white w-full ">
                  {mediaState.loading
                    ? `Uploading your media - ${mediaState.progress.toFixed(1)}% completed`
                    : ''}
                </span>
              </div>
              <div className="flex justify-between gap-2 w-full">
                {formData?.media?.map((img, index) => (
                  <div key={index} className="h-28 w-1/2 rounded-full">
                    <img
                      src={img || NoUser}
                      alt="User"
                      className="object-cover rounded-sm w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              id="FileUpload"
              className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
            >
              <input
                type="file"
                accept="image/*"
                multiple={true}
                onChange={(e) => onUploadFiles([...e.target.files])}
                className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                title="Upload Logo"
                placeholder="Upload Logo"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                  <Upload className="w-4 h-4" />
                </span>
                <p>
                  <span className="text-primary">Click to upload</span> or drag
                  and drop
                </p>
                <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                <p>(max, 800 X 800px)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
