import noUser from '../../images/user/no-user.jpg';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setEmployer,
  setEmployerSlice,
  updateEmployer,
} from '../../store/reducers/employersSlice';
import { Employer } from '../../interfaces';
import toast from 'react-hot-toast';
import { useStateContext } from '../../context/useStateContext';
import { Tooltip, IconButton } from '@mui/material';
import { Pencil, Trash, Upload } from 'lucide-react';
import { STATES } from '../../constants';
import { convertToPng } from '../../utils/functions';

export const UpdateMainBranchDetail = ({
  initialData,
}: {
  initialData: Employer;
}) => {
  //////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { employer, branches } = useSelector(
    (state: RootState) => state.employer,
  );
  const { showUpdateMainBranch, setShowUpdateMainBranch, setMainBranch } =
    useStateContext();
  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : user;

  //////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////
  const [primaryData, setPrimaryData] = useState<Employer>(initialData); // primaryDetails are associated with each branch
  const [additionalData, setAdditionalData] = useState<Employer>(initialData); // here, additionDetails are associated with main branch only
  const [loading, setLoading] = useState<boolean>(false);
  const [logoState, setLogoState] = useState({ loading: false, progress: 0 });
  const [mediaState, setMediaState] = useState({ loading: false, progress: 0 });
  const [cultureMediaState, setCultureMediaState] = useState({
    loading: false,
    progress: 0,
  });

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////
  useEffect(() => {
    setPrimaryData(initialData);
    setAdditionalData(initialData);
  }, [initialData]);

  //////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onPrimaryDataChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setPrimaryData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onAdditionalDataChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setAdditionalData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onSocialMediaLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const updatedLinks = [...(primaryData?.socialMediaLinks || [])]; // Create a copy of the socialMediaLinks array or initialize it as an empty array if it's undefined
    updatedLinks[index] = e.target.value; // Update the link at the specified index
    setPrimaryData((prevState) => ({
      ...prevState,
      socialMediaLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const removeSocialMediaLink = (index: number) => {
    const updatedLinks = [...(primaryData?.socialMediaLinks || [])]; // Create a copy of the socialMediaLinks array or initialize it as an empty array if it's undefined
    updatedLinks.splice(index, 1); // Remove the link at the specified index
    setPrimaryData((prevState) => ({
      ...prevState,
      socialMediaLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const addSocialMediaLink = () => {
    const updatedLinks = [...(primaryData?.socialMediaLinks || []), '']; // Add an empty string for a new link
    setPrimaryData((prevState) => ({
      ...prevState,
      socialMediaLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const onAlumniLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const updatedLinks = [...(primaryData?.alumniLinks || [])]; // Create a copy of the alumniLinks array or initialize it as an empty array if it's undefined
    updatedLinks[index] = e.target.value; // Update the link at the specified index
    setPrimaryData((prevState) => ({
      ...prevState,
      alumniLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const removeAlumniLink = (index: number) => {
    const updatedLinks = [...(primaryData?.alumniLinks || [])]; // Create a copy of the alumniLinks array or initialize it as an empty array if it's undefined
    updatedLinks.splice(index, 1); // Remove the link at the specified index
    setPrimaryData((prevState) => ({
      ...prevState,
      alumniLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const addAlumniLink = () => {
    const updatedLinks = [...(primaryData?.alumniLinks || []), '']; // Add an empty string for a new link
    setPrimaryData((prevState) => ({
      ...prevState,
      alumniLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const onUploadFile = async (file: any, type: 'banner' | 'logo') => {
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
          if (type === 'banner') {
            setMediaState({ loading: true, progress });
          } else {
            setLogoState({ loading: true, progress });
          }
        },
        (error) => {
          console.error('Error uploading file:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              if (type == 'banner') {
                setPrimaryData((pre) => ({ ...pre, bannerImage: downloadURL }));
                setMediaState({ loading: false, progress: 0 });
              } else {
                setPrimaryData((pre) => ({ ...pre, photoUrl: downloadURL }));
                setLogoState({ loading: false, progress: 0 });
              }
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
  const onUploadCultureMedia = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setCultureMediaState({ loading: true, progress: 0 }); // Initialize loading state
      try {
        const uploadedUrl = await uploadFile(
          file,
          'culture-media',
          (progress) => {
            setCultureMediaState((prevState) => ({
              ...prevState,
              progress, // Update progress
            }));
          },
        );

        setPrimaryData((prevState) => ({
          ...prevState,
          cultureMedia: [...(prevState.cultureMedia || []), uploadedUrl],
        }));

        setCultureMediaState({ loading: false, progress: 100 });
      } catch (error) {
        console.error('Error uploading culture media:', error);
        setCultureMediaState({ loading: false, progress: 0 });
      }
    }
  };
  const uploadFile = async (
    file: File,
    folder: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> => {
    const pngFile = await convertToPng(file);

    const storageRef = ref(storage, `${folder}/${pngFile.name}`);

    const uploadTask = uploadBytesResumable(storageRef, pngFile);
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress); // Call the progress callback to update UI
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };

  const onSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!validatePrimaryData()) return;
    if (!validateAdditionalData()) return;

    setLoading(true);

    const primaryDetails = {
      photoUrl: primaryData?.photoUrl,
      bannerImage: primaryData?.bannerImage,
      name: primaryData?.name,
      companySize: primaryData?.companySize,
      cultureAndEnvironment: primaryData?.cultureAndEnvironment,
      benefitsAndPerks: primaryData?.benefitsAndPerks,
      mission: primaryData?.mission,
      awardsAndAccolades: primaryData?.awardsAndAccolades,
      description: primaryData?.description,
      socialMediaLinks: primaryData?.socialMediaLinks ?? [],
      alumniLinks: primaryData?.alumniLinks ?? [],
      cultureMedia: primaryData?.cultureMedia ?? [],
    };

    const additional = {
      addressLine1: additionalData?.addressLine1,
      branchLocation: additionalData?.branchLocation,
      tagLine: additionalData?.tagLine,
      contactName: additionalData?.contactName,
      contactEmail: additionalData?.contactEmail,
      contactNumber: additionalData?.contactNumber,
      addressLine2: additionalData?.addressLine2,
      city: additionalData?.city,
      state: additionalData?.state,
      zipCode: additionalData?.zipCode,
      country: additionalData.country,
    };
    dispatch<any>(
      updateEmployer({ ...initialData, ...additional, ...primaryDetails }),
    ).then(() => {
      const data: Employer = {
        ...{ email: authUser?.email },
        ...employer,
        ...additionalData,
        ...primaryDetails,
      };

      dispatch<any>(setEmployer(data)).then(({ payload }) => {
        if (payload) {
          dispatch<any>(setEmployerSlice(payload));
          toast.success('Main branch details updated.');
        }
        setMainBranch((pre) => ({ ...pre, ...primaryDetails }));
        onCancel();
        setLoading(false);
      });
    });
  };
  const validatePrimaryData = () => {
    if (!primaryData?.name) {
      alert('Company Name is missing.');
      return false;
    }

    if (!primaryData?.description) {
      alert('Brief Description is missing.');
      return false;
    }

    if (!primaryData?.bannerImage) {
      alert('Banner Image is missing.');
      return false;
    }

    return true; // Return true if all validations pass
  };
  const validateAdditionalData = () => {
    if (!additionalData?.branchLocation) {
      alert('Branch Location is missing.');
      return false;
    }

    if (
      branches.some(
        (b) =>
          b?.branchLocation == additionalData?.branchLocation &&
          initialData.branchLocation != additionalData?.branchLocation,
      )
    ) {
      alert('Branch name already exists..');
      return false;
    }

    if (!additionalData?.addressLine1) {
      alert('Address Line 1 is missing.');
      return false;
    }

    if (!additionalData?.city) {
      alert('City is missing.');
      return false;
    }

    if (!additionalData?.state) {
      alert('State is missing.');
      return false;
    }

    if (!additionalData?.country) {
      alert('Country is missing.');
      return false;
    }

    if (!additionalData?.zipCode) {
      alert('Zip Code is missing.');
      return false;
    }

    return true; // Return true if all validations pass
  };
  const onCancel = () => {
    setShowUpdateMainBranch(false);
    setPrimaryData(initialData);
    setAdditionalData(initialData);
  };

  return (
    <div>
      <div className="relative inline-block text-left">
        {branches.length != 0 ? (
          <Tooltip title="Edit Basic Details" placement="top">
            <IconButton
              ref={trigger}
              onClick={() => setShowUpdateMainBranch((prev) => !prev)}
            >
              <Pencil className="text-gray-icon" />
            </IconButton>
          </Tooltip>
        ) : (
          <button
            onClick={() => setShowUpdateMainBranch((prev) => !prev)}
            className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
          >
            Add main branch details
          </button>
        )}
      </div>

      {showUpdateMainBranch && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
          <div
            ref={modal}
            className="max-h-[90vh] max-w-[1000px] min-h-[90vh] w-[90vw] space-y-4 overflow-auto rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:px-12 md:py-8 "
          >
            <div className="flex w-full items-center justify-between">
              <h4 className="text-2xl font-semibold text-black dark:text-white">
                Main Branch Details
              </h4>
              <div className="flex justify-end gap-4.5">
                <button
                  className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  className="flex justify-center rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                  onClick={() => onSubmit()}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              <div className="">
                <h3 className="my-4 text-start text-xl font-semibold text-black ">
                  Primary Details
                </h3>

                {/* Logo & BannerImage */}
                <div className="mb-3 flex flex-col justify-start gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="name"
                    >
                      Logo <span className="text-red">*</span>
                    </label>
                    <div className="">
                      <div className="mb-4 flex items-center gap-3">
                        <div>
                          <span className="mb-1.5 text-black dark:text-white">
                            {logoState.loading ? (
                              `Uploading your logo - ${logoState.progress.toFixed(
                                1,
                              )}% completed`
                            ) : (
                              <img
                                src={
                                  primaryData?.photoUrl ||
                                  primaryData?.logo ||
                                  noUser
                                }
                                alt="Logo"
                                className="h-14 w-14 rounded-full object-cover"
                              />
                            )}
                          </span>
                        </div>
                      </div>

                      <div
                        id="FileUpload"
                        className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            onUploadFile(e.target.files[0], 'logo')
                          }
                          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                          title="Upload Logo"
                          placeholder="Upload Logo"
                        />
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Upload />
                          <p>
                            <span className="text-primary">
                              Click to upload
                            </span>{' '}
                            or drag and drop
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="name"
                    >
                      Banner Image <span className="text-red">*</span>
                    </label>
                    <div className="">
                      <div className="mb-4 flex items-center gap-3">
                        <div>
                          <span className="mb-1.5 text-black dark:text-white">
                            {mediaState.loading ? (
                              `Uploading your banner image - ${mediaState.progress.toFixed(
                                1,
                              )}% completed`
                            ) : primaryData?.bannerImage ? (
                              <img
                                src={primaryData?.bannerImage}
                                alt="Logo"
                                className="h-14 w-14 rounded-sm object-cover"
                              />
                            ) : (
                              <div className="h-14 w-14" />
                            )}
                          </span>
                        </div>
                      </div>

                      <div
                        id="FileUpload"
                        className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            onUploadFile(e.target.files[0], 'banner')
                          }
                          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                          title="Upload"
                          placeholder="Upload"
                        />
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Upload />
                          <p>
                            <span className="text-primary">
                              Click to upload
                            </span>{' '}
                            or drag and drop
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & Company Size */}
                <div className="mb-3 flex flex-col justify-start gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="name"
                    >
                      Company Name <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5  py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="name"
                        value={primaryData?.name}
                        onChange={onPrimaryDataChange}
                        id="name"
                        placeholder="Company Name"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="companySize"
                    >
                      Size of Company
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="companySize"
                      value={primaryData?.companySize}
                      onChange={onPrimaryDataChange}
                      id="companySize"
                      placeholder="Size of Company"
                    />
                  </div>
                </div>

                {/* CultureAndEnvironment & BenefitsAndPerks */}
                <div className="mb-3 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="cultureAndEnvironment"
                    >
                      Culture & Environment
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="cultureAndEnvironment"
                        id="cultureAndEnvironment"
                        value={primaryData?.cultureAndEnvironment}
                        onChange={onPrimaryDataChange}
                        rows={3}
                        placeholder="Culture & Environment"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="benefitsAndPerks"
                    >
                      Benefits & Perks
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full rounded border border-stroke bg-gray px-4.5  py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="benefitsAndPerks"
                        value={primaryData?.benefitsAndPerks}
                        onChange={onPrimaryDataChange}
                        id="benefitsAndPerks"
                        rows={3}
                        placeholder="Benefits And Perks"
                      />
                    </div>
                  </div>
                </div>

                {/* Awards and accolades */}
                <div className="mb-3 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="mission"
                    >
                      Mission
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="mission"
                        id="mission"
                        value={primaryData?.mission}
                        onChange={onPrimaryDataChange}
                        rows={2}
                        placeholder="Mission"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="awardsAndAccolades"
                    >
                      Awards & Accolades
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="awardsAndAccolades"
                        id="awardsAndAccolades"
                        value={primaryData?.awardsAndAccolades}
                        onChange={onPrimaryDataChange}
                        rows={2}
                        placeholder="Awards & Accolades"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                    htmlFor="description"
                  >
                    Company Description <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="description"
                      id="description"
                      value={primaryData?.description}
                      onChange={onPrimaryDataChange}
                      rows={5}
                      placeholder="Write your company details here"
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="mb-3">
                  <div className="mb-3 flex items-center justify-between ">
                    <label
                      className="block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="socialMediaLinks"
                    >
                      Social Media Links
                    </label>
                    <button
                      className="text-md rounded font-medium text-primary/90 hover:underline "
                      onClick={(e) => {
                        e.preventDefault();
                        addSocialMediaLink();
                      }}
                    >
                      Add Social Media Link
                    </button>
                  </div>
                  {primaryData?.socialMediaLinks?.map((link, index) => (
                    <div key={index} className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name={`socialMediaLinks[${index}]`}
                        value={link}
                        onChange={(e) => onSocialMediaLinkChange(e, index)}
                        placeholder="Social Media Link"
                      />
                      <button
                        type="button"
                        title="Delete"
                        className="hover:text-red-icon absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-icon"
                        onClick={(e) => {
                          e.preventDefault();
                          removeSocialMediaLink(index);
                        }}
                      >
                        <Trash />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Alumni Links */}
                <div className="mb-3">
                  <div className="mb-3 flex items-center justify-between ">
                    <label
                      className="block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="socialMediaLinks"
                    >
                      Alumni Links
                    </label>
                    <button
                      className="text-md rounded font-medium text-primary/90 hover:underline "
                      onClick={(e) => {
                        e.preventDefault();
                        addAlumniLink();
                      }}
                    >
                      Add Alumni Link
                    </button>
                  </div>
                  {primaryData?.alumniLinks?.map((link, index) => (
                    <div key={index} className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name={`alumniLinks[${index}]`}
                        value={link}
                        onChange={(e) => onAlumniLinkChange(e, index)}
                        placeholder="Alumni Link"
                      />
                      <button
                        type="button"
                        title="Remove"
                        className="hover:text-red-icon absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-icon"
                        onClick={(e) => {
                          e.preventDefault();
                          removeAlumniLink(index);
                        }}
                      >
                        <Trash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Culture Media */}
              {/* Culture Media */}
              <div className="mb-3 flex flex-col justify-start gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-start text-sm font-medium text-black dark:text-white"
                    htmlFor="cultureMedia"
                  >
                    Culture Media <span className="text-red">*</span>
                  </label>
                  <div className="">
                    <div className="mb-4 flex items-center gap-3">
                      {cultureMediaState.loading ? (
                        <span className="text-black dark:text-white">
                          Uploading your culture media -{' '}
                          {cultureMediaState.progress.toFixed(1)}% completed
                        </span>
                      ) : (
                        primaryData?.cultureMedia?.map((media, index) => (
                          <div key={index}>
                            <img
                              src={media}
                              // alt={`Culture Media ${index + 1}`}
                              className="h-14 w-14 rounded-sm object-cover"
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div
                      id="FileUpload"
                      className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onUploadCultureMedia(e)}
                        className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                        title="Upload Culture Media"
                        placeholder="Upload Culture Media"
                      />
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Upload />
                        <p>
                          <span className="text-primary">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        {cultureMediaState.loading && (
                          <p className="text-gray-700">
                            Uploading: {cultureMediaState.progress}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Data */}
              <div className="">
                <h3 className="my-4 text-start text-xl font-semibold text-black ">
                  Additional Details
                </h3>

                {/* Company Name & Branch Name */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="branchLocation"
                    >
                      Branch Name <span className="text-red">*</span>
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="branchLocation"
                      value={additionalData?.branchLocation}
                      onChange={onAdditionalDataChange}
                      id="branchLocation"
                      placeholder="Branch Name"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="email"
                    >
                      Email <span className="text-red">*</span>
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="email"
                      disabled={true}
                      value={authUser?.email}
                      onChange={onAdditionalDataChange}
                      id="email"
                      placeholder="davidjhon@example.com"
                    />
                  </div>
                </div>

                {/* Company Tagline & Recruiter Name */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="tagLine"
                    >
                      Company Tagline
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5  py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="tagLine"
                        value={additionalData?.tagLine}
                        onChange={onAdditionalDataChange}
                        id="tagLine"
                        placeholder="Tagline"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="contactName"
                    >
                      Recruiter name
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="contactName"
                      value={additionalData?.contactName}
                      onChange={onAdditionalDataChange}
                      id="contactName"
                      placeholder="Devid Jhon"
                    />
                  </div>
                </div>

                {/* Contact Email & Contact Number */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="contactEmail"
                    >
                      Contact Email
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="contactEmail"
                      value={
                        additionalData?.contactEmail || additionalData?.email
                      } //if there is no contact email then default it to main email
                      onChange={onAdditionalDataChange}
                      id="contactEmail"
                      placeholder={additionalData?.email}
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="contactNumber"
                    >
                      Contact Number
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="contactNumber"
                      value={additionalData?.contactNumber}
                      onChange={onAdditionalDataChange}
                      id="contactNumber"
                      placeholder="+990 3343 7865"
                    />
                  </div>
                </div>

                {/* Address Line 1 & Address Line 2 */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="addressLine1"
                    >
                      Address Line 1 <span className="text-red">*</span>
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="addressLine1"
                      value={additionalData?.addressLine1}
                      onChange={onAdditionalDataChange}
                      id="addressLine1"
                      placeholder="1234 Main St"
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="addressLine2"
                    >
                      Address Line 2
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="addressLine2"
                      value={additionalData?.addressLine2}
                      onChange={onAdditionalDataChange}
                      id="addressLine2"
                      placeholder="1234 Main St"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="city"
                    >
                      City <span className="text-red">*</span>
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="city"
                      value={additionalData?.city}
                      onChange={onAdditionalDataChange}
                      id="city"
                      placeholder="City"
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="state"
                    >
                      State <span className="text-red">*</span>
                    </label>
                    <select
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="state"
                      onChange={onAdditionalDataChange}
                      value={additionalData?.state}
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

                {/* Zip Code & Country */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="zipCode"
                    >
                      Zip Code <span className="text-red">*</span>
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="zipCode"
                      value={additionalData?.zipCode}
                      onChange={onAdditionalDataChange}
                      id="zipCode"
                      placeholder="Zip Code"
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-start text-sm font-medium text-black dark:text-white "
                      htmlFor="country"
                    >
                      Country <span className="text-red">*</span>
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="country"
                      value={additionalData?.country}
                      onChange={onAdditionalDataChange}
                      id="country"
                      placeholder="United States"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4.5">
                  <button
                    className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex justify-center rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
