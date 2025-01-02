import { useState } from 'react';
import { Modal } from '@mui/material';
import {
  updateChat,
  setCurrentChatSlice,
} from '../../../store/reducers/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useStateContext } from '../../../context/useStateContext';
import { updateUserApplication } from '../../../store/reducers/userApplicationsSlice';
import { RootState } from '../../../store/store';
import { UserApplicationStatus } from '../../../utils/enums';

interface Props {
  open: boolean;
  setOpen: any;
}

export const TakeOverDialogue = ({ open, setOpen }: Props) => {
  ////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { selectedChat, setSelectedChat } = useStateContext();
  const { userApplications } = useSelector(
    (state: RootState) => state.userApplication,
  );

  ////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////
  const [takeOverLoading, setTakeOverLoading] = useState(false);
  ////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////
  const onAccept = (e) => {
    e.preventDefault();
    const { otherUser } = selectedChat;
    setTakeOverLoading(true);

    dispatch<any>(
      updateChat({
        data: { shouldBotStopResponding: true },
        id: selectedChat.id,
      }),
    ).then(() => {
      setOpen(false);
      setTakeOverLoading(false);
      setSelectedChat({ ...selectedChat, shouldBotStopResponding: true });
      dispatch(setCurrentChatSlice({ ...selectedChat, otherUser }));
    });

    const selectedApplication = userApplications.filter(
      //@ts-expect-error:might give error because of application type
      (a) => a?.jobId == selectedChat?.job_id,
    )[0];
    dispatch<any>(
      updateUserApplication({
        id: selectedApplication?.id,
        data: {
          ...selectedApplication,
          status: UserApplicationStatus.Chatting,
        },
      }),
    );
  };

  const onCancel = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className="flex h-screen w-screen items-center justify-center"
    >
      <div className="w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15">
        <h3 className="mt-5.5 pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Activate Chat
        </h3>
        <p className="mb-10">
          This will stop the AdultEd Pro screening bot from responding to the
          candidate
        </p>
        <div className="flex w-full flex-wrap justify-center gap-4">
          <button
            onClick={onCancel}
            className="rounded border-black bg-gray px-4 py-2 font-bold text-black hover:bg-opacity-90"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={takeOverLoading}
            className="mr-2 rounded bg-black px-4 py-2 font-bold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-black/80"
          >
            Accept
          </button>
        </div>
      </div>
    </Modal>
  );
};
