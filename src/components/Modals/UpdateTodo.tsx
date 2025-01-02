import React, { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Todo, Program } from '../../interfaces';
import { updateTodo } from '../../store/reducers/todoSlice';
import { fetchPartnerById } from '../../store/reducers/partnerSlice';
import {
  fetchTeachersOfInstitution,
  fetchStudentsOfInstitution,
} from '../../store/reducers/userSlice';
import { Modal } from '@mui/material';
import toast from 'react-hot-toast';
import { UserRolesEnum } from '../../utils/enums';
import {
  fetchPrograms,
  selectPrograms,
  selectProgramStatus,
} from '../../store/reducers/programSlice';

interface Props {
  open: boolean;
  setOpen: any;
  todo?: Todo;
}

const UpdateTodo: React.FC<Props> = ({ open, setOpen, todo }) => {
  const dispatch = useDispatch();
  const { teachers: fetchedTeachers, students: fetchedStudents } = useSelector(
    (state: RootState) => state.user,
  );

  const role = String(localStorage.getItem('Role'));
  const initialData: Todo = {
    title: '',
    description: '',
    completed: false,
    userId: '',
    type: 'normal',
    pendingUserId: null, // For type pending-teachers and pending-students
    dateCreated: new Date(),
    dateUpdated: new Date(),
    isTest: false,
  };
  const programs = useSelector((state: RootState) => selectPrograms(state));
  const status = useSelector((state: RootState) => selectProgramStatus(state));
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  const mongoUserId = localStorage.getItem('mongoUserId');

  const [teachers, setTeachers] = useState(fetchedTeachers);
  // const [program, setClasses] = useState(fetchedClasses);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [formData, setFormData] = useState<Todo>(todo);
  const [todoType, setTodoType] = useState<'personal' | 'teachers' | 'program'>(
    'personal',
  );
  const [loading, setLoading] = useState({
    submit: false,
    teachers: false,
  });
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [fetchedPrograms, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch<any>(fetchPrograms(true));
    }

    if (status === 'succeeded') {
      setPrograms(programs);
    }
  }, [status, dispatch, programs]);

  useEffect(() => {
    dispatch<any>(fetchPartnerById(mongoInstituteId));
  }, []);

  useEffect(() => {
    if (fetchedTeachers?.length > 0) return;
    setLoading((pre) => ({ ...pre, teachers: true }));
    dispatch<any>(
      fetchTeachersOfInstitution({ instituteId: mongoInstituteId }),
    ).finally(() => setLoading((pre) => ({ ...pre, teachers: false })));
  }, []);

  useEffect(() => {
    const { formattedDate, formattedTime } = extractDateTime(todo?.dueDateTime);
    setDueDate(formattedDate);
    setDueTime(formattedTime);
  }, [todo]);

  useEffect(() => {
    setTeachers(fetchedTeachers);
  }, [fetchedTeachers]);
  useEffect(() => {
    if (fetchedStudents?.length > 0) return;
    dispatch<any>(
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      }),
    );
  }, [fetchedStudents]);
  useEffect(() => {
    if (todo?.title) setFormData(todo);
    else {
      setFormData(initialData);
      setSelectedPrograms([]);
    }
  }, [todo, open]);

  const extractDateTime = (dueDateTime: string) => {
    if (!dueDateTime) return { formattedDate: '', formattedTime: '' };
    const date = new Date(dueDateTime);
    if (isNaN(date.getTime())) {
      return { formattedDate: '', formattedTime: '' };
    }

    return {
      formattedDate: date.toISOString().split('T')[0],
      formattedTime: date.toTimeString().split(' ')[0],
    };
  };

  const getStudentsInProgram = (programName: string) => {
    return (
      fetchedStudents?.filter((student) => {
        const studentProgram = student?.program;
        if (typeof studentProgram !== 'string' && studentProgram?.name) {
          return (
            studentProgram?.name?.toLowerCase() ===
              programName?.toLowerCase() && studentProgram?.approved
          );
        }
        if (typeof studentProgram === 'string') {
          return studentProgram?.toLowerCase() === programName?.toLowerCase();
        }
        return false;
      }) || []
    );
  };
  const onUpdate = () => {
    if (!formData?.title) return alert('Title is missing');
    if (!formData?.description) return alert('Description is missing');
    if (todoType === 'program' && selectedPrograms?.length === 0)
      return alert('Please select program');
    if (!dueDate || !dueTime) return alert('Please select due date and time');

    const dueDateTime = new Date(`${dueDate}T${dueTime}`).toISOString();

    if (todoType === 'personal') {
      setLoading((pre) => ({ ...pre, submit: true }));
      dispatch<any>(
        updateTodo({
          ...formData,
          userId: mongoUserId,
          dueDateTime: dueDateTime,
        }),
      )
        .then(() => {
          toast.success('Reminder updated successfully.');
          setFormData(initialData);
          setSelectedPrograms([]);
          setLoading((pre) => ({ ...pre, submit: false }));
          setOpen(false);
        })
        .catch((error) => {
          setLoading((pre) => ({ ...pre, submit: false }));
          console.error('Failed to dispatch setTodo action:', error);
        });
    } else {
      let ids = [];
      if (todoType === 'program') {
        const selectedProgramsData = fetchedPrograms.filter((p) =>
          selectedPrograms?.includes(p?.id),
        );
        ids = selectedProgramsData
          ?.map((c) => {
            return getStudentsInProgram(c?.name);
          })
          .flat();
      } else if (todoType === 'teachers') {
        ids = teachers
          ?.filter((teacher) => teacher?.approvedByAdmin)
          ?.map((teacher) => teacher?.id);
      }
      ids = [...(ids || []), mongoUserId];
      setLoading((pre) => ({ ...pre, submit: true }));
      Promise.all(
        ids?.map((id) => {
          dispatch<any>(updateTodo({ ...formData, userId: id, dueDateTime }));
        }),
      )
        .then(() => {
          toast.success('Reminder sent successfully.');
          setFormData(initialData);
          setSelectedPrograms([]);
          setLoading((pre) => ({ ...pre, submit: false }));
          setOpen(false);
        })
        .catch((error) => {
          console.error('Failed to dispatch setTodo action:', error);
          setLoading((pre) => ({ ...pre, submit: false }));
        });
    }
  };

  const onClose = () => {
    setFormData(initialData);
    setSelectedPrograms([]);
    setOpen(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };

  const onOptionChange = (value: string) => {
    setSelectedPrograms((pre) =>
      pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="relative max-w-md w-full max-h-[90vh] bg-white rounded-lg overflow-y-auto p-8 dark:bg-boxdark">
        <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Update Todo
        </h3>

        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col items-start">
            <label
              htmlFor="title"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Title <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData?.title}
              onChange={onChange}
              placeholder="Title"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex flex-col items-start">
            <label
              htmlFor="description"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Description <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData?.description}
              onChange={onChange}
              placeholder="Description"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex flex-col items-start">
            <label
              htmlFor="type"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Type <span className="text-red">*</span>
            </label>
            <select
              value={todoType}
              onChange={(e) =>
                setTodoType(
                  e.target.value as 'personal' | 'teachers' | 'program',
                )
              }
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="personal">Personal</option>
              {role === UserRolesEnum.SchoolAdmin && (
                <option value="teachers">Teachers</option>
              )}
              {role === UserRolesEnum.SchoolAdmin && (
                <option value="program">Program</option>
              )}
            </select>
          </div>
          {todoType === 'program' && (
            <div className="flex flex-col items-start">
              <label
                htmlFor="class"
                className="mb-1 block text-lg font-medium text-black dark:text-white"
              >
                Select Program <span className="text-red">*</span>
              </label>
              <div className="flex flex-col gap-2 w-full">
                {programs.map((cls) => (
                  <label key={cls.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={cls.id}
                      checked={selectedPrograms.includes(cls.id)}
                      onChange={() => onOptionChange(cls.id)}
                      className="mr-2"
                    />
                    {cls.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col items-start">
            <label
              htmlFor="dueDate"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Due Date <span className="text-red">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex flex-col items-start">
            <label
              htmlFor="dueTime"
              className="mb-1 block text-lg font-medium text-black dark:text-white"
            >
              Due Time <span className="text-red">*</span>
            </label>
            <input
              type="time"
              name="dueTime"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="-mx-3 flex flex-wrap gap-y-4">
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.submit}
              onClick={onClose}
              className="block w-full rounded border border-stroke bg-gray disabled:cursor-not-allowed p-3 text-center font-medium text-black transition dark:border-strokedark dark:bg-meta-4"
            >
              Cancel
            </button>
          </div>
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading.submit}
              onClick={onUpdate}
              className="block w-full rounded border border-black bg-black hover:bg-black/90 disabled:bg-black/90 disabled:cursor-not-allowed p-3 text-center font-medium text-white transition"
            >
              {loading.submit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateTodo;
