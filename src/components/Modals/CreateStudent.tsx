import { Modal } from '@mui/material';
import React, { ChangeEvent, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LocalStorageAuthUser, User } from '../../interfaces';
import { createStudentsOfInstitution } from '../../store/reducers/userSlice';
import { UserRolesEnum } from '../../utils/enums';
import { Program } from '../../interfaces';
import SelectProgram from '../../pages/Dashboard/SelectProgram';
import {
  fetchPrograms,
  selectPrograms,
  selectProgramStatus,
} from '../../store/reducers/programSlice';
import { RootState } from '../../store/store';

interface Props {
  open: boolean;
  setOpen: any;
  class?: User;
}

const CreateStudent: React.FC<Props> = ({ open, setOpen }) => {
  ///////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const role: UserRolesEnum = String(
    localStorage.getItem('Role'),
  ) as UserRolesEnum;
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const programs = useSelector((state: RootState) => selectPrograms(state));
  const status = useSelector((state: RootState) => selectProgramStatus(state));
  const initialData: User = {
    id: '',
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
    role: [UserRolesEnum.Student],
    approvedByAdmin: role == UserRolesEnum.SchoolAdmin,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    bio: '',
    program: {
      approved: false,
      name: '',
      questionType: '',
    },
    program_id: '',
    tagLine: '',
    interestedIn: '',
    isLegalTermsAccepted: false,
    visitedBy: [],
    lastSignedIn: '',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    partnerId: authUser?.partnerId,
    isTest: false,
  };
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  ///////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  const [loading, setLoading] = useState({
    submit: false,
    teachers: false,
    approve: '',
  });
  const [formData, setFormData] = useState<User>(initialData);

  ///////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  useEffect(() => {
    if (status === 'idle') {
      dispatch<any>(fetchPrograms(true));
    }
  }, [status, dispatch]);

  ///////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////

  const handleProgramFilterChange = (program: Program | null) => {
    if (program) {
      setFormData((prev) => ({
        ...prev,
        program: program,
        program_id: program.id,
      }));
    }
  };

  const onCreate = () => {
    const emailRegex =
      /^\s*[a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+([.-]?[a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*@\w+([.-]?\w+)*(\.[a-zA-Z0-9-]{2,})+\s*$/;
    if (!formData?.name) return alert('Name is required');
    if (!formData?.email) return alert('Email is required');
    if (!emailRegex.test(formData.email)) {
      return alert('Invalid email format');
    }
    if (!formData?.name) return alert('Name is required');
    if (!formData?.email) return alert('Email is required');
    if (!emailRegex.test(formData.email)) {
      return alert('Invalid email format');
    }
    if (!formData.program_id) {
      return alert('Program is required.');
    }

    const input = {
      ...formData,
      partnerId: authUser?.partnerId,
    };

    setLoading((prev) => ({ ...prev, submit: true }));

    dispatch<any>(
      createStudentsOfInstitution({
        studentData: input,
        institute_id: mongoInstituteId,
      }),
    )
      .then(() => {
        setFormData(initialData);
      })
      .catch((error) => {
        console.error('Failed to dispatch actions:', error);
      })
      .finally(() => {
        setOpen(false);
        setLoading((prev) => ({ ...prev, submit: false }));
      });
  };

  const onClose = () => {
    setFormData(initialData);
    setOpen(false);
  };
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'programName') {
      setFormData((prev) => ({
        ...prev,
        program: {
          ...(typeof prev.program === 'string'
            ? { approved: true, questionType: '' }
            : prev.program),
          name: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  ///////////////////////////////////////////////////////// RENDER /////////////////////////////////////////////////////////////
  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15">
        <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Add Student
        </h3>

        <div className="mb-4 flex flex-col gap-4 ">
          <div className="flex flex-col items-start">
            <label
              htmlFor="name"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData?.name}
              onChange={onChange}
              placeholder="Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex flex-col items-start">
            <label
              htmlFor="email"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Email <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="email"
              value={formData?.email}
              onChange={onChange}
              placeholder="Email"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <label
            htmlFor="programName"
            className="block text-lg font-medium text-black dark:text-white text-left"
          >
            Program <span className="text-red">*</span>
          </label>
          <SelectProgram
            programs={programs}
            onFilterChange={handleProgramFilterChange}
          />
        </div>

        <div className="-mx-3 flex flex-wrap gap-y-4">
          <div className="w-full px-3 2xsm:w-1/2">
            <button
              disabled={loading.submit}
              onClick={onClose}
              className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition disabled:cursor-not-allowed dark:border-strokedark dark:bg-meta-4 "
            >
              Cancel
            </button>
          </div>
          <div className="w-full px-3 2xsm:w-1/2">
            <button
              disabled={loading.submit}
              onClick={onCreate}
              className="block w-full rounded border border-black bg-black p-3 text-center font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/90 "
            >
              {loading.submit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateStudent;
