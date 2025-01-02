import 'flatpickr/dist/flatpickr.min.css';
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import LastMessages from '../../components/Notifications/LastMessages';
import {
  fetchMessagesByPartnerId,
  createMessage,
} from '../../store/reducers/messageSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import toast from 'react-hot-toast';
import {
  BoardMessageTo,
  BoardMessageType,
  UserRolesEnum,
} from '../../utils/enums';
import { ChevronDown, X } from 'lucide-react';
import {
  BoardMessage,
  LocalStorageAuthUser,
  User,
  Program,
} from '../../interfaces';
import {
  fetchCounsellorsOfInstitution,
  fetchStudentsOfInstitution,
  fetchTeachersOfInstitution,
} from '../../store/reducers/userSlice';
import TemplateSelector from '../../components/Modals/TemplatesModal';
import PreviewModal from '../../components/Modals/MessagePreviewModal';
import {
  fetchPrograms,
  selectPrograms,
  getUsersByProgramIdApi,
  selectProgramStatus,
} from '../../store/reducers/programSlice';
import useMobile from '../../hooks/useMobile';

const MessageBoard: React.FC = () => {
  //////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const dropdownRef = useRef<any>();
  const programs = useSelector((state: RootState) => selectPrograms(state));
  const status = useSelector((state: RootState) => selectProgramStatus(state));
  const {
    students: fetchedStudents,
    teachers: fetchedTeachers,
    counsellors: fetchedCounsellors,
  } = useSelector((state: RootState) => state.user);
  const initialData = {
    title: '',
    type: BoardMessageType.Email,
    to: BoardMessageTo.Students,
    description: '',
  };
  const role: UserRolesEnum = String(
    localStorage.getItem('Role'),
  ) as UserRolesEnum;
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const boardMessageTo = [
    // 'Teachers',
    // 'Counsellors',
    'Students',
    'Programs',
    // 'Admin',
  ];
  const [isMobile] = useMobile();
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  //////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState({
    submit: false,
    classes: false,
    students: false,
    teachers: false,
    counsellors: false,
  });
  const [seeAll, setSeeAll] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [students, setStudents] = useState(fetchedStudents);
  const [teachers, setTeachers] = useState(fetchedTeachers);
  const [counsellors, setCounsellors] = useState(fetchedCounsellors);
  const [searchValue, setSearchValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [fetchedPrograms, setPrograms] = useState<Program[]>([]);
  //////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  useEffect(() => {
    if (status === 'idle') {
      dispatch<any>(fetchPrograms(true));
    }

    if (status === 'succeeded') {
      setPrograms(programs);
    }
  }, [status, dispatch, programs]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      //// @ts-expect-error: TypeScript error due to type mismatch between MouseEvent and Event
      if (
        dropdownRef?.current &&
        !dropdownRef?.current?.contains(event.target)
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
    dispatch<any>(fetchMessagesByPartnerId(mongoInstituteId));
  }, []);
  useEffect(() => {
    if (fetchedStudents?.length > 0) return;
    setLoading((pre) => ({ ...pre, students: true }));
    dispatch<any>(
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      }),
    ).finally(() => setLoading((pre) => ({ ...pre, students: false })));
  }, []);
  useEffect(() => {
    if (fetchedTeachers?.length > 0) return;
    setLoading((pre) => ({ ...pre, teachers: true }));
    dispatch<any>(
      fetchTeachersOfInstitution({ instituteId: mongoInstituteId }),
    ).finally(() => setLoading((pre) => ({ ...pre, teachers: false })));
  }, []);
  useEffect(() => {
    if (fetchedCounsellors?.length > 0) return;
    setLoading((pre) => ({ ...pre, counsellors: true }));
    dispatch<any>(fetchCounsellorsOfInstitution(authUser?.partnerId)).finally(
      () => setLoading((pre) => ({ ...pre, counsellors: false })),
    );
  }, []);
  useEffect(() => {
    setTeachers(fetchedTeachers);
  }, [fetchedTeachers]);
  useEffect(() => {
    setCounsellors(fetchedCounsellors);
  }, [fetchedCounsellors]);
  useEffect(() => {
    if (role == UserRolesEnum.SchoolAdmin) setStudents(fetchedStudents);
  }, [fetchedStudents]);
  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue]);
  useEffect(() => {
    setSelectedValues([]);
  }, [formData?.to]);
  useEffect(() => {
    setSelectedEmails([]);
  }, [formData?.to]);
  useEffect(() => {
    setSelectedPrograms([]);
  }, [formData?.to]);
  //////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const getStudentsInProgram = (programName: string) => {
    return (
      students?.filter((student) => {
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
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    let toIds = selectedValues;
    let toEmails = selectedEmails;
    switch (formData?.to) {
      case 'Counsellors':
        toIds = selectedValues;
        toEmails = selectedEmails;
        break;
      case 'Teachers':
        toIds = selectedValues;
        toEmails = selectedEmails;
        break;
      case 'Students':
        toIds = selectedValues;
        toEmails = selectedEmails;
        break;
      case 'Programs':
        toIds = selectedValues;
        toEmails = selectedEmails;
        break;

      case 'Admin':
        toIds = role == UserRolesEnum.SchoolAdmin ? [authUser?.id] : [];
        toEmails = role == UserRolesEnum.SchoolAdmin ? [authUser?.email] : [];
        break;
      default:
        toIds = [];
        toEmails = [];
        break;
    }

    const input: BoardMessage = {
      ...formData,
      id: '',
      partnerId: mongoInstituteId || '',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      description: formData?.description,
      toIds: [...toIds],
      toEmails: [...toEmails],
      isTest: false,
    };
    setLoading((pre) => ({ ...pre, submit: true }));
    dispatch<any>(createMessage(input))
      .then(() => {
        toast.success('Message sent successfully.');
        setFormData(initialData);
      })
      .catch((error) => {
        toast.error('Something went wrong.');
        console.error(error);
      })
      .finally(() => {
        setLoading((pre) => ({ ...pre, submit: false }));
      });
  };
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };
  const validateForm = () => {
    if (!formData.title) {
      toast.error('Title is missing.');
      return false;
    }
    if (!formData.type) {
      toast.error('Type is missing.');
      return false;
    }
    if (!formData.description) {
      toast.error('Description is missing.');
      return false;
    }
    if (!formData.to) {
      toast.error('Message To is missing.');
      return false;
    }
    if (
      formData?.to == BoardMessageTo.Programs &&
      selectedValues?.length == 0
    ) {
      toast.error('There are no students in program.');
      return false;
    }
    if (
      formData?.to == BoardMessageTo.Students &&
      selectedValues?.length == 0
    ) {
      toast.error('Please select students from the list.');
      return false;
    }

    return true; // Return true if all validations pass
  };

  const onOptionChange = async (
    value: string,
    type: 'students' | 'programs' | 'teachers' | 'counsellors',
  ) => {
    if (value === 'all') {
      if (type === 'programs') {
        try {
          const items = fetchedPrograms;
          setSelectedPrograms((pre) =>
            pre.length == items?.length ? [] : items?.map((c) => c?.id),
          );

          // Fetch all users for each program and collect their IDs and emails
          const programIds = fetchedPrograms.map((program) => program.id);
          const usersData = await Promise.all(
            programIds.map((programId) =>
              getUsersByProgramIdApi(programId, 100000, mongoInstituteId),
            ),
          );

          // Flatten the user data and extract IDs and emails
          const allUsers = usersData.flat();
          const ids = allUsers.map((user) => user.id);
          const emails = allUsers.map((user) => user.email);

          setSelectedValues((prev) =>
            prev.length === ids.length && ids.every((id) => prev.includes(id))
              ? []
              : ids,
          );

          setSelectedEmails((prev) =>
            prev.length === emails.length &&
            emails.every((email) => prev.includes(email))
              ? []
              : emails,
          );
        } catch (error) {
          console.error('Error fetching users for all programs:', error);
        }
      } else {
        const items =
          type === 'students'
            ? students?.filter?.((s) => s?.approvedByAdmin)
            : type === 'teachers'
              ? teachers
              : type === 'counsellors'
                ? counsellors
                : fetchedPrograms;

        setSelectedValues((prev) =>
          prev.length === items?.length ? [] : items?.map((c) => c?.id),
        );

        setSelectedEmails((prev) =>
          prev.length === items?.length ? [] : items?.map((c) => c?.email),
        );
      }
    } else if (type === 'programs') {
      try {
        // Fetch users for the selected program
        const users = await getUsersByProgramIdApi(
          value,
          100000,
          mongoInstituteId,
        );
        const ids = users.map((user) => user.id);
        const emails = users.map((user) => user.email);
        setSelectedPrograms((prev) =>
          prev.includes(value)
            ? prev.filter((programId) => programId !== value)
            : [...prev, value],
        );
        setSelectedValues((prev) =>
          prev.length === ids.length && ids.every((id) => prev.includes(id))
            ? []
            : ids,
        );

        setSelectedEmails((prev) =>
          prev.length === emails.length &&
          emails.every((email) => prev.includes(email))
            ? []
            : emails,
        );
      } catch (error) {
        console.error('Error fetching users by program ID:', error);
      }
    } else {
      setSelectedValues((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );

      const selectedEmail = (() => {
        switch (type) {
          case 'students':
            return students?.find((s) => s?.id === value)?.email;
          case 'teachers':
            return teachers?.find((t) => t?.id === value)?.email;
          case 'counsellors':
            return counsellors?.find((c) => c?.id === value)?.email;
          default:
            return null;
        }
      })();

      setSelectedEmails((prev) =>
        selectedEmail && prev.includes(selectedEmail)
          ? prev.filter((email) => email !== selectedEmail)
          : selectedEmail
            ? [...prev, selectedEmail]
            : prev,
      );
    }
  };

  const onSearch = (value: string) => {
    if (formData?.to === 'Students') {
      let studentsToSearch = [];

      if (role === UserRolesEnum.SchoolAdmin) {
        studentsToSearch = fetchedStudents;
      } else {
        const studentIds: string[] = fetchedPrograms
          ?.map((program) => {
            return getStudentsInProgram(program?.name);
          })
          .flat()
          .map((student) => {
            return student?.id;
          })
          .filter((id): id is string => {
            return !!id;
          });

        studentsToSearch = fetchedStudents?.filter((student) => {
          const includeStudent = studentIds.includes(student?.id || '');
          return includeStudent;
        });
      }
      setStudents(
        studentsToSearch?.filter((s) =>
          s?.name?.toLowerCase()?.includes(value?.toLowerCase()),
        ),
      );
    } else if (formData?.to == 'Programs') {
      const filteredPrograms = programs.filter((program) =>
        program?.name?.toLowerCase()?.includes(value?.toLowerCase()),
      );
      setPrograms(filteredPrograms);
    } else if (formData?.to == 'Teachers') {
      const teachersToSearch = fetchedTeachers;
      setTeachers(
        teachersToSearch.filter((t) =>
          t?.name?.toLowerCase()?.includes(value?.toLowerCase()),
        ),
      );
    } else if (formData?.to == 'Counsellors') {
      const counsellorsToSearch = fetchedCounsellors;
      setCounsellors(
        counsellorsToSearch.filter((c) =>
          c?.name?.toLowerCase()?.includes(value?.toLowerCase()),
        ),
      );
    }
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openPreviewModal = () => setIsPreviewModalOpen(true);
  const closePreviewModal = () => setIsPreviewModalOpen(false);

  const handleTemplateSelection = (template) => {
    setFormData((prevData) => ({
      ...prevData,
      title: template.subject,
      description: template.message,
    }));
  };
  return (
    <DefaultLayout>
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          {
            <div className="flex flex-col gap-9">
              {/* <!-- Contact Form --> */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Send A Message
                  </h3>
                </div>
                <form onSubmit={onSubmit}>
                  <div className="p-6.5 flex flex-col gap-5 ">
                    <div className="">
                      <label className="mb-2.5 block font-bold text-black dark:text-white">
                        Type <span className="text-meta-1">*</span>
                      </label>
                      <div className="flex gap-4">
                        <div className="flex gap-1">
                          <input
                            type="radio"
                            id="email"
                            name="type"
                            value="Email"
                            checked={formData?.type === BoardMessageType.Email}
                            onChange={onChange}
                            className=""
                          />
                          <label htmlFor="email">Email</label>
                        </div>
                        <div className="flex gap-1">
                          <input
                            type="radio"
                            id="notification"
                            name="type"
                            value="Notification"
                            checked={
                              formData?.type === BoardMessageType.Notification
                            }
                            onChange={onChange}
                            className=""
                          />
                          <label htmlFor="notification">Notification</label>
                        </div>

                        {/* <div className="flex gap-1">
                          <input
                            type="radio"
                            id="emailAndNotification"
                            name="type"
                            value="EmailAndNotification"
                            checked={
                              formData?.type ===
                              BoardMessageType.EmailAndNotification
                            }
                            onChange={onChange}
                            className=""
                          />
                          <label htmlFor="emailAndNotification">
                            Email and Notification
                          </label>
                        </div> */}
                      </div>
                    </div>

                    <div className="">
                      <label className="mb-2.5 block text-black font-bold dark:text-white">
                        Message To <span className="text-red">*</span>
                      </label>

                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <select
                          value={formData?.to}
                          title="Message To"
                          name="to"
                          onChange={onChange}
                          className={`  relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary `}
                        >
                          <option
                            value=""
                            disabled
                            className="text-body font-bold dark:text-bodydark"
                          >
                            Message To
                          </option>
                          {boardMessageTo.map((value, i) => (
                            <option
                              key={i}
                              value={value}
                              className="text-body dark:text-bodydark"
                            >
                              {value}
                            </option>
                          ))}
                        </select>

                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                          <ChevronDown />
                        </span>
                      </div>
                    </div>

                    {formData?.to == 'Programs' && (
                      <div className="">
                        <label className="mb-2.5 block text-black font-bold dark:text-white">
                          Programs <span className="text-red">*</span>
                        </label>
                        <div className="flex flex-col gap-2.5">
                          <div ref={dropdownRef} className="w-full relative ">
                            <div
                              onClick={() => setToggle((pre) => !pre)}
                              className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              Select Programs
                            </div>
                            {toggle && (
                              <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto  ">
                                <div className="p-2 bg-gray ">
                                  <input
                                    type="text"
                                    placeholder="Search program"
                                    value={searchValue}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    onChange={(e) =>
                                      setSearchValue(e.target.value)
                                    }
                                  />
                                </div>
                                {role == UserRolesEnum.SchoolAdmin && (
                                  <div>
                                    <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                      <input
                                        className="sr-only"
                                        type="checkbox"
                                        name="recommend"
                                        onChange={() =>
                                          onOptionChange('all', 'programs')
                                        }
                                      />
                                      <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedPrograms?.length == fetchedPrograms?.length ? 'border-primary' : 'border-body'}`}
                                      >
                                        <span
                                          className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedPrograms?.length == fetchedPrograms?.length ? 'flex' : 'hidden'}`}
                                        />
                                      </span>
                                      All
                                    </label>
                                  </div>
                                )}
                                {fetchedPrograms.map(
                                  (c: Program, index: number) => (
                                    <div key={index}>
                                      <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                        <input
                                          className="sr-only"
                                          type="checkbox"
                                          name="recommend"
                                          onChange={() =>
                                            onOptionChange(c?.id, 'programs')
                                          }
                                        />
                                        <span
                                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedPrograms.includes(c?.id) ? 'border-primary' : 'border-body'}`}
                                        >
                                          <span
                                            className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedPrograms.includes(c?.id) ? 'flex' : 'hidden'}`}
                                          />
                                        </span>
                                        {c?.name}
                                      </label>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                          {selectedPrograms.map((selected, i) => (
                            <span
                              key={i}
                              className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                            >
                              {
                                fetchedPrograms.find((s) => s?.id == selected)
                                  ?.name
                              }
                              <X
                                onClick={() => {
                                  setSelectedValues((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                  setSelectedEmails((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                  setSelectedPrograms((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                }}
                                className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData?.to == 'Students' && (
                      <div className="">
                        <label className="mb-2.5 block text-black font-bold dark:text-white">
                          Students <span className="text-red">*</span>
                        </label>
                        <div className="flex flex-col gap-2.5">
                          <div ref={dropdownRef} className="w-full relative ">
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
                                    onChange={(e) =>
                                      setSearchValue(e.target.value)
                                    }
                                  />
                                </div>
                                {role == UserRolesEnum.SchoolAdmin && (
                                  <div>
                                    <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                      <input
                                        className="sr-only"
                                        type="checkbox"
                                        name="recommend"
                                        onChange={() =>
                                          onOptionChange('all', 'students')
                                        }
                                      />
                                      <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues?.length == students?.length ? 'border-primary' : 'border-body'}`}
                                      >
                                        <span
                                          className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues?.length == students?.length ? 'flex' : 'hidden'}`}
                                        />
                                      </span>
                                      All
                                    </label>
                                  </div>
                                )}
                                {students
                                  ?.filter((s) => s?.approvedByAdmin)
                                  ?.map((option: User, index: number) => (
                                    <div key={index}>
                                      <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                        <input
                                          className="sr-only"
                                          type="checkbox"
                                          name="recommend"
                                          onChange={() =>
                                            onOptionChange(
                                              option?.id,
                                              'students',
                                            )
                                          }
                                        />
                                        <span
                                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                                        >
                                          <span
                                            className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues.includes(option?.id) ? 'flex' : 'hidden'}`}
                                          />
                                        </span>
                                        {option?.name}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                          {selectedValues.map((selected, i) => (
                            <span
                              key={i}
                              className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                            >
                              {students?.find((s) => s?.id == selected)?.name}
                              <X
                                onClick={() => {
                                  setSelectedValues((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                  setSelectedEmails((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                }}
                                className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData?.to == 'Teachers' && (
                      <div className="">
                        <label className="mb-2.5 block text-black font-bold dark:text-white">
                          Teachers <span className="text-red">*</span>
                        </label>
                        <div className="flex flex-col gap-2.5">
                          <div ref={dropdownRef} className="w-full relative ">
                            <div
                              onClick={() => setToggle((pre) => !pre)}
                              className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              Teachers
                            </div>
                            {toggle && (
                              <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto  ">
                                <div className="p-2 bg-gray ">
                                  <input
                                    type="text"
                                    placeholder="Search teachers"
                                    value={searchValue}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    onChange={(e) =>
                                      setSearchValue(e.target.value)
                                    }
                                  />
                                </div>
                                {role == UserRolesEnum.SchoolAdmin && (
                                  <div>
                                    <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                      <input
                                        className="sr-only"
                                        type="checkbox"
                                        name="recommend"
                                        onChange={() =>
                                          onOptionChange('all', 'teachers')
                                        }
                                      />
                                      <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues?.length == teachers?.length ? 'border-primary' : 'border-body'}`}
                                      >
                                        <span
                                          className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues?.length == teachers?.length ? 'flex' : 'hidden'}`}
                                        />
                                      </span>
                                      All
                                    </label>
                                  </div>
                                )}
                                {teachers
                                  ?.filter((s) => s?.approvedByAdmin)
                                  ?.map((option: User, index: number) => (
                                    <div key={index}>
                                      <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                        <input
                                          className="sr-only"
                                          type="checkbox"
                                          name="recommend"
                                          onChange={() =>
                                            onOptionChange(
                                              option?.id,
                                              'teachers',
                                            )
                                          }
                                        />
                                        <span
                                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                                        >
                                          <span
                                            className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues.includes(option?.id) ? 'flex' : 'hidden'}`}
                                          />
                                        </span>
                                        {option?.name}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                          {selectedValues.map((selected, i) => (
                            <span
                              key={i}
                              className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                            >
                              {teachers?.find((s) => s?.id == selected)?.name}
                              <X
                                onClick={() => {
                                  setSelectedValues((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                  setSelectedEmails((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                }}
                                className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData?.to == 'Counsellors' && (
                      <div className="">
                        <label className="mb-2.5 block text-black font-bold dark:text-white">
                          Counsellors <span className="text-red">*</span>
                        </label>
                        <div className="flex flex-col gap-2.5">
                          <div ref={dropdownRef} className="w-full relative ">
                            <div
                              onClick={() => setToggle((pre) => !pre)}
                              className="cursor-pointer text-start w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              Counsellors
                            </div>
                            {toggle && (
                              <div className="absolute top-full left-0 w-full max-h-40 overflow-y-auto  ">
                                <div className="p-2 bg-gray ">
                                  <input
                                    type="text"
                                    placeholder="Search counsellors"
                                    value={searchValue}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    onChange={(e) =>
                                      setSearchValue(e.target.value)
                                    }
                                  />
                                </div>
                                {role == UserRolesEnum.SchoolAdmin && (
                                  <div>
                                    <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                      <input
                                        className="sr-only"
                                        type="checkbox"
                                        name="recommend"
                                        onChange={() =>
                                          onOptionChange('all', 'counsellors')
                                        }
                                      />
                                      <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues?.length == counsellors?.length ? 'border-primary' : 'border-body'}`}
                                      >
                                        <span
                                          className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues?.length == counsellors?.length ? 'flex' : 'hidden'}`}
                                        />
                                      </span>
                                      All
                                    </label>
                                  </div>
                                )}
                                {counsellors
                                  ?.filter((s) => s?.approvedByAdmin)
                                  ?.map((option: User, index: number) => (
                                    <div key={index}>
                                      <label className="rounded bg-gray shadow-md space-y-2 p-2 relative flex cursor-pointer select-none items-end gap-2 text-sm font-medium text-black dark:text-white">
                                        <input
                                          className="sr-only"
                                          type="checkbox"
                                          name="recommend"
                                          onChange={() =>
                                            onOptionChange(
                                              option?.id,
                                              'counsellors',
                                            )
                                          }
                                        />
                                        <span
                                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedValues.includes(option?.id) ? 'border-primary' : 'border-body'}`}
                                        >
                                          <span
                                            className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedValues.includes(option?.id) ? 'flex' : 'hidden'}`}
                                          />
                                        </span>
                                        {option?.name}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                          {selectedValues.map((selected, i) => (
                            <span
                              key={i}
                              className="border p-1 px-2 rounded-full bg-black text-white flex items-center gap-1 "
                            >
                              {
                                counsellors?.find((s) => s?.id == selected)
                                  ?.name
                              }
                              <X
                                onClick={() => {
                                  setSelectedValues((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                  setSelectedEmails((pre) =>
                                    pre.filter((p) => p != selected),
                                  );
                                }}
                                className="cursor-pointer p-0.5 border bg-white text-black rounded-full w-4 h-4 "
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p
                        onClick={openModal}
                        className={`bg-graydark  cursor-pointer text-white  rounded ${isMobile ? 'w-32 p-1 text-md' : 'w-35 p-2'}`}
                      >
                        Select Templates
                      </p>
                    </div>

                    <div className="">
                      <label className="mb-2.5 block font-bold text-black dark:text-white">
                        Subject <span className="text-red">*</span>
                      </label>
                      <input
                        name="title"
                        value={formData?.title}
                        onChange={onChange}
                        placeholder="Type your subject"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="">
                      <label className="mb-2.5 block font-bold text-black dark:text-white">
                        Message Description <span className="text-red">*</span>
                      </label>
                      <textarea
                        rows={6}
                        name="description"
                        value={formData?.description}
                        onChange={onChange}
                        placeholder="Type your message"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      ></textarea>
                    </div>
                    <div className="flex">
                      <p
                        onClick={openPreviewModal}
                        className="flex-grow text-center bg-graydark hover:bg-opacity-90 disabled:bg-[#1C2434]/75 disabled:cursor-not-allowed p-3 font-medium text-gray rounded-l-lg mr-1"
                      >
                        Preview Message
                      </p>
                      <button
                        type="submit"
                        disabled={loading.submit}
                        className="flex-grow bg-graydark hover:bg-opacity-90 disabled:bg-[#1C2434]/75 disabled:cursor-not-allowed p-3 font-medium text-gray rounded-r-lg"
                      >
                        {loading.submit ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </div>
                  <PreviewModal
                    open={isPreviewModalOpen}
                    onClose={closePreviewModal}
                    formData={formData}
                  />
                </form>
              </div>
            </div>
          }
          <div className="h-[5vh]"></div>
          <LastMessages seeAll={seeAll} setSeeAll={setSeeAll} />
        </div>
        {isModalOpen && (
          <TemplateSelector
            open={isModalOpen}
            onClose={closeModal}
            onSelectTemplate={handleTemplateSelection}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default MessageBoard;
