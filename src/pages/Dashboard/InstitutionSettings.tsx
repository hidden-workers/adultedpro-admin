import React, { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { updatePassword } from '../../store/reducers/authSlice';
import { logout } from '../../utils/functions';
import toast from 'react-hot-toast';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';

const InstitutionSettings: React.FC = () => {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState<{
    personalDetail: boolean;
    passwordChange: boolean;
  }>({
    personalDetail: false,
    passwordChange: false,
  });

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
        onLogout();
      }
    } catch {
      toast.error('Failed to change password.');
    } finally {
      setLoading({ ...loading, passwordChange: false });
    }
  };
  const onLogout = () => {
    logout(dispatch);
    if (pathname.includes('employer')) navigate('/employer/signin');
    else navigate('/institution/signin');
  };
  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center ">
        <div className="mx-auto max-w-md w-full">
          <div className="mb-4 text-sm">
            <Breadcrumb pageName="Change Password" />
          </div>
          <div className="">
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
                      className="flex justify-center rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
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

export default InstitutionSettings;
