import { Event, User } from '../../interfaces';
import { maskEmail } from '../../utils/functions';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/reducers/userSlice';
import { setEvent } from '../../store/reducers/eventSlice';
import { useState } from 'react';
import CLoader from '../../common/CLoader';
import { EventStatus } from '../../utils/enums';
import { Check, X } from 'lucide-react';
import { IconButton, Tooltip } from '@mui/material';

const PendingItems = ({
  data,
  title,
  isLoading,
}: {
  data: User[] | Event[];
  title: string;
  isLoading?: boolean;
}) => {
  /////////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const dispatch = useDispatch();

  /////////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////////
  const [approving, setApproving] = useState('');

  /////////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onApprove = (item: Event | User) => {
    setApproving(item?.id);
    if ((item as Event)?.title) {
      // For event
      const newObj = {
        ...item,
        approvedByAdmin: true,
        status: EventStatus.Scheduled,
      };
      dispatch<any>(setEvent(newObj as Event)).then(({ payload: _ }) => {
        setApproving('');
      });
    } else {
      const newObj = { ...item, approvedByAdmin: true };
      dispatch<any>(setUser(newObj as User)).then(() => {
        setApproving('');
      });
    }
  };
  const onDecline = (item: Event | User) => {
    setApproving(item?.id);
    if ((item as Event)?.title) {
      const newObj = {
        ...item,
        rejectedByAdmin: true,
        status: EventStatus.Cancelled,
      };
      dispatch<any>(setEvent(newObj as Event)).then(({ payload: _ }) => {
        setApproving('');
      });
    } else {
      const newObj = { ...item, rejectedByAdmin: true };
      dispatch<any>(setUser(newObj as User)).then(() => {
        setApproving('');
      });
    }
  };

  return (
    <>
      <div className="min-h-[12rem] relative overflow-y-auto h-full rounded-sm border border-stroke bg-white px-3 pb-2.5 pt-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-5.5 xl:pb-1">
        <div className="mb-4 flex items-center justify-between ">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h4>
        </div>

        <div className="flex h-fit w-full flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center w-full h-full absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 ">
              <CLoader size="lg" />
            </div>
          ) : (
            data.length == 0 && (
              <div className="flex h-full w-full items-center justify-center py-16 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 ">
                <span className="text-center text-xl ">No {title}</span>
              </div>
            )
          )}
          {data?.slice(0, 6)?.map((item, index) => {
            return (
              <div
                className="flex w-full items-center justify-between space-y-1 py-3 px-3 rounded bg-gray-3 hover:bg-gray-2 dark:hover:bg-meta-4 "
                key={index}
              >
                <h5 className="font-medium text-black dark:text-white">
                  {item?.title
                    ? item?.title
                    : item?.name || maskEmail(item?.email)}
                </h5>
                <div className="flex gap-1">
                  {/* <button
                    onClick={() => onApprove(item)}
                    disabled={approving == item?.id}
                    className="w-max-content flex h-fit items-center justify-center rounded-md bg-graydark px-4 py-2.5 text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-primary/75"
                  >
                    {approving == item?.id ? 'Loading...' : 'Approve'}
                  </button> */}
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

export default PendingItems;
