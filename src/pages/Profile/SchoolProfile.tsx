import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { LocalStorageAuthUser, Partner } from '../../interfaces';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  fetchPartnerById,
  updateMongoPartner,
} from '../../store/reducers/partnerSlice';
import toast from 'react-hot-toast';
import { storage } from '../../services/firebase';
import { STATES } from '../../constants';
import { DefaultLogo } from '../../assets';
import { UserRolesEnum } from '../../utils/enums';

const SchoolProfile = () => {
  //////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { partner } = useSelector((state: RootState) => state.partner);
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : user;
  const role = localStorage.getItem('Role');
  const initialData: Partner = {
    name: authUser.partnerName,
    email: authUser?.email,
    mission: '',
    city: '',
    state: '',
    addressLine1: '',
    addressLine2: '',
    photoUrl: '',
    website: '',
    adminEmail: partner?.adminEmail,
    carouselImages: [],
    userId: '',
    zip: '',
    isTest: false,
  };
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  //////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////
  const [formData, setFormData] = useState<Partner>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [logoState, setLogoState] = useState({ loading: false, progress: 0 });
  const [mediaState, setMediaState] = useState({ loading: false, progress: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [media, setMedia] = useState(formData?.carouselImages || []);
  const [confirmUpload, setConfirmUpload] = useState<boolean>(false);
  //////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(fetchPartnerById(mongoInstituteId));
  }, []);
  useEffect(() => {
    setFormData({ ...initialData, ...(partner || {}) });
  }, [partner]);

  //////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };

  // const handleDelete = (index) => {
  //   setMedia((prevMedia) => prevMedia.filter((_, i) => i !== index));
  //   // You may need to update your backend or formData here
  // };

  const onUploadFile = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set preview immediately
        setImageToUpload(file); // Store the file for confirmation
        setConfirmUpload(true); // Enable confirmation actions
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmImageUpload = () => {
    if (imageToUpload) {
      const storageRef = ref(
        storage,
        `user-display-pictures/${user?.id}/${imageToUpload.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, imageToUpload);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setLogoState({ loading: true, progress });
        },
        (error) => {
          console.error('Error uploading file:', error);
          toast.error('Error uploading file.');
          setLogoState({ loading: false, progress: 0 });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setFormData((pre) => ({ ...pre, photoUrl: downloadURL }));

              dispatch<any>(
                updateMongoPartner({
                  partnerId: mongoInstituteId,
                  partnerData: { ...formData, photoUrl: downloadURL },
                }),
              )
                .then(({ payload }) => {
                  if (payload) {
                    setConfirmUpload(false);
                    setLogoState({ loading: false, progress: 0 });
                    setImagePreview(null);
                    setImageToUpload(null);
                    toast.success('Institution logo updated successfully.');
                  }
                })
                .finally(() => {
                  setLogoState({ loading: false, progress: 0 });
                  setImagePreview('');
                });
            })
            .catch((error) => {
              console.error('Error retrieving download URL:', error);
              setLogoState({ loading: false, progress: 0 });
            });
        },
      );
    }
  };

  // const onUploadFiles = async (inputImages: any[]) => {
  //   if (inputImages.length > 0) {
  //     try {
  //       await Promise.all(
  //         inputImages.map(async (file) => {
  //           const storageRef = ref(
  //             storage,
  //             `user-display-pictures/${user?.id}/${file.name}`,
  //           );
  //           const uploadTask = uploadBytesResumable(storageRef, file);
  //           await new Promise((resolve, reject) => {
  //             uploadTask.on(
  //               'state_changed',
  //               (snapshot) => {
  //                 const progress =
  //                   (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //                 setMediaState({ loading: true, progress });
  //               },
  //               (error) => {
  //                 console.error('Error uploading file:', error);
  //                 reject(error);
  //               },
  //               async () => {
  //                 try {
  //                   const downloadURL = await getDownloadURL(
  //                     uploadTask.snapshot.ref,
  //                   );
  //                   setFormData((pre) => ({
  //                     ...pre,
  //                     carouselImages: [
  //                       downloadURL,
  //                       ...(pre?.carouselImages || []),
  //                     ],
  //                   }));
  //                   resolve('');
  //                 } catch (error) {
  //                   console.error('Error retrieving download URL:', error);
  //                   reject(error);
  //                 }
  //               },
  //             );
  //           });
  //         }),
  //       );

  //       setMediaState({ loading: false, progress: 0 });
  //     } catch (error) {
  //       console.error('Error uploading files:', error);
  //     }
  //   }
  // };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    dispatch<any>(
      updateMongoPartner({
        partnerId: mongoInstituteId,
        partnerData: formData,
      }),
    )
      .then(({ payload }) => {
        if (payload) {
          toast.success('Institution details updated.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const validateForm = () => {
    if (!formData?.name) {
      toast.error('Name is missing.');
      return false;
    }
    if (!formData?.city) {
      toast.error('City is missing.');
      return false;
    }
    if (!formData?.state) {
      toast.error('State is missing.');
      return false;
    }
    if (!formData?.addressLine1) {
      toast.error('Address Line 1 is missing.');
      return false;
    }

    return true; // Return true if all validations pass
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Institution" />

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-5 xl:col-span-3 xl:order-1 order-2 ">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-7 dark:border-strokedark flex justify-between items-center ">
                  <h3 className="font-medium text-black dark:text-white">
                    Institution profile
                  </h3>
                </div>
                <div className="p-7">
                  <form onSubmit={onSubmit}>
                    {/* Name & Website */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="name"
                        >
                          Institution Name <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border text-sm border-stroke bg-gray py-3  px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="name"
                            disabled={role != UserRolesEnum.SchoolAdmin}
                            value={formData?.name}
                            onChange={onChange}
                            id="name"
                            placeholder="Institution Name"
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="website"
                        >
                          Institution Website
                        </label>
                        <input
                          className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="website"
                          disabled={role != UserRolesEnum.SchoolAdmin}
                          value={formData?.website}
                          onChange={onChange}
                          id="website"
                          placeholder="www.website.com"
                        />
                      </div>
                    </div>
                    {/* Tagline */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="tagLine"
                        >
                          Tagline <span className="text-red"></span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="tagLine"
                            disabled={role != UserRolesEnum.SchoolAdmin}
                            value={formData?.tagLine}
                            onChange={onChange}
                            id="tagLine"
                            placeholder="Tagline"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Mission */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="mission"
                        >
                          Mission
                        </label>
                        <div className="relative">
                          <textarea
                            className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            rows={3}
                            name="mission"
                            disabled={role != UserRolesEnum.SchoolAdmin}
                            value={formData?.mission}
                            onChange={onChange}
                            id="mission"
                            placeholder="Your mission goes here"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Admin Email & Role*/}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      {/* <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="email"
                        >
                          Email <span className="text-red">*</span>
                        </label>
                        <input
                          className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="email"
                          disabled={true}
                          value={formData?.email}
                          onChange={onChange}
                          id="email"
                          placeholder="email@example.com"
                        />
                      </div> */}
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="adminEmail"
                        >
                          Admin Email <span className="text-red">*</span>
                        </label>
                        <input
                          className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="adminEmail"
                          disabled={true}
                          value={formData?.adminEmail}
                          id="adminEmail"
                          placeholder="admin@gmail.com"
                        />
                      </div>
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="role"
                        >
                          Role <span className="text-red">*</span>
                        </label>
                        <input
                          className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="role"
                          disabled={true}
                          value={role}
                          onChange={onChange}
                          id="role"
                          placeholder="Role"
                        />
                      </div>
                    </div>

                    {/* Addres line 1 & Address line 2 */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="addressLine1"
                        >
                          Address Line 1 <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="addressLine1"
                            disabled={role != UserRolesEnum.SchoolAdmin}
                            value={formData?.addressLine1}
                            onChange={onChange}
                            id="addressLine1"
                            placeholder="Address Line 1"
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="addressLine2"
                        >
                          Address Line 2
                        </label>
                        <input
                          className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="addressLine2"
                          disabled={role != UserRolesEnum.SchoolAdmin}
                          value={formData?.addressLine2}
                          onChange={onChange}
                          id="addressLine2"
                          placeholder="Address Line 2"
                        />
                      </div>
                    </div>

                    {/* City & State */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="city"
                        >
                          City <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="city"
                            disabled={role != UserRolesEnum.SchoolAdmin}
                            value={formData?.city}
                            onChange={onChange}
                            id="city"
                            placeholder="City"
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="zip"
                        >
                          Zip
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="zip"
                            disabled={role != UserRolesEnum.SchoolAdmin}
                            value={formData?.zip}
                            onChange={onChange}
                            id="zip"
                            placeholder="Zip Code"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full ">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="state"
                      >
                        State <span className="text-red">*</span>
                      </label>
                      <select
                        className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="state"
                        onChange={onChange}
                        disabled={role != UserRolesEnum.SchoolAdmin}
                        value={formData?.state}
                        id="state"
                      >
                        {STATES?.map((e, index) => (
                          <option value={e.value} key={index}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {role == UserRolesEnum.SchoolAdmin && (
                      <div className="flex justify-end gap-4.5">
                        <button
                          className="flex justify-center text-sm rounded bg-graydark disabled:bg-primary/50 py-2 px-6 mt-6 font-medium text-gray hover:bg-opacity-90"
                          type="submit"
                          disabled={
                            loading || logoState.loading || mediaState.loading
                          }
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <div className="col-span-5 xl:col-span-2 xl:order-2 order-1 space-y-2 ">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                {/* Logo */}
                <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Institution Logo
                  </h3>
                </div>

                <div className="p-7">
                  {/* Upload progress message */}
                  {logoState.loading && (
                    <div className="mb-4 text-sm text-gray-500 text-center">
                      Uploading your logo - {logoState.progress.toFixed(1)}%
                      completed
                    </div>
                  )}

                  {/* Logo image container */}
                  <div className="flex justify-center mb-1">
                    <div className="relative group h-64 w-64 rounded-full overflow-hidden border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                      <img
                        src={imagePreview || formData?.photoUrl || DefaultLogo}
                        alt="Logo"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() =>
                          document.getElementById('fileInput')?.click()
                        }
                      >
                        <p className="text-white">Change Logo</p>
                      </div>
                    </div>
                  </div>

                  {/* File input */}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={role !== UserRolesEnum.SchoolAdmin}
                    onChange={(e) =>
                      onUploadFile(e.target.files ? e.target.files[0] : null)
                    }
                    id="fileInput"
                    className="hidden"
                    title="Upload Logo"
                    placeholder="Upload Logo"
                  />

                  {/* Confirm and Cancel buttons */}
                  {confirmUpload && (
                    <div className="flex justify-center space-x-4 mt-4">
                      <button
                        onClick={confirmImageUpload}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setConfirmUpload(false);
                          setImagePreview(''); // Clear the preview
                        }}
                        className="bg-[#DC143C] text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Media */}
                {/* <div className="border-t border-stroke py-4 px-7 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Institution Media
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
                    <div className="flex justify-between gap-2 w-full flex-wrap">
                      {formData?.carouselImages &&
                      formData.carouselImages.length > 0 ? (
                        formData.carouselImages.map((img, index) => (
                          <div
                            key={index}
                            className="relative h-28 w-1/2 md:w-1/4 rounded-sm overflow-hidden group"
                          >
                            <img
                              src={img || NoUser}
                              alt={`Media ${index}`}
                              className="object-cover w-full h-full"
                            />
                            {/* Delete button */}
                {/* <button
                              onClick={() => handleDelete(index)}
                              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </button> 
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">
                          No media uploaded
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    id="FileUpload"
                    className={`relative mb-5.5 block w-full ${UserRolesEnum.SchoolAdmin ? 'cursor-pointer' : 'cursor-default'} appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple={true}
                      disabled={role != UserRolesEnum.SchoolAdmin}
                      onChange={(e) => onUploadFiles([...e.target.files])}
                      className="absolute inset-0 z-50 m-0 h-full w-full p-0 opacity-0 outline-none"
                      title="Upload Media"
                      placeholder="Upload Media"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                        <Upload className="w-4 h-4" />
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                      <p>(max, 800 X 800px)</p>
                    </div>
                  </div>
                </div>*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SchoolProfile;
