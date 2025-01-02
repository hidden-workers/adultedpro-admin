import { Modal } from '@mui/material';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Class, LocalStorageAuthUser, User } from '../../interfaces';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  setClass,
  addStudentToUnassignedClass,
  removeStudentsFromUnassignedClass,
} from '../../store/reducers/classSlice';
import { fetchSessions } from '../../store/reducers/sessionSlice';
import {
  fetchTeachersOfInstitution,
  setUser,
} from '../../store/reducers/userSlice';
import { UserRolesEnum } from '../../utils/enums';

interface Props {
  open: boolean;
  setOpen: any;
  class?: Class;
}

const CreateClass: React.FC<Props> = ({ open, setOpen, class: classProp }) => {
  ///////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { students: fetchedStudents, teachers: fetchedTeachers } = useSelector(
    (state: RootState) => state.user,
  );
  const { sessions } = useSelector((state: RootState) => state.session);
  const { user } = useSelector((state: RootState) => state.user);
  const initialData: Class = {
    id: '',
    name: '',
    instructorName: '',
    instructorId: '',
    students: [],
    session: '',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    partnerId: '',
    isTest: false,
  };
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const studentsRef = useRef<any>();
  const role: UserRolesEnum = String(
    localStorage.getItem('Role'),
  ) as UserRolesEnum;

  ///////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  const [loading, setLoading] = useState({
    submit: false,
    teachers: false,
    approve: '',
  });
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [toggle, setToggle] = useState(false);
  const [formData, setFormData] = useState<Class>(classProp);
  const [searchValue, setSearchValue] = useState('');
  const [students, setStudents] = useState(fetchedStudents);
  const [teachers, setTeachers] = useState(fetchedStudents);
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('');

  ///////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        studentsRef?.current &&
        !studentsRef?.current?.contains(event.target)
      ) {
        setToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    dispatch<any>(fetchSessions());
    if (fetchedTeachers?.length > 0) return;
    setLoading((pre) => ({ ...pre, teachers: true }));
    dispatch<any>(fetchTeachersOfInstitution(authUser?.partnerId)).finally(() =>
      setLoading((pre) => ({ ...pre, teachers: false })),
    );
  }, []);
  useEffect(() => {
    if (classProp?.name) {
      setFormData(classProp);
      setSelectedValues(classProp.students.filter((p) => p != user?.id));
    }
  }, [classProp, open]);
  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue]);
  useEffect(() => {
    setStudents(fetchedStudents);
  }, [fetchedStudents]);
  useEffect(() => {
    setTeachers(fetchedTeachers?.filter((t) => t?.approvedByAdmin));
  }, [fetchedTeachers]);
  ///////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const removeStudents = (studentIds: string[]) => {
    dispatch<any>(removeStudentsFromUnassignedClass(studentIds))
      .then(() => {
        console.log('Students removed from unassigned class');
      })
      .catch((error) => {
        console.error('Failed to remove students:', error);
      });
  };
  const onCreate = () => {
    if (!formData?.name) return toast.error('Class Name is missing');
    if (!formData?.instructorId)
      return toast.error('Instructor Name is missing');
    if (!formData?.session) return toast.error('Session is missing');
    if (selectedValues.length == 0) return toast.error('Students are missing');
    const input = {
      ...formData,
      instructorName: teachers?.find((t) => t?.id == formData?.instructorId)
        ?.name,
      instructorId: formData?.instructorId,
      students: selectedValues,
      partnerId: authUser?.partnerId,
    };

    setLoading((pre) => ({ ...pre, submit: true }));
    dispatch<any>(setClass(input))
      .then(() => {
        setSelectedValues([]);
        setFormData(initialData);
        setToggle(false);
      })
      .catch((error) => {
        console.error('Failed to dispatch setClass action:', error);
      })
      .finally(() => {
        setOpen(false);
        setLoading((pre) => ({ ...pre, submit: false }));
      });
    removeStudents(selectedValues);
  };
  const onSearch = (value: string) => {
    setStudents(
      fetchedStudents.filter((s) =>
        s?.name?.toLowerCase()?.includes(value?.toLowerCase()),
      ),
    );
  };
  const onClose = () => {
    setFormData(initialData);
    setSelectedValues([]);
    setOpen(false);
  };
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const onOptionChange = (value: string) => {
    setSelectedValues((pre) =>
      pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
    );
  };
  const onApprove = (item: User) => {
    const input = { ...item, approvedByAdmin: true };
    const approvedStudent = { ...item, approvedByAdmin: true };
    setLoading((pre) => ({ ...pre, approve: item?.id }));

    dispatch<any>(setUser(input)).then(() => {
      dispatch<any>(addStudentToUnassignedClass(approvedStudent as User));
      setLoading((pre) => ({ ...pre, approve: '' }));
    });
  };

  ///////////////////////////////////////////////////////// RENDER /////////////////////////////////////////////////////////////
  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:py-15">
        <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Create Class
        </h3>

        <div className="flex flex-col gap-4 mb-4 ">
          <div className="flex flex-col items-start">
            <label
              htmlFor="name"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Class Name <span className="text-red">*</span>
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
              htmlFor="instructorId"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Instructor Name <span className="text-red">*</span>
            </label>
            <select
              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              name="instructorId"
              onChange={(e) => {
                onChange(e);
                setSelectedTeacherName(
                  () =>
                    teachers?.find((t) => t?.id == formData?.instructorId)
                      ?.name,
                );
              }}
              value={selectedTeacherName}
              id="instructorId"
            >
              <option value="">Select Instructor</option>

              {teachers.map((teacher, index) => (
                <option value={teacher?.id} key={index}>
                  {teacher?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-start">
            <label
              htmlFor="session"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Session <span className="text-red">*</span>
            </label>
            <select
              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              name="session"
              onChange={onChange}
              value={formData?.session}
              id="session"
            >
              <option value="">Select Session</option>
              {sessions.map((session, index) => (
                <option value={session?.name} key={index}>
                  {session?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="">
            <label
              htmlFor="member"
              className="mb-1 block text-lg font-medium text-black dark:text-white text-start "
            >
              Add Students <span className="text-red">*</span>
            </label>
            <div className="flex flex-col gap-2.5">
              <div ref={studentsRef} className="w-full relative ">
                <div
                  onClick={() => setToggle((pre) => !pre)}
                  className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  Students
                </div>
                {toggle && (
                  <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto  ">
                    <div className="p-2 bg-gray ">
                      <input
                        type="text"
                        placeholder="Search students"
                        value={searchValue}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    </div>
                    {(role == UserRolesEnum.SchoolAdmin
                      ? students
                      : students?.filter((s) => s?.approvedByAdmin)
                    )?.map((student: User, index: number) => (
                      <div key={index}>
                        <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex justify-between items-center cursor-pointer select-none gap-2 text-sm font-medium text-black dark:text-white">
                          <input
                            className="sr-only"
                            type="checkbox"
                            name="recommend"
                            onChange={() => onOptionChange(student?.id)}
                          />
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues.includes(student?.id) ? 'border-primary' : 'border-body'}`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues.includes(student?.id) ? 'flex' : 'hidden'}`}
                              />
                            </span>
                            {student?.name}
                          </span>
                          {!student?.approvedByAdmin && (
                            <button
                              type="button"
                              onClick={() => onApprove(student)}
                              className="w-max-content flex h-fit items-center justify-center rounded-md bg-black px-1.5 py-1 text-xs text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-primary/75"
                            >
                              {loading.approve == student?.id
                                ? 'Approving...'
                                : 'Approve'}
                            </button>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
              {selectedValues?.map((selected, i) => (
                <span
                  key={i}
                  className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                >
                  {students?.find((s) => s?.id == selected)?.name}
                  <X
                    onClick={() =>
                      setSelectedValues((pre) =>
                        pre.filter((p) => p != selected),
                      )
                    }
                    className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="-mx-3 flex flex-wrap gap-y-4">
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.submit}
              onClick={onClose}
              className="block w-full rounded border border-stroke bg-gray disabled:cursor-not-allowed p-3 text-center font-medium text-black transition dark:border-strokedark dark:bg-meta-4 "
            >
              Cancel
            </button>
          </div>
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.submit}
              onClick={onCreate}
              className="block w-full rounded border border-black bg-black hover:bg-black/90 disabled:bg-black/90 disabled:cursor-not-allowed p-3 text-center font-medium text-white transition "
            >
              {loading.submit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateClass;
