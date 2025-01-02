import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signUp } from '../../store/reducers/authSlice';
import { fetchUserById, setUser } from '../../store/reducers/userSlice';
import { RootState } from '../../store/store';
import toast from 'react-hot-toast';
import { setPartner, fetchPartners } from '../../store/reducers/partnerSlice';
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Mail,
  PersonStanding,
  Building2,
  School,
} from 'lucide-react';
import { useStateContext } from '../../context/useStateContext';
import LeftSide from './LeftSide';
import {
  fetchEmployerById,
  setEmployer,
} from '../../store/reducers/employersSlice';
import { Employer, Partner, Todo } from '../../interfaces';
// import { sendEmail } from '../../store/reducers/emailSlice';
import { setTodo } from '../../store/reducers/todoSlice';
import { UserRolesEnum } from '../../utils/enums';
import { setLocalStorage } from '../../utils/utils';
import { sendInstitutionSignUpEmail } from '../../utils/emails';
import { STATES } from '../../constants';
import Select from 'react-select';
import { FixedSizeList as List } from 'react-window';

interface InputErrorData {
  name: string;
  instituteName?: string; // for insitution only
  role?: string; // for insitution only
  email: string;
  password: {
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
    length: boolean;
  };
  confirmPassword: string;
  contactName?: string; //for employer
  city?: string; //for employer
  state?: string;
}
interface UserCredentials {
  email: string;
  name?: string;
  password: string;
  role: string[];
  isLegalTermsAccepted: boolean;
  source: string;
  city?: string; // Optional for Employer
  state?: string; // Optional for Employer
  contactName?: string; // Optional for Employer
  partner?: Partner; // Optional for Employer
}

const SignUp: React.FC = () => {
  //////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { page } = useStateContext();
  const { error } = useSelector((state: RootState) => state.auth);
  const initialPartnerData: Partner = {
    id: '',
    name: '',
    email: '',
    instituteType: '',
    city: '',
    state: '',
    addressLine1: '',
    addressLine2: '',
    adminEmail: '',
    website: '',
    carouselImages: [],
    photoUrl: '',
    mission: '',
    tagLine: '',
    bannerColor: '',
    bannerText: '',
    footerLogo: '',
    jobsView: false,
    logoText: '',
    textColor: '',
    isTest: false,
  };
  const initialData =
    page == 'Employer'
      ? {
          name: '',
          contactName: '',
          email: '',
          password: '',
          confirmPassword: '',
          partner: initialPartnerData,
          city: '',
          state: '',
        }
      : {
          name: '',
          email: '',
          role: '',
          password: '',
          instituteName: '',
          confirmPassword: '',
        };
  const initialInputErrorData =
    page == 'Employer'
      ? {
          name: '',
          contactName: '',
          email: '',
          password: {
            uppercase: true,
            lowercase: true,
            number: true,
            special: true,
            length: true,
          },
          confirmPassword: '',
          city: '',
          state: '',
        }
      : {
          name: '',
          instituteName: '',
          role: '',
          email: '',
          password: {
            uppercase: true,
            lowercase: true,
            number: true,
            special: true,
            length: true,
          },
          confirmPassword: '',
        };
  const { partners, isLoading: partnersLoading } = useSelector(
    (state: RootState) => state.partner,
  );

  const initialEmployerData: Employer = {
    addressLine1: '',
    addressLine2: '',
    description: '',
    branchLocation: '',
    city: '',
    contactEmail: '',
    contactName: '',
    contactBio: '',
    contactNumber: '',
    country: '',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    email: '',
    media: [],
    partnerId: '',
    requirements: '',
    state: '',
    tagLine: '',
    userId: '',
    zipCode: '',
    bio: '',
    isHeadquarter: false,

    name: '',
    bannerImage: '',
    photoUrl: '',
    mission: '',
    companySize: '',
    cultureAndEnvironment: '',
    benefitsAndPerks: '',
    awardsAndAccolades: '',
    alumniLinks: [],
    socialMediaLinks: [],
    isTest: false,
  };

  //////////////////////////////////////////////// STATES ///////////////////////////////////////////////////
  const [formData, setFormData] = useState<typeof initialData>(initialData);
  const [inputError, setInputError] = useState<InputErrorData>(
    initialInputErrorData,
  );
  const [showPassword, setShowPassword] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({ password: false, confirmPassword: false });
  const [showOther, setShowOther] = useState(false);
  const [otherInstituteName, setOtherInstituteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [userId, setUserId] = useState('');
  //////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    if (error?.message) {
      toast.error(error?.message);
    }
  }, [error]);

  useEffect(() => {
    dispatch<any>(fetchPartners({ approved: true, page: 1, limit: 100000 }));
  }, [page, pathname]);
  //////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
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

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name == 'instituteName' && e.target.value == 'Other')
      setShowOther(true);
    setFormData((pre: typeof initialData) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      submitForm();
    }
  };

  const setupAccount = (page: string, userPayload: any) => {
    if (page == 'Employer') {
      setUpEmployer(userPayload);
    } else {
      setUpInstitution(userPayload);
    }
  };

  const submitForm = async () => {
    const userCredentials: UserCredentials = {
      email: formData?.email,
      name: formData?.name,
      password: formData?.password,
      role: [page === 'Employer' ? 'Employer' : formData?.role],
      source: page === 'Employer' ? 'Employer' : 'Institute',
      isLegalTermsAccepted: false,
    };
    if (page === 'Employer') {
      userCredentials.city = formData?.city;
      userCredentials.state = formData?.state;
      userCredentials.contactName = formData?.contactName;
      userCredentials.partner = selectedPartner;
    }

    setIsLoading(true);

    try {
      const { payload: authPayload }: any = await dispatch<any>(
        signUp(userCredentials),
      );
      if (!authPayload) {
        setIsLoading(false);
        return;
      }
      setUserId(localStorage.getItem('mongoUserId'));
      const { payload: userPayload }: any = await dispatch<any>(
        fetchUserById(userId),
      );

      if (userPayload) {
        setupAccount(page, userPayload);
      } else {
        const input =
          page === 'Employer'
            ? { ...authPayload, partner: selectedPartner }
            : {
                ...authPayload,
                approvedByAdmin: false,
                dateCreated: new Date(),
              };

        const { payload: newUserPayload }: any = await dispatch<any>(
          setUser(input),
        );
        setupAccount(page, newUserPayload);
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      toast.error(error.message || 'Error during form submission');
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setInputError(initialInputErrorData);
    setFormData(initialData);
    setShowOther(false);
    setOtherInstituteName('');
  };

  const setUpInstitution = async (userPayload) => {
    setLocalStorage(formData?.role, userPayload?.id, true);

    const filteredInstitutions = partners
      ?.filter((p) => p?.name === formData?.instituteName)
      ?.map((institution) => ({ ...institution, isAdmin: false }));

    if (filteredInstitutions?.length > 0) {
      await Promise.all(
        filteredInstitutions.map(async (institution) => {
          const { payload: user } = await dispatch<any>(fetchUserById(userId));
          institution.isAdmin =
            user?.role?.includes(UserRolesEnum.SchoolAdmin) ||
            user?.role === UserRolesEnum.SchoolAdmin;
        }),
      );

      const selectedInstitution =
        filteredInstitutions.find((p) => p.isAdmin) || filteredInstitutions[0];

      await dispatch<any>(
        setUser({
          ...userPayload,
          approvedByAdmin: false,
          partnerId: selectedInstitution?.id,
        }),
      );

      const userForLocalStorage = {
        name: userPayload?.name,
        email: userPayload?.email,
        id: userPayload?.id,
        photoUrl: userPayload?.photoUrl,
        partnerId: selectedInstitution?.id,
        partnerName: selectedInstitution?.name,
        logo: selectedInstitution?.photoUrl,
        approvedByAdmin: userPayload.approvedByAdmin,
      };
      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));

      toast.success('Registered successfully.');

      navigate('/institution/dashboard');
      setIsLoading(false);
      dispatch<any>(
        sendInstitutionSignUpEmail({
          name: formData?.name,
          email: formData?.email,
          role: formData?.role,
          instituteName: selectedInstitution?.name,
        }),
      );

      if (selectedInstitution?.isAdmin) {
        createTodo(
          `Please review and approve the newly registered ${formData?.role?.toLowerCase()}, ${formData?.name} in the system.`,
          selectedInstitution?.userId,
          userPayload?.id,
        );
      }
    } else {
      const { payload: partnerPayload } = await dispatch<any>(
        setPartner({
          ...initialPartnerData,
          instituteType:
            formData?.instituteName === 'Other' ? 'Other' : 'Registered',
          name:
            formData?.instituteName === 'Other'
              ? otherInstituteName
              : formData?.instituteName,
          userId: userPayload?.id,
          email: userPayload?.email,
        }),
      );

      await dispatch<any>(
        setUser({
          ...userPayload,
          approvedByAdmin: false,
          partnerId: partnerPayload?.id,
        }),
      );

      const emailToAdmin: any = {
        name: formData?.name,
        email: formData?.email,
        role: formData?.role,
        instituteName:
          formData?.instituteName === 'Other'
            ? otherInstituteName
            : formData?.instituteName,
      };

      toast.success('Registered successfully.');
      setIsLoading(false);
      navigate('/institution/dashboard');
      dispatch<any>(sendInstitutionSignUpEmail(emailToAdmin));
    }
  };

  const setUpEmployer = async (userPayload: any) => {
    if (!userPayload) return;

    setLocalStorage('Employer', userPayload?.id, true);

    setIsLoading(true);

    try {
      const { payload: employer } = await dispatch<any>(
        fetchEmployerById(userPayload?.email),
      );

      let userForLocalStorage: any = {
        name: userPayload?.name,
        email: userPayload?.email,
        id: userPayload?.id,
        photoUrl: userPayload?.photoUrl,
        city: userPayload?.city,
        state: userPayload?.state,
        contactName: userPayload?.contactName,
        partner: selectedPartner,
      };

      if (employer) {
        userForLocalStorage = {
          ...userForLocalStorage,
          employerId: employer?.id,
          employerName: employer?.name,
          logo: employer?.photoUrl,
          partner: selectedPartner,
        };
      } else {
        const { payload: newEmployer } = await dispatch<any>(
          setEmployer({
            ...initialEmployerData,
            userId: userPayload?.id,
            email: userPayload?.email,
            name: userPayload?.name,
            city: userPayload?.city,
            state: userPayload?.state,
            contactName: userPayload?.contactName,
            isHeadquarter: true,
            partner: selectedPartner,
          }),
        );

        userForLocalStorage = {
          ...userForLocalStorage,
          employerId: newEmployer?.id,
          employerName: newEmployer?.name,
          city: newEmployer?.city,
          state: newEmployer?.state,
          contactName: newEmployer?.contactName,
          logo: newEmployer?.photoUrl,
          partner: selectedPartner,
        };
      }

      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
      setIsLoading(false);
      navigate('/employer/dashboard');
    } catch (error) {
      toast.error(error.message || 'Error setting up employer');
      console.error('Error setting up employer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (field?: string) => {
    const numberRegex = /\d/;
    // eslint-disable-next-line no-useless-escape
    const specialCharacterRegex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const alphabetRegex = /^[A-Za-z\s]+$/;

    const hasNumber = numberRegex.test(formData?.password);
    const hasSpecialChar = specialCharacterRegex.test(formData?.password);
    const hasUppercase = uppercaseRegex.test(formData?.password);
    const hasLowercase = lowercaseRegex.test(formData?.password);
    const emailRegex =
      /^\s*[a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+([.-]?[a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*@\w+([.-]?\w+)*(\.[a-zA-Z0-9-]{2,})+\s*$/;

    if (!field || field === 'name') {
      if (!formData?.name || formData?.name.trim() === '') {
        setInputError((pre) => ({
          ...pre,
          name: 'Please enter a valid name.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, name: '' }));
      }
    }

    if ((page == 'Institution' && !field) || field === 'instituteName') {
      if (!formData?.instituteName || formData?.instituteName.trim() === '') {
        setInputError((pre: InputErrorData) => ({
          ...pre,
          instituteName: 'Please enter a valid institute name.',
        }));
        return false;
      } else {
        setInputError((pre: InputErrorData) => ({ ...pre, instituteName: '' }));
      }
    }

    if (!field || field === 'email') {
      if (
        !formData?.email ||
        !emailRegex.test(formData?.email) ||
        formData?.email.trim() === ''
      ) {
        setInputError((pre) => ({
          ...pre,
          email: 'Please enter a valid email address.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, email: '' }));
      }
    }

    if ((page == 'Institution' && !field) || field === 'role') {
      if (!formData?.role || formData?.role.trim() === '') {
        setInputError((pre: InputErrorData) => ({
          ...pre,
          role: 'Please select a role.',
        }));
        return false;
      } else {
        setInputError((pre: InputErrorData) => ({ ...pre, role: '' }));
      }
    }

    if ((page == 'Employer' && !field) || field === 'city') {
      if (!formData?.city || !alphabetRegex.test(formData?.city)) {
        setInputError((pre) => ({
          ...pre,
          city: 'City must contain only letters.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, city: '' }));
      }
    }

    if ((page == 'Employer' && !field) || field === 'contactName') {
      if (
        !formData?.contactName ||
        !alphabetRegex.test(formData?.contactName)
      ) {
        setInputError((pre) => ({
          ...pre,
          contactName: 'Contact name must contain only letters.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, contactName: '' }));
      }
    }

    if (page === 'Employer' && (!field || field === 'state')) {
      if (!formData?.state || formData?.state.trim() === '') {
        setInputError((pre) => ({
          ...pre,
          state: 'Please select a state.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, state: '' }));
      }
    }

    if (!field || field === 'password') {
      if (!hasUppercase) {
        setInputError((pre) => ({
          ...pre,
          password: {
            uppercase: true,
            lowercase: false,
            number: false,
            special: false,
            length: false,
          },
        }));
        return false;
      } else if (!hasLowercase) {
        setInputError((pre) => ({
          ...pre,
          password: {
            uppercase: false,
            lowercase: true,
            number: false,
            special: false,
            length: false,
          },
        }));
        return false;
      } else if (!hasNumber) {
        setInputError((pre) => ({
          ...pre,
          password: {
            uppercase: false,
            lowercase: false,
            number: true,
            special: false,
            length: false,
          },
        }));
        return false;
      } else if (!hasSpecialChar) {
        setInputError((pre) => ({
          ...pre,
          password: {
            uppercase: false,
            lowercase: false,
            number: false,
            special: true,
            length: false,
          },
        }));
        return false;
      } else if (formData?.password.length < 8) {
        setInputError((pre) => ({
          ...pre,
          password: {
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
            length: true,
          },
        }));
        return false;
      } else {
        setInputError((pre) => ({
          ...pre,
          password: {
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
            length: false,
          },
        }));
      }
    }

    if (!field || field === 'confirmPassword') {
      if (formData?.password !== formData?.confirmPassword) {
        setInputError((pre) => ({
          ...pre,
          confirmPassword: 'Password and confirm password must be same.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, confirmPassword: '' }));
      }
    }

    return true;
  };

  const createTodo = (
    description: string,
    adminUserId: string,
    pendingUserId: string,
  ) => {
    if (!description || !adminUserId || !pendingUserId) return;
    const input: Todo = {
      id: '',
      title: 'Pending Approval',
      description,
      userId: adminUserId,
      pendingUserId,
      type: 'pending-teacher',
      completed: false,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      isTest: false,
    };
    dispatch<any>(setTodo(input)).catch((error) => {
      console.error('Failed to dispatch setTodo action:', error);
    });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center">
        {/* Left Section */}
        <div className="hidden w-full xl:block xl:w-1/2">
          <LeftSide />
        </div>

        {/* Right Section */}
        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <span className="mb-1.5 block font-medium">Start for free</span>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Sign Up to AdultEd Pro
            </h2>

            <form onSubmit={onSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  {page === 'Employer' ? 'Company Name' : 'Name'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    onBlur={() => validateForm('name')}
                    onKeyUp={() => validateForm('name')}
                    value={formData?.name}
                    onChange={onChange}
                    placeholder="Enter your company name"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <span className="absolute right-4 top-4">
                    {page === 'Employer' ? <School /> : <PersonStanding />}
                  </span>
                  {inputError.name.length > 0 && (
                    <span className="text-red text-sm">{inputError.name}</span>
                  )}
                </div>
              </div>
              {/* contact name */}
              {page == 'Employer' && (
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Contact name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="contactName"
                      onBlur={() => validateForm('contactName')}
                      onKeyUp={() => validateForm('contactName')}
                      value={formData?.contactName}
                      onChange={onChange}
                      placeholder="Enter your contact name"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    <span className="absolute right-4 top-4">
                      <PersonStanding />
                    </span>
                    {inputError.contactName.length > 0 && (
                      <span className="text-red text-sm">
                        {inputError.contactName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {page == 'Employer' && (
                <div className="mb-5.5">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
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
              )}

              {/* Institute Name */}
              {page == 'Institution' && (
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Institute Name
                  </label>
                  <div className="relative">
                    <select
                      name="instituteName"
                      title="Institute Name"
                      onBlur={() => validateForm('instituteName')}
                      onKeyUp={() => validateForm('instituteName')}
                      value={formData?.instituteName}
                      onChange={onChange}
                      className="appearance-none w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option
                        value=""
                        disabled
                        className="text-body dark:text-bodydark"
                      >
                        Select Institute Name
                      </option>
                      {partnersLoading ? (
                        <option
                          value=""
                          disabled
                          className="text-body dark:text-bodydark"
                        >
                          Loading Schools
                        </option>
                      ) : (
                        partners?.map((partner, index) => (
                          <option
                            key={index}
                            value={partner?.name}
                            className="text-body dark:text-bodydark"
                          >
                            {partner?.name}
                          </option>
                        ))
                      )}
                      <option
                        value="Other"
                        className="text-body dark:text-bodydark"
                      >
                        Other
                      </option>
                    </select>
                    <span className="absolute right-4 top-4">
                      <ChevronDown />
                    </span>
                    {showOther && (
                      <input
                        type="text"
                        name="otherInstituteName"
                        value={otherInstituteName}
                        onChange={(e) => setOtherInstituteName(e.target?.value)}
                        placeholder="Enter other institute name"
                        className="mt-2 w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    )}
                  </div>
                  {inputError.instituteName.length > 0 && (
                    <span className="text-red text-sm">
                      {inputError.instituteName}
                    </span>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData?.email}
                    onBlur={() => validateForm('email')}
                    onKeyUp={() => validateForm('email')}
                    onChange={onChange}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />

                  <span className="absolute right-4 top-4">
                    <Mail />
                  </span>
                </div>
                {inputError.email.length > 0 && (
                  <span className="text-red text-sm">{inputError.email}</span>
                )}
              </div>

              {/* Role */}
              {page == 'Institution' && (
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      title="Role"
                      value={formData?.role}
                      onBlur={() => validateForm('role')}
                      onKeyUp={() => validateForm('role')}
                      onChange={onChange}
                      className="appearance-none w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Role</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Counsellor">Counsellor</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <span className="absolute right-4 top-4">
                      <ChevronDown />
                    </span>
                  </div>
                  {inputError.role.length > 0 && (
                    <span className="text-red text-sm">{inputError.role}</span>
                  )}
                </div>
              )}

              {/* Password */}
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.password ? 'text' : 'password'}
                    name="password"
                    value={formData?.password}
                    onBlur={() => validateForm('password')}
                    onKeyUp={() => validateForm('password')}
                    onChange={onChange}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((pre) => ({
                        ...pre,
                        password: !pre.password,
                      }));
                    }}
                    className="absolute right-4 top-4"
                  >
                    {showPassword.password ? (
                      <EyeOff className="text-gray-icon" />
                    ) : (
                      <Eye className="text-gray-icon" />
                    )}
                  </button>
                </div>
                <div className="flex flex-col gap-2 mt-2 ">
                  {inputError.password.length &&
                    !inputError.password.uppercase &&
                    !inputError.password.lowercase &&
                    !inputError.password.special &&
                    !inputError.password.number && (
                      <div
                        className={`flex items-center gap-1.5 ${inputError.password.length ? 'text-red' : 'text-success'} text-sm`}
                      >
                        <span className="rounded-full border border-inherit p-[1px] ">
                          <Check className="w-4 h-4" />
                        </span>
                        <span>Password must be atleast 8 character</span>
                      </div>
                    )}
                  {inputError.password.uppercase &&
                    !inputError.password.length &&
                    !inputError.password.lowercase &&
                    !inputError.password.special &&
                    !inputError.password.number && (
                      <div
                        className={`flex items-center gap-1.5 ${inputError.password.uppercase ? 'text-red' : 'text-success'} text-sm`}
                      >
                        <span className="rounded-full border border-inherit p-[1px] ">
                          <Check className="w-4 h-4" />
                        </span>
                        <span>
                          Password must have atleast one upper case character
                        </span>
                      </div>
                    )}
                  {inputError.password.lowercase &&
                    !inputError.password.length &&
                    !inputError.password.uppercase &&
                    !inputError.password.special &&
                    !inputError.password.number && (
                      <div
                        className={`flex items-center gap-1.5 ${inputError.password.lowercase ? 'text-red' : 'text-success'} text-sm`}
                      >
                        <span className="rounded-full border border-inherit p-[1px] ">
                          <Check className="w-4 h-4" />
                        </span>
                        <span>
                          Password must have atleast one lower case character
                        </span>
                      </div>
                    )}
                  {inputError.password.special &&
                    !inputError.password.length &&
                    !inputError.password.uppercase &&
                    !inputError.password.lowercase &&
                    !inputError.password.number && (
                      <div
                        className={`flex items-center gap-1.5 ${inputError.password.special ? 'text-red' : 'text-success'} text-sm`}
                      >
                        <span className="rounded-full border border-inherit p-[1px] ">
                          <Check className="w-4 h-4" />
                        </span>
                        <span>
                          Password must have atleast one special character
                        </span>
                      </div>
                    )}
                  {inputError.password.number &&
                    !inputError.password.length &&
                    !inputError.password.uppercase &&
                    !inputError.password.lowercase &&
                    !inputError.password.special && (
                      <div
                        className={`flex items-center gap-1.5 ${inputError.password.number ? 'text-red' : 'text-success'} text-sm`}
                      >
                        <span className="rounded-full border border-inherit p-[1px] ">
                          <Check className="w-4 h-4" />
                        </span>
                        <span>Password must have atleast one number</span>
                      </div>
                    )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData?.confirmPassword}
                    onBlur={() => validateForm('confirmPassword')}
                    onKeyUp={() => validateForm('confirmPassword')}
                    onChange={onChange}
                    placeholder="Re-enter your password"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((pre) => ({
                        ...pre,
                        confirmPassword: !pre.confirmPassword,
                      }));
                    }}
                    className="absolute right-4 top-4"
                  >
                    {showPassword.confirmPassword ? (
                      <EyeOff className="text-gray-icon" />
                    ) : (
                      <Eye className="text-gray-icon" />
                    )}
                  </button>
                </div>
                {inputError.confirmPassword.length > 0 && (
                  <span className="text-red text-sm">
                    {inputError.confirmPassword}
                  </span>
                )}
              </div>
              {/* city */}
              {page == 'Employer' && (
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="city"
                      onBlur={() => validateForm('city')}
                      onKeyUp={() => validateForm('city')}
                      value={formData?.city}
                      onChange={onChange}
                      placeholder="Enter your city"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    <span className="absolute right-4 top-4">
                      <Building2 />
                    </span>
                    {inputError.city.length > 0 && (
                      <span className="text-red text-sm">
                        {inputError.city}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* state */}
              {page == 'Employer' && (
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    State
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      name="state"
                      onBlur={() => validateForm('state')}
                      onKeyUp={() => validateForm('state')}
                      onChange={onChange}
                      value={formData?.state}
                      id="state"
                    >
                      {STATES?.map((e, index) => (
                        <option value={e.value} key={index}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    {inputError.state.length > 0 && (
                      <span className="text-red text-sm">
                        {inputError.state}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* Submit button */}
              <div className="mb-5">
                <input
                  type="submit"
                  value={isLoading ? 'Processing...' : 'Create account'}
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-lg border border-[#1C2434] bg-[#1C2434] disabled:bg-[#1C2434]/75 disabled:cursor-default p-4 text-white transition hover:bg-opacity-90"
                />
              </div>

              {/* Have Account? */}
              <div className="mt-6 text-center">
                <p>
                  Already have an account?{' '}
                  <Link
                    to={`/${page == 'Employer' ? 'employer' : 'institution'}/signin`}
                    className="text-primary"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
