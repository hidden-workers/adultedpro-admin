import { Modal } from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerEmployer } from '../../store/reducers/employersSlice';
import toast from 'react-hot-toast';
import { UserRolesEnum } from '../../utils/enums';
import { STATES } from '../../constants';

interface Props {
  open: boolean;
  setOpen: any;
}

const CreateEmployerModal = ({ open, setOpen }: Props) => {
  ///////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();

  const initialData = {
    name: '',
    email: '',
    branchLocation: '',
    addressLine1: '',

    city: '',
    contactName: '',
    state: '',
  };
  const role = localStorage.getItem('Role');
  ///////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState<boolean>(false);

  ///////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    dispatch<any>(registerEmployer(formData)).then(() => {
      setLoading(false);
      toast.success('Employer created.');
      setFormData(initialData);
      setOpen(false);
    });
    // dispatch<any>(setEmployerCreateModal(formData))
    //   .then(({ payload }) => {
    //     setLoading(false);
    //     if (payload) {
    //       dispatch<any>(setEmployerSlice(payload));
    //       toast.success('Employer created.');
    //       setFormData(initialData);
    //       setOpen(false);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     toast.error('Something went wrong!');
    //   });
  };
  const onClose = () => {
    setOpen(false);
  };
  const validateForm = () => {
    if (!formData.name) {
      toast.error('Name is missing.');
      return false;
    }
    if (!formData.contactName) {
      toast.error('Contact Name is missing.');
      return false;
    }
    if (!formData.email) {
      toast.error('Email is missing.');
      return false;
    }
    if (!formData.branchLocation) {
      toast.error('Branch Location is missing.');
      return false;
    }
    if (!formData.city) {
      toast.error('City is missing.');
      return false;
    }
    if (!formData.addressLine1) {
      toast.error('Address Line 1 is missing.');
      return false;
    }
    if (!formData.state) {
      toast.error('State is missing.');
      return false;
    }
    return true;
  };

  ///////////////////////////////////////////////////////// RENDER /////////////////////////////////////////////////////////////
  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="md:px-6 w-full max-w-142.5 rounded-lg bg-white px-4 py-6 text-center dark:bg-boxdark md:py-8">
        <h3 className="pb-6 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Create Employer
        </h3>

        <form onSubmit={onSubmit}>
          {/* Name */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white"
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
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="contactName"
              >
                Contact Name <span className="text-red">*</span>
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="contactName"
                value={formData?.contactName}
                onChange={onChange}
                id="contactName"
                placeholder="Contact Name"
              />
            </div>
          </div>

          {/* Email & Branch Location */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="email"
              >
                Email <span className="text-red">*</span>
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="email"
                value={formData?.email}
                onChange={onChange}
                id="email"
                placeholder="email@example.com"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="branchLocation"
              >
                Branch Location <span className="text-red">*</span>
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="branchLocation"
                value={formData?.branchLocation}
                onChange={onChange}
                id="branchLocation"
                placeholder="Branch Location"
              />
            </div>
          </div>

          {/* City & Address Line 1 */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="City"
              >
                City <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded border border-stroke bg-gray py-3  px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="city"
                  value={formData?.city}
                  onChange={onChange}
                  id="city"
                  placeholder="City"
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="text-start mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="addressLine1"
              >
                Address Line 1 <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded border border-stroke bg-gray py-3  px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="addressLine1"
                  value={formData?.addressLine1}
                  onChange={onChange}
                  id="addressLine1"
                  placeholder="Address Line"
                />
              </div>
            </div>
          </div>

          {/* State */}
          <div className="w-full text-start">
            <label
              className="mb-3 block text-sm font-medium text-black dark:text-white text-start"
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

          {/* Submit and Cancel buttons */}
          <div className="flex justify-end gap-4.5 mt-6">
            <button
              onClick={onClose}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Cancel
            </button>
            <button
              className="flex justify-center rounded bg-graydark disabled:bg-primary/50 py-2 px-6 font-medium text-gray hover:bg-opacity-90"
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

export default CreateEmployerModal;
