import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import NoUser from '../../images/user/no-user.jpg';
import DefaultLayout from '../../layout/DefaultLayout';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  fetchUserById,
  setUserSlice,
  updateMongoUser,
} from '../../store/reducers/userSlice';
import { fetchPartners } from '../../store/reducers/partnerSlice';
import { User, Partner } from '../../interfaces';
import toast from 'react-hot-toast';
import { useStateContext } from '../../context/useStateContext';
import { X } from 'lucide-react';
import { convertToPng } from '../../utils/functions';
import Select from 'react-select';
import { FixedSizeList as List } from 'react-window';
import { setEmployer } from '../../store/reducers/employersSlice';
import useMobile from '../../hooks/useMobile';

const MyProfile = () => {
  //////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { partners } = useSelector((state: RootState) => state.partner);

  const { page } = useStateContext();
  const role = localStorage.getItem('Role');
  const initialUserData: User = {
    name: '',
    email: '',
    phone: '',
    bio: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    partnerId: '',
    photoUrl: '',
    addressLine1: '',
    addressLine2: '',
    program: '',
    tagLine: '',
    interestedIn: '',
    role: [],
    isLegalTermsAccepted: false,
    visitedBy: [],
    lastSignedIn: '',
    isTest: false,
    pdfUrl: '',
  };
  const [isMobile] = useMobile();
  const mongoUserId = localStorage.getItem('mongoUserId');
  //////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////
  const [formData, setFormData] = useState(user || initialUserData);
  const [profilePictureState, setProfilePictureState] = useState({
    loading: false,
    progress: 0,
  });
  const [loading, setLoading] = useState({
    personalDetail: false,
    profilePicture: false,
  });
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const [previousImage, setPreviousImage] = useState<string | null>(null); // State to track previous image URL
  const [uploadStatus, setUploadStatus] = useState<string | null>(null); // Track upload status
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchInput, setSearchInput] = useState('');
  //////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////
  useEffect(() => {
    if (user?.name) {
      setFormData(user);
    } else {
      dispatch<any>(fetchUserById(mongoUserId));
    }
  }, [user]);
  useEffect(() => {
    if (role === 'Employer') {
      dispatch<any>(fetchPartners({ approved: true, page: 1, limit: 1000000 }));
    }
  }, []);
  useEffect(() => {
    if (role === 'Employer') {
      if (user?.partnerId) {
        const foundPartner = partners?.find(
          (partner) => partner?.name === user?.partner?.name,
        );
        if (foundPartner) {
          setSelectedPartner(foundPartner);
        }
      }
    }
  }, [user, partners]);

  //////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };

  const CustomMenuList = (props) => {
    const { options, getValue, setValue, ...rest } = props;
    return (
      <div {...rest}>
        <List
          height={200}
          itemCount={options.length}
          itemSize={35}
          width="100%"
        >
          {({ index, style }) => {
            const option = options[index];
            return (
              <div
                style={style}
                key={option?.value}
                onClick={() => setValue(option)}
              >
                {option?.label}
              </div>
            );
          }}
        </List>
      </div>
    );
  };

  const filteredOptions = partners
    .filter((partner) =>
      partner?.name?.toLowerCase().includes(searchInput?.toLowerCase()),
    )
    .map((partner) => ({
      value: partner?.name,
      label: partner?.name,
    }));

  const handleInputChange = (inputValue: string) => {
    setSearchInput(inputValue);
  };

  const handlePartnerChange = (
    selectedOption: { value: string; label: string } | null,
  ) => {
    if (selectedOption) {
      const selectedPartner = partners?.find(
        (partner) => partner?.name === selectedOption?.value,
      );

      setSelectedPartner(selectedPartner || null);
    } else {
      setSelectedPartner(null);
    }
  };

  const onUploadFile = async (file: any) => {
    const pngFile = await convertToPng(file);
    const storageRef = ref(
      storage,
      `user-display-pictures/${user?.id}/${pngFile.name}`,
    );
    const uploadTask = uploadBytesResumable(storageRef, pngFile);

    setUploadStatus('uploading'); // Mark as uploading

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProfilePictureState({ loading: true, progress });
      },
      (error) => {
        console.error('Error uploading file:', error);
        setUploadStatus('error'); // Mark as error
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setPreviousImage(formData.photoUrl); // Save previous image URL before updating
            setFormData((pre) => ({ ...pre, photoUrl: downloadURL }));
            setImagePreview(downloadURL); // Update image preview
            setProfilePictureState({ loading: false, progress: 0 });
            setUploadStatus('uploaded'); // Mark as uploaded
          })
          .catch((error) => {
            console.error('Error retrieving download URL:', error);
            setUploadStatus('error'); // Mark as error
          });
      },
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUploadFile(file);
    }
  };

  const handleCancel = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, photoUrl: previousImage || '' }));
    setUploadStatus(null); // Reset upload status
  };

  const onPersonalDetailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    let updatedFormData = { ...formData };

    if (role === 'Employer') {
      updatedFormData = {
        ...formData,
        partnerId: selectedPartner ? selectedPartner.id : formData.partnerId,
        partner: selectedPartner ? selectedPartner : formData.partner,
      };
    }
    setLoading({ ...loading, personalDetail: true });
    dispatch<any>(
      updateMongoUser({ userId: mongoUserId, userData: updatedFormData }),
    ).then(({ payload }) => {
      if (payload) {
        const authUser = localStorage.getItem('auth')
          ? JSON.parse(localStorage.getItem('auth'))
          : null;
        const userForLocalStorage = {
          ...authUser,
          name: payload?.name,
          email: payload?.email,
          id: payload?.id,
          photoUrl: payload?.photoUrl,
        };
        localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
        dispatch<any>(setUserSlice(payload));
        setLoading({ ...loading, personalDetail: false });
        toast.success('Profile details updated.');
      }
    });
    dispatch<any>(setEmployer(updatedFormData));
  };
  const onProfilePictureSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading({ ...loading, profilePicture: true });
    dispatch<any>(
      updateMongoUser({
        userId: mongoUserId,
        userData: { ...user, photoUrl: formData.photoUrl },
      }),
    ).then(({ payload }) => {
      if (payload) {
        setLoading({ ...loading, profilePicture: false });
        setImagePreview(null); // Clear the preview once saved
        const authUser = localStorage.getItem('auth')
          ? JSON.parse(localStorage.getItem('auth'))
          : null;
        const userForLocalStorage = {
          ...authUser,
          name: payload?.name,
          email: payload?.email,
          id: payload?.id,
          photoUrl: payload?.photoUrl,
        };
        localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
        dispatch<any>(setUserSlice(payload));
        toast.success('Profile picture updated.');
        setUploadStatus(null);
      }
    });
  };

  const validateForm = () => {
    const phoneRegex = /^[+]?[0-9\s\-()]{7,15}$/;

    if (!formData.name) {
      toast.error('Name is missing.');
      return false;
    }

    if (!formData.email) {
      toast.error('Email is missing.');
      return false;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error('Phone number is not valid.');
      return false;
    }

    return true; // Return true if all validations pass
  };
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <div className="mb-4">
          <Breadcrumb pageName="My Profile" />
          <p className={`${isMobile ? 'text-[14px]' : 'text-[17px]'}`}>
            Tell us about yourself
          </p>
        </div>

        <div className="mb-8 grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Details
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={onPersonalDetailSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="name"
                      >
                        Full Name <span className="text-red">*</span>
                      </label>
                      <div className="relative">
                        <input
                          className="w-full text-sm rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={onChange}
                          id="name"
                          placeholder="Devid Jhon"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phoneNumber"
                      >
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded border text-sm border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        id="phoneNumber"
                        placeholder="+1 123 456-7890"
                        pattern="^\+?[1-9]\d{0,2}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}$"
                        title="Phone number should be 7 to 15 digits long and may include spaces, hyphens, or parentheses"
                      />
                    </div>
                  </div>

                  {page == 'Institution' && (
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="school"
                        >
                          School <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="school"
                            name="school"
                            disabled={true}
                            value={formData?.partner?.name}
                            onChange={onChange}
                            id="school"
                            placeholder="School Name"
                          />
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="role"
                        >
                          Role <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border text-sm  border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="role"
                            name="role"
                            disabled={true}
                            value={role}
                            onChange={onChange}
                            id="role"
                            placeholder="Role"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
                    >
                      Email Address <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="email"
                        name="email"
                        disabled={true}
                        value={formData.email}
                        onChange={onChange}
                        id="emailAddress"
                        placeholder="devidjond45@gmail.com"
                      />
                    </div>
                  </div>

                  {role === 'Employer' &&
                    (user?.partnerId ? (
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="AssociatedSchool"
                        >
                          Associated School
                        </label>
                        <div className="flex items-center ">
                          <img
                            src={formData?.partner?.photoUrl || NoUser}
                            alt={formData?.partner?.name}
                            className="mr-2 h-13 w-13 rounded-full object-cover"
                          />
                          <span className="text-md font-sm text-black dark:text-white">
                            {formData?.partner?.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="AssociatedSchool"
                        >
                          Associate with School
                        </label>
                        <Select
                          options={filteredOptions}
                          onChange={handlePartnerChange}
                          onInputChange={handleInputChange}
                          components={{ MenuList: CustomMenuList }}
                          placeholder="Select a school..."
                        />
                      </div>
                    ))}

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="bio"
                    >
                      Brief Description about yourself
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full rounded border text-sm border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="bio"
                        id="bio"
                        value={formData.bio}
                        onChange={onChange}
                        rows={6}
                        placeholder="Please input a brief introduction about yourself that can be shared with the students/job candidates"
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center text-sm rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                      type="submit"
                      disabled={loading.personalDetail}
                    >
                      {loading.personalDetail ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Your Photo
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={onProfilePictureSubmit}>
                  <div className="mb-4 flex flex-col items-center gap-3 justify-center">
                    {profilePictureState.loading && (
                      <div className="text-sm text-gray-500 text-center mb-2">
                        Uploading your picture -{' '}
                        {profilePictureState.progress.toFixed(1)}% completed
                      </div>
                    )}
                    <div className="relative group h-64 w-64 rounded-full overflow-hidden border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                      <img
                        src={imagePreview || formData.photoUrl || NoUser}
                        alt="User"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() =>
                          document.getElementById('fileInput')?.click()
                        }
                      >
                        <p className="text-white">Upload new photo</p>
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="fileInput"
                    className="hidden"
                  />

                  <div className="flex justify-end gap-4.5">
                    {uploadStatus === 'uploaded' && (
                      <button
                        type="button"
                        className="flex justify-center rounded bg-[#DC143C] px-3 py-2 font-medium text-gray hover:bg-opacity-90"
                        onClick={handleCancel}
                      >
                        <X />
                      </button>
                    )}
                    <button
                      className="flex justify-center rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                      disabled={
                        profilePictureState.loading || loading.profilePicture
                      }
                      type="submit"
                    >
                      {loading.profilePicture ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MyProfile;
