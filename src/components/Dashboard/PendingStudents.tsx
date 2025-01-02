import { Event, LocalStorageAuthUser, User } from '../../interfaces';
import { maskEmail } from '../../utils/functions';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStudentsOfInstitution,
  setUser,
} from '../../store/reducers/userSlice';
import { useEffect, useState } from 'react';
import CLoader from '../../common/CLoader';
import { RootState } from '../../store/store';
import { addStudentToUnassignedClass } from '../../store/reducers/classSlice';
import { Check, X } from 'lucide-react';
import { IconButton, Tooltip } from '@mui/material';

const PendingStudents = () => {
  /////////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { students: fetchedStudents } = useSelector(
    (state: RootState) => state.user,
  );
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;

  /////////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////////
  const [approving, setApproving] = useState('');

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<User[]>([]);

  /////////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////
  useEffect(() => {
    if (fetchedStudents.length > 0) return;
    setLoading(true);
    dispatch<any>(fetchStudentsOfInstitution(authUser?.partnerId)).finally(() =>
      setLoading(false),
    );
  }, []);

  useEffect(() => {
    const pendingStudents = fetchedStudents.filter(
      (student) => !student.approvedByAdmin && student.rejectedByAdmin !== true,
    );
    setStudents(pendingStudents);
  }, [fetchedStudents]);

  /////////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onApprove = (item: Event | User) => {
    const newObj = { ...item, approvedByAdmin: true };
    setApproving(item?.id);

    dispatch<any>(setUser(newObj as User))
      .then(() => {
        dispatch<any>(addStudentToUnassignedClass(newObj as User))
          .then(() => {
            setApproving('');
            // Remove the approved student from the local state
            setStudents((prevStudents) =>
              prevStudents.filter((student) => student.id !== item.id),
            );
          })
          .catch((error) => {
            console.error('Error adding student to Unassigned class: ', error);
          });
      })
      .catch((error) => {
        console.error('Error approving student: ', error);
      });
  };
  const onDecline = (item: Event | User) => {
    setApproving(item?.id);

    const declinedUser = {
      ...item,
      approvedByAdmin: false,
      rejectedByAdmin: true,
    };

    dispatch<any>(setUser(declinedUser as User))
      .then(() => {
        setApproving('');
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== item.id),
        );
      })
      .catch((error) => {
        console.error('Error declining student: ', error);
      });
  };

  return (
    <>
      <div className="min-h-[12rem] relative overflow-y-auto h-full rounded-sm border border-stroke bg-white px-3 pb-2.5 pt-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-5.5 xl:pb-1">
        <div className="mb-4 flex items-center justify-between ">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Pending Students
          </h4>
        </div>

        <div className="flex h-fit w-full flex-col gap-4">
          {loading ? (
            <div className="flex justify-center items-center w-full h-full absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 ">
              <CLoader size="lg" />
            </div>
          ) : (
            students.length == 0 && (
              <div className="flex h-full w-full items-center justify-center py-16 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 ">
                <span className="text-center text-xl ">
                  No Pending Students
                </span>
              </div>
            )
          )}
          {students?.map((item, index) => {
            return (
              <div
                className="flex w-full items-center justify-between space-y-1 py-3 px-3 rounded bg-gray-3 hover:bg-gray-2 dark:hover:bg-meta-4 "
                key={index}
              >
                <h5 className="font-medium text-black dark:text-white">
                  {item?.name || maskEmail(item?.email)}
                </h5>
                <div className="flex gap-1">
                  <Tooltip title="Approve" placement="top">
                    <IconButton type="button" onClick={() => onApprove(item)}>
                      <Check size={20} style={{ color: 'green' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Decline" placement="top">
                    <IconButton type="button" onClick={() => onDecline(item)}>
                      <X size={20} style={{ color: 'red' }} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PendingStudents;
