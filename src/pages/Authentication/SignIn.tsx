import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '../../store/reducers/authSlice';
import { setUser, setUserSlice } from '../../store/reducers/userSlice';
import { RootState } from '../../store/store';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { validate } from 'email-validator';
import LeftSide from './LeftSide';
import { useStateContext } from '../../context/useStateContext';
import { UserRolesEnum } from '../../utils/enums';
import { logout } from '../../utils/functions';
import { fetchPartnerById } from '../../store/reducers/partnerSlice';
import { fetchEmployerById } from '../../store/reducers/employersSlice';
import { setLocalStorage } from '../../utils/utils';

const SignIn: React.FC = () => {
  //////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state: RootState) => state.auth);
  const initialData = { email: '', password: '' };
  const { page } = useStateContext();
  //////////////////////////////////////////////////// STATES ////////////////////////////////////////////////////////
  const [formData, setFormData] = useState<typeof initialData>(initialData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [inputError, setInputError] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState('');
  //////////////////////////////////////////////// USE EFFECTS ////////////////////////////////////////////////////////
  useEffect(() => {
    if (error?.message) {
      if (error?.code === 'auth/invalid-credential') {
        toast.error('Invalid username/password. Please try again.');
      } else {
        toast.error(error?.message);
      }
    }
  }, [error]);
  useEffect(() => {
    if (page === 'Institution') {
      setSource('Institute');
    } else {
      setSource('Employer');
    }
  }, [page]);

  //////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((pre: typeof initialData) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userCredentials = {
      email: formData.email,
      password: formData.password,
      source: source,
    };

    try {
      setIsLoading(true);

      const { payload: userPayload } = await dispatch<any>(
        signIn({
          //just need to add the role isSuperadmin
          ...userCredentials,
          source: page === 'Employer' ? 'Employer' : 'Institute',
        }),
      );
      if (!userPayload) {
        setIsLoading(false);
        if (page == 'Employer') {
          toast.error('No employer exists with this email.');
        } else {
          toast.error('No institution exists with this email.');
        }
        return;
      }

      if (page === 'Employer') {
        const userForLocalStorage = {
          name: userPayload.name,
          email: userPayload.email,
          id: userPayload.id,
          photoUrl: userPayload.photoUrl,
          employerId: userPayload?.id, //will check whether we need this or not
          employerName: userPayload?.name,
          logo: userPayload?.photoUrl,
          mongoId: userPayload?.user?.id,
        };
        const isSuperAdmin = userPayload?.user?.role?.includes(
          UserRolesEnum.SuperAdmin,
        );
        const role = isSuperAdmin ? 'SuperAdmin' : 'Employer';
        setLocalStorage(role, userPayload.id, true);

        localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
        await dispatch<any>(
          setUser({
            ...userPayload,
            mongoId: userForLocalStorage?.mongoId,
            lastSignedIn: new Date(),
          }),
        );
        navigate('/employer/dashboard');
      } else {
        const userForLocalStorage = {
          name: userPayload.name,
          email: userPayload.email,
          id: userPayload.id,
          photoUrl: userPayload.photoUrl,
          partnerId: userPayload?.user?.institute_id?._id,
          partnerName: userPayload?.user?.institute_id?.name,
          logo: userPayload?.photoUrl,
          approvedByAdmin: userPayload.approvedByAdmin,
        };
        setLocalStorage(
          userPayload?.user?.role[0],
          userPayload?.user?.id,
          true,
        );

        localStorage.setItem('auth', JSON.stringify(userForLocalStorage));

        await dispatch<any>(
          setUser({ ...userPayload, lastSignedIn: new Date() }),
        );
        navigate('/institution/dashboard');
      }
    } catch (error) {
      console.log('error', error);
      toast.error('Error logging in. Please contact admin.');
    } finally {
      setIsLoading(false);
      setInputError({ email: '', password: '' });
      setFormData(initialData);
    }
  };

  // old onShubmit ***************************
  // const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (!validateForm()) return;

  //   const userCredentials = {
  //     email: formData.email,
  //     password: formData.password,
  //   };

  //   try {
  //     setIsLoading(true);

  //     const { payload: authPayload } = await dispatch<any>(
  //       signIn({...userCredentials, role: 'Employer'}),
  //     );

  //     if (!authPayload) {
  //       setIsLoading(false);
  //       return;
  //     }
  //     const { payload: userPayload } = await dispatch<any>(
  //       fetchUserByEmail(authPayload.email),
  //     );

  //     if (page === 'Employer') {
  //       await setUpEmployer(userPayload);
  //     } else {
  //       await setUpInstitution(userPayload);
  //     }
  //   } catch {
  //     toast.error('Error logging in. Please contact admin.');
  //   } finally {
  //     setIsLoading(false);
  //     setInputError({ email: '', password: '' });
  //     setFormData(initialData);
  //   }
  // };

  const setUpEmployer = async (userPayload) => {
    try {
      if (!userPayload) throw new Error('Invalid user data');
      const isSuperAdmin = userPayload?.role?.includes(
        UserRolesEnum.SuperAdmin,
      );
      const isEmployer = userPayload?.role?.includes(UserRolesEnum.Employer);

      if (!isSuperAdmin && !isEmployer) {
        toast.error('No employer exists with this email.');
        logout(dispatch);
        navigate('/employer/signin');
        dispatch(setUserSlice(undefined));
        return;
      }

      const role = isSuperAdmin ? 'SuperAdmin' : 'Employer';
      setLocalStorage(role, userPayload.id, true);

      await dispatch<any>(
        setUser({ ...userPayload, lastSignedIn: new Date() }),
      );

      const { payload: employerPayload } = await dispatch<any>(
        fetchEmployerById(userPayload.email),
      );

      const userForLocalStorage = {
        name: userPayload.name,
        email: userPayload.email,
        id: userPayload.id,
        photoUrl: userPayload.photoUrl,
        employerId: employerPayload?.id,
        employerName: employerPayload?.name,
        logo: employerPayload?.photoUrl,
      };

      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
      navigate('/employer/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const setUpInstitution = async (userPayload) => {
    try {
      if (!userPayload) throw new Error('Invalid user data');

      const validRoles = [
        UserRolesEnum.SchoolAdmin,
        UserRolesEnum.Counsellor,
        UserRolesEnum.Teacher,
      ];

      const hasValidRole = validRoles.some((role) =>
        userPayload.role?.includes(role),
      );

      if (!hasValidRole) {
        toast.error('No institution exists with this email.');
        logout(dispatch);
        navigate('/institution/signin');
        dispatch(setUserSlice(undefined));
        return;
      }

      setLocalStorage(userPayload.role, userPayload.id, true);

      await dispatch<any>(
        setUser({ ...userPayload, lastSignedIn: new Date() }),
      );

      const { payload: partnerPayload } = await dispatch<any>(
        fetchPartnerById(userPayload.partnerId),
      );

      const userForLocalStorage = {
        name: userPayload.name,
        email: userPayload.email,
        id: userPayload.id,
        photoUrl: userPayload.photoUrl,
        partnerId: partnerPayload?.id,
        partnerName: partnerPayload?.name,
        logo: partnerPayload?.photoUrl,
        approvedByAdmin: userPayload.approvedByAdmin,
      };
      localStorage.setItem('auth', JSON.stringify(userForLocalStorage));
      navigate('/institution/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (field?: string) => {
    const isEmailCorrect = !!formData.email && validate(formData.email);
    const hasPassword = !!formData.password;

    if (!field || field === 'email') {
      if (!isEmailCorrect) {
        setInputError((pre) => ({
          ...pre,
          email: 'Please enter a valid email.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, email: '' }));
      }
    }

    if (!field || field === 'password') {
      if (!hasPassword) {
        setInputError((pre) => ({
          ...pre,
          password: 'Please enter a valid password.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, password: '' }));
      }
    }

    return true;
  };

  return (
    <div
      style={{ height: 'calc(100vh - 7rem)' }}
      className="flex items-center justify-center h-screen rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <div className="flex flex-wrap items-center">
        <div className="hidden w-full xl:block xl:w-1/2">
          <LeftSide />
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-1.5 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Hi, Welcome Back!
            </h2>
            <span className="mb-9 block font-medium">Start for free</span>

            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
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
                  <span className="text-sm text-red">{inputError.email}</span>
                )}
              </div>

              <div className="mb-6">
                <div className="w flex items-center justify-between">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onBlur={() => validateForm('password')}
                    onKeyUp={() => validateForm('password')}
                    onChange={onChange}
                    placeholder="Your password"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((pre) => !pre);
                    }}
                    className="absolute right-4 top-4"
                  >
                    {showPassword ? (
                      <EyeOff className="text-gray-icon" />
                    ) : (
                      <Eye className="text-gray-icon" />
                    )}
                  </button>
                </div>
                <div className="mt-3.5 mr-1.5 flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="cursor-pointer font-normal text-primary underline"
                  >
                    Forget Password?
                  </Link>
                </div>

                {inputError.password.length > 0 && (
                  <span className="text-sm text-red">
                    {inputError.password}
                  </span>
                )}
              </div>

              <div className="mb-5">
                <input
                  type="submit"
                  disabled={isLoading}
                  value={isLoading ? 'Processing...' : 'Sign In'}
                  className="w-full cursor-pointer rounded-lg border border-[#1C2434] bg-[#1C2434] p-4 text-white transition hover:bg-opacity-90 disabled:cursor-default disabled:bg-[#1C2434]/75"
                />
              </div>

              <div className="mt-6 text-center">
                <p>
                  Don’t have any account?{' '}
                  <Link
                    to={`/${page == 'Employer' ? 'employer' : 'institution'}/signup`}
                    className="text-primary underline"
                  >
                    Sign Up
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

export default SignIn;
