import userThree from '../../images/user/user-03.png';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Employer } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import { Tooltip, IconButton } from '@mui/material';
import { Pencil, Trash, Upload, X } from 'lucide-react';
import { convertToPng } from '../../utils/functions';

export const UpdateHeadquarterDetail = ({
  initialData,
}: {
  initialData: Employer;
}) => {
  //////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////
  const { user } = useSelector((state: RootState) => state.user);
  const { showUpdateHeadquarter, setShowUpdateHeadquarter }: any =
    useStateContext();
  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);
  //////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////
  const [formData, setFormData] = useState<Employer>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [logoState, setLogoState] = useState({ loading: false, progress: 0 });
  const [mediaState, setMediaState] = useState({ loading: false, progress: 0 });

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////
  useEffect(() => {
    // close on click outside
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !showUpdateHeadquarter ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      // setShowUpdateHeadquarter(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [showUpdateHeadquarter]);
  useEffect(() => {
    // close if the esc key is pressed
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (showUpdateHeadquarter && keyCode === 27) {
        setShowUpdateHeadquarter(false);
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [showUpdateHeadquarter]);
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  //////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onSocialMediaLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const updatedLinks = [...(formData?.socialMediaLinks || [])]; // Create a copy of the socialMediaLinks array or initialize it as an empty array if it's undefined
    updatedLinks[index] = e.target.value; // Update the link at the specified index
    setFormData((prevState) => ({
      ...prevState,
      socialMediaLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const removeSocialMediaLink = (index: number) => {
    const updatedLinks = [...(formData?.socialMediaLinks || [])]; // Create a copy of the socialMediaLinks array or initialize it as an empty array if it's undefined
    updatedLinks.splice(index, 1); // Remove the link at the specified index
    setFormData((prevState) => ({
      ...prevState,
      socialMediaLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const addSocialMediaLink = () => {
    const updatedLinks = [...(formData?.socialMediaLinks || []), '']; // Add an empty string for a new link
    setFormData((prevState) => ({
      ...prevState,
      socialMediaLinks: updatedLinks,
    })); // Update the formData state with the updated links array
  };

  const onAlumniLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const updatedLinks = [...(formData?.alumniLinks || [])]; // Create a copy of the alumniLinks array or initialize it as an empty array if it's undefined
    updatedLinks[index] = e.target.value; // Update the link at the specified index
    setFormData((prevState) => ({ ...prevState, alumniLinks: updatedLinks })); // Update the formData state with the updated links array
  };

  const removeAlumniLink = (index: number) => {
    const updatedLinks = [...(formData?.alumniLinks || [])]; // Create a copy of the alumniLinks array or initialize it as an empty array if it's undefined
    updatedLinks.splice(index, 1); // Remove the link at the specified index
    setFormData((prevState) => ({ ...prevState, alumniLinks: updatedLinks })); // Update the formData state with the updated links array
  };

  const addAlumniLink = () => {
    const updatedLinks = [...(formData?.alumniLinks || []), '']; // Add an empty string for a new link
    setFormData((prevState) => ({ ...prevState, alumniLinks: updatedLinks })); // Update the formData state with the updated links array
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
          console.error('error uploading file:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              if (type === 'banner') {
                setFormData((pre) => ({ ...pre, bannerImage: downloadURL }));
                setMediaState({ loading: false, progress: 0 });
              } else {
                setFormData((pre) => ({ ...pre, logo: downloadURL }));
                setLogoState({ loading: false, progress: 0 });
              }
            })
            .catch((error) => {
              console.error('error retrieving download URL:', error);
            });
        },
      );
    } catch (error) {
      console.error('Error processing or uploading the file:', error);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    alert('code not implement. fix this');
    // dispatch<any>(
    //   updateHeadquarterDetails({ email: authUser?.email, data: formData }),
    // ).then(({ payload }) => {
    //   setLoading(false);
    //   dispatch<any>(setEmployerSlice(payload));
    //   setShowUpdateHeadquarter(false);
    //   toast.success('Headquarter details updated.');
    // });
  };
  const validateForm = () => {
    if (!formData?.name) {
      alert('Company Name is missing.');
      return false;
    }

    if (!formData?.description) {
      alert('Brief Description is missing.');
      return false;
    }

    if (!formData?.mission) {
      alert('Company Mission is missing.');
      return false;
    }

    if (!formData?.companySize) {
      alert('Company Size is missing.');
      return false;
    }

    if (!formData?.cultureAndEnvironment) {
      alert('Culture & Environment is missing.');
      return false;
    }

    if (!formData?.benefitsAndPerks) {
      alert('Benefits and Perks is missing.');
      return false;
    }

    if (!formData?.awardsAndAccolades) {
      alert('Awards & Accolades is missing.');
      return false;
    }

    return true; // Return true if all validations pass
  };

  return (
    <div>
      <div className="relative inline-block text-left">
        {initialData?.name ? (
          <Tooltip title="Edit Basic Details" placement="top">
            <IconButton
              ref={trigger}
              onClick={() => setShowUpdateHeadquarter((prev) => !prev)}
            >
              <Pencil className="text-gray-icon" />
            </IconButton>
          </Tooltip>
        ) : (
          <button
            onClick={() => setShowUpdateHeadquarter((prev) => !prev)}
            className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
          >
            Add Headquarter Details
          </button>
        )}
      </div>

      {showUpdateHeadquarter && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
          <div
            ref={modal}
            className="max-h-[90vh] min-h-[90vh] w-full max-w-150 space-y-4 overflow-auto rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:px-12 md:py-8 "
            style={{ maxWidth: '1000px', width: '90vw' }}
          >
            <div className="flex w-full items-center justify-between">
              <h4 className="text-2xl font-semibold text-black dark:text-white">
                Update Headquarter Details
              </h4>
              <Tooltip title="View" placement="top">
                <IconButton onClick={() => setShowUpdateHeadquarter(false)}>
                  <X />
                </IconButton>
              </Tooltip>
            </div>

            <form onSubmit={onSubmit}>
              {/* Name & Company Size */}
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
                            )} completed`
                          ) : (
                            <img
                              src={formData?.logo || userThree}
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
                      />
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Upload />
                        <p>
                          <span className="text-primary">Click to upload</span>{' '}
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
                            )} completed`
                          ) : (
                            <img
                              src={formData?.bannerImage || userThree}
                              alt="Logo"
                              className="h-14 w-14 rounded-sm object-cover"
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
                          onUploadFile(e.target.files[0], 'banner')
                        }
                        className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                      />
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Upload />
                        <p>
                          <span className="text-primary">Click to upload</span>{' '}
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
                      value={formData?.name}
                      onChange={onChange}
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
                    Size of Company <span className="text-red">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="companySize"
                    value={formData?.companySize}
                    onChange={onChange}
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
                    Culture & Environment <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="cultureAndEnvironment"
                      id="cultureAndEnvironment"
                      value={formData?.cultureAndEnvironment}
                      onChange={onChange}
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
                    Benefits & Perks <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4.5  py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="benefitsAndPerks"
                      value={formData?.benefitsAndPerks}
                      onChange={onChange}
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
                    Mission <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="mission"
                      id="mission"
                      value={formData?.mission}
                      onChange={onChange}
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
                    Awards & Accolades <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="awardsAndAccolades"
                      id="awardsAndAccolades"
                      value={formData?.awardsAndAccolades}
                      onChange={onChange}
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
                    value={formData?.description}
                    onChange={onChange}
                    rows={5}
                    placeholder="Write your company details here"
                  />
                </div>
              </div>

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
                {formData?.socialMediaLinks?.map((link, index) => (
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
                {formData?.alumniLinks?.map((link, index) => (
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

              <div className="flex justify-end gap-4.5">
                <button
                  className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  onClick={() => setShowUpdateHeadquarter(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
