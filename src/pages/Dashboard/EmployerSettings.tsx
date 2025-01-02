import React, { useState, FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { updatePassword } from '../../store/reducers/authSlice';
import {
  fetchUserByEmail,
  setUser,
  setUserSlice,
} from '../../store/reducers/userSlice';
import { User } from '../../interfaces';
import toast from 'react-hot-toast';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const EmployerSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;

  const [formData, setFormData] = useState<User>(
    user || {
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
    },
  );

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<{
    personalDetail: boolean;
    passwordChange: boolean;
  }>({
    personalDetail: false,
    passwordChange: false,
  });

  useEffect(() => {
    if (user?.name) {
      setFormData(user);
    } else {
      dispatch<any>(fetchUserByEmail(authUser?.email));
    }
  }, [user]);

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
    if (!formData.phone) {
      toast.error('Phone is missing.');
      return false;
    } else if (!phoneRegex.test(formData.phone)) {
      toast.error('Phone number is not valid.');
      return false;
    }
    return true;
  };

  const handlePersonalDetailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading({ ...loading, personalDetail: true });
    dispatch<any>(setUser(formData)).then(({ payload }) => {
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
  };

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password should be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setLoading({ ...loading, passwordChange: true });
    try {
      const resultAction = await dispatch(
        updatePassword({ currentPassword, newPassword }) as any,
      );
      if (updatePassword.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload as string;
        if (errorMessage.includes('reauthentication')) {
          toast.error('Current password is incorrect.');
        } else {
          toast.error('Failed to change password: ' + errorMessage);
        }
      } else {
        toast.success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      toast.error('Failed to change password.');
    } finally {
      setLoading({ ...loading, passwordChange: false });
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <div className="mb-4">
          <Breadcrumb pageName="My Profile" />
        </div>
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Details Section */}
          <div className="col-span-1">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Details
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handlePersonalDetailSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-medium font-medium text-black dark:text-white"
                        htmlFor="name"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full border border-gray-300 rounded p-2 mt-1"
                      />
                    </div>
                  </div>
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-medium font-medium text-black dark:text-white"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                      readOnly
                    />
                  </div>
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-medium font-medium text-black dark:text-white"
                      htmlFor="phone"
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
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
          {/* Change Password Section */}
          <div className="col-span-1">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Change Password
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-medium font-medium text-black dark:text-white"
                      htmlFor="currentPassword"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                    />
                  </div>
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-medium font-medium text-black dark:text-white"
                      htmlFor="newPassword"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                    />
                  </div>
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-medium font-medium text-black dark:text-white"
                      htmlFor="confirmPassword"
                    >
                      Confirm New Password<span className="text-red"> *</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded p-2 mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                      type="submit"
                      disabled={loading.passwordChange}
                    >
                      {loading.passwordChange
                        ? 'Updating...'
                        : 'Update Password'}
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

export default EmployerSettings;
