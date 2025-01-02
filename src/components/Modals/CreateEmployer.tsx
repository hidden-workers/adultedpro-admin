import { useState } from 'react';
import { Mail, PersonStanding, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Tooltip, IconButton, Modal } from '@mui/material';
import { validate } from 'email-validator';
import { setEmployer } from '../../store/reducers/employersSlice.ts';

interface InputErrorData {
  name: string;
  email: string;
  branchLocation: string;
  addressLine1: string;
}

const CreateEmployer = ({
  open,
  setOpen,
  onChange: onChangeProp,
  selectedEmployerIds,
}: {
  open: boolean;
  setOpen: any;
  onChange: any;
  selectedEmployerIds: string[];
}) => {
  /////////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////
  const dispatch = useDispatch();
  const initialData = {
    name: '',
    email: '',
    branchLocation: '',
    addressLine1: '',
  };
  const initialInputErrorData = {
    name: '',
    email: '',
    branchLocation: '',
    addressLine1: '',
  };

  /////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<typeof initialData>(initialData);
  const [inputError, setInputError] = useState<InputErrorData>(
    initialInputErrorData,
  );

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////
  const onChange = (e) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      dispatch<any>(setEmployer(formData))
        .then(({ payload }) => {
          // TODO: send mail to admin
          onChangeProp('requestedEmployerIds', [
            ...selectedEmployerIds.filter((id) => id != 'other'),
            payload?.id,
          ]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const validateForm = (field?: string) => {
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

    if (!field || field === 'branchLocation') {
      if (!formData?.branchLocation || formData?.branchLocation.trim() === '') {
        setInputError((pre) => ({
          ...pre,
          branchLocation: 'Branch location is required..',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, branchLocation: '' }));
      }
    }

    if (!field || field === 'addressLine1') {
      if (!formData?.addressLine1 || formData?.addressLine1.trim() === '') {
        setInputError((pre) => ({
          ...pre,
          addressLine1: 'Address line 1 is required.',
        }));
        return false;
      } else {
        setInputError((pre) => ({ ...pre, addressLine1: '' }));
      }
    }

    if (!field || field === 'email') {
      if (
        !formData?.email ||
        !validate(formData?.email) ||
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

    return true;
  };
  const onClose = () => {
    setOpen(false);
  };

  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-[9999999] flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[800px] md:px-8 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 ">
          <div className="w-fit flex justify-start items-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2 ">
              Create Employer
            </h4>
          </div>
          <div className="flex justify-end items-center gap-4.5 w-fit ">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={() => setOpen(false)}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col items-center w-full">
          {/* Name */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                onBlur={() => validateForm('name')}
                onKeyUp={() => validateForm('name')}
                value={formData?.name}
                onChange={onChange}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <span className="absolute right-4 top-4">
                <PersonStanding />
              </span>
              {inputError.name.length > 0 && (
                <span className="text-red text-sm">{inputError.name}</span>
              )}
            </div>
          </div>
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
          {/* Branch Location */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Branch Location
            </label>
            <div className="relative">
              <input
                type="text"
                name="branchLocation"
                value={formData?.branchLocation}
                onBlur={() => validateForm('branchLocation')}
                onKeyUp={() => validateForm('branchLocation')}
                onChange={onChange}
                placeholder="Enter branch location"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />

              <span className="absolute right-4 top-4">
                <Mail />
              </span>
            </div>
            {inputError.branchLocation.length > 0 && (
              <span className="text-red text-sm">
                {inputError.branchLocation}
              </span>
            )}
          </div>
          {/* Address Line 1 */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Address Line 1
            </label>
            <div className="relative">
              <input
                type="text"
                name="addressLine1"
                value={formData?.addressLine1}
                onBlur={() => validateForm('addressLine1')}
                onKeyUp={() => validateForm('addressLine1')}
                onChange={onChange}
                placeholder="Enter address line 1"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />

              <span className="absolute right-4 top-4">
                <Mail />
              </span>
            </div>
            {inputError.addressLine1.length > 0 && (
              <span className="text-red text-sm">
                {inputError.addressLine1}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-4.5 w-1/2">
            <button
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="flex justify-center rounded bg-primary disabled:bg-primary/50 py-2 px-6 font-medium text-gray hover:bg-opacity-90"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateEmployer;
