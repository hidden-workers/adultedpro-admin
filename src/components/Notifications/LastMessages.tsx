import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { Tooltip, IconButton } from '@mui/material';
import { Bell, Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { setMessage } from '../../store/reducers/messageSlice';
import { fetchStudentsOfInstitution } from '../../store/reducers/userSlice';
import ViewAnnouncement from '../Modals/ViewAnnouncements';

const LastMessages: React.FC<{
  seeAll: boolean;
  setSeeAll: (boolean) => void;
}> = ({ seeAll, setSeeAll }) => {
  //////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////////
  const { messages } = useSelector((state: RootState) => state.message);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { students } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mongoInstituteId = localStorage.getItem('mongoInstituteId');
  //////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////////
  const [extendedMessages, setExtendedMessages] = useState([]);
  //////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch<any>(
      fetchStudentsOfInstitution({
        instituteId: mongoInstituteId,
        limit: 1000,
        page: 1,
      }),
    );
  }, []);
  useEffect(() => {
    setExtendedMessages(
      messages.map((m) => ({
        ...m,
        toEmails: students
          ?.filter((u) => m?.toIds?.includes(u.id))
          ?.map((u) => u?.email),
      })),
    );
  }, [students, messages]);
  //////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////////
  const onSubmitReminder = (rowData: any) => {
    if (!rowData.toEmails || rowData.toEmails.length === 0) {
      toast.error('Email field cannot be empty.');
      return;
    }

    dispatch<any>(setMessage(rowData))
      .then(() => {
        toast.success('Reminder Sent successfully.');
      })
      .catch((error) => {
        toast.error('Something went wrong.');
        console.error(error);
      });
  };
  const handleViewAnnouncement = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between items-center border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 xl:px-7.5">
        <h3 className="font-medium text-black dark:text-white">
          {seeAll ? 'All' : 'Latest'} Announcements{' '}
          {seeAll && `(${messages.length})`}
        </h3>
        <span
          onClick={() => setSeeAll((pre) => !pre)}
          className="hover:underline text-primary cursor-pointer text-md "
        >
          {seeAll ? 'See Less' : 'See All'}
        </span>
      </div>

      <div className="p-4 sm:p-6 xl:p-10">
        <div className="overflow-hidden rounded-[10px]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1170px]">
              {/* table header start */}
              <div
                className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
                style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
              >
                <div className="col-span-1">
                  <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                    Title
                  </h5>
                </div>
                <div className="col-span-2">
                  <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                    Description
                  </h5>
                </div>
                <div className="col-span-2">
                  <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                    Emails
                  </h5>
                </div>
                <div className="col-span-1">
                  <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                    Type
                  </h5>
                </div>
                <div className="col-span-1">
                  <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                    Date Created
                  </h5>
                </div>
                <div className="col-span-1">
                  <h5 className="text-center font-bold text-[#1C2434] dark:text-bodydark">
                    Actions
                  </h5>
                </div>
              </div>
              {/* table header end */}

              {/* table body start */}
              <div className="bg-white dark:bg-boxdark">
                {messages.length == 0 && (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-body">No messages yet.</span>
                  </div>
                )}
                {(seeAll
                  ? extendedMessages
                  : extendedMessages?.slice(0, 5)
                )?.map((m, index) => (
                  <div
                    key={index}
                    className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                    style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
                  >
                    <div className="col-span-1">
                      <h4 className="text-center text-[#637381] dark:text-bodydark">
                        {m?.title}
                      </h4>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-center text-[#637381] ml-2 mr-2 dark:text-bodydark line-clamp-2">
                        {m?.description}
                      </h4>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-center text-[#637381] dark:text-bodydark line-clamp-2">
                        {m?.toEmails?.map(
                          (e, i) =>
                            `${e}${m?.toEmails?.length - 1 == i ? '' : ', '}`,
                        )}
                      </h4>
                    </div>
                    <div className="col-span-1">
                      <p className="text-center text-[#637381] dark:text-bodydark">
                        {m?.type == 'EmailAndNotification'
                          ? 'Email & Notification'
                          : m?.type}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <span className="flex justify-center text-[#637381] dark:text-bodydark">
                        {extractDateTimeFromTimestamp(m?.dateCreated)?.date}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <Tooltip title="Send Reminder" placement="top">
                        <IconButton onClick={() => onSubmitReminder(m)}>
                          <Bell className="text-gray-icon" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View" placement="top">
                        <IconButton onClick={() => handleViewAnnouncement(m)}>
                          <Eye className="text-gray-icon" />
                        </IconButton>
                      </Tooltip>
                      {/* <p> set reminder</p> */}
                    </div>
                  </div>
                ))}
              </div>
              {/* table body end */}
            </div>
          </div>
        </div>
      </div>
      {selectedAnnouncement && (
        <ViewAnnouncement
          open={isModalOpen}
          onClose={closeModal}
          announcement={selectedAnnouncement}
        />
      )}
    </div>
  );
};

export default LastMessages;
