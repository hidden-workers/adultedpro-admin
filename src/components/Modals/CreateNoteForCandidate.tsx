import { Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { User, UserApplication } from '../../interfaces';
import { updateMongoCandidate } from '../../store/reducers/userSlice';
import { useStateContext } from '../../context/useStateContext';
import { setUserApplication } from '../../store/reducers/userApplicationsSlice';

interface Props {
  open: boolean;
  setOpen: any;
  item: UserApplication | User;
  type: 'UserApplication' | 'Student';
  note: string;
  setNote: any;
  employerId: string;
}

const CreateNoteForCandidate: React.FC<Props> = ({
  open,
  setOpen,
  item,
  type,
  note: inputNote,
  setNote: setInputNote,
  employerId,
}) => {
  ///////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { setSelectedStudent, setSelectedUserApplication } = useStateContext();

  ///////////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////////
  const [note, setNote] = useState(inputNote);
  const [loading, setLoading] = useState(false);

  ///////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  useEffect(() => {
    setNote(inputNote);
  }, [inputNote]);
  ///////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const onSubmit = () => {
    const noteObj = {
      employerId: employerId,
      note: note,
      dateCreated: new Date(),
    };

    const isNoteExist = item?.employerNotes?.some(
      (note) => note.note == inputNote,
    );

    const udpatedItem = {
      ...item,
      employerNotes: isNoteExist
        ? (item?.employerNotes || []).map(
            (n) => (n = n.note == inputNote ? noteObj : n),
          )
        : [...(item?.employerNotes || []), noteObj],
    };
    setLoading(true);
    if (type == 'Student') {
      dispatch<any>(
        updateMongoCandidate({ userId: udpatedItem.id, userData: udpatedItem }),
      ).then(() => {
        setSelectedStudent(udpatedItem);
        setLoading(false);
        onClose();
      });
    } else {
      dispatch<any>(setUserApplication(udpatedItem as UserApplication)).then(
        () => {
          setSelectedUserApplication(udpatedItem);
          setLoading(false);
          onClose();
        },
      );
    }
  };
  const onClose = () => {
    setInputNote('');
    setNote('');
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5`}
    >
      <div className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:py-15">
        <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
          Add Note
        </h3>
        <p className="mb-10">
          This note will not be shown to candidate, its personal to you.
        </p>

        <div className="flex flex-col items-start mb-6 ">
          <label
            htmlFor="note"
            className="mb-1 block text-lg font-medium text-black dark:text-white"
          >
            Note
          </label>
          <input
            type="text"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Your note here..."
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="-mx-3 flex flex-wrap gap-y-4">
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading}
              onClick={onClose}
              className="block w-full rounded border border-stroke bg-gray disabled:cursor-not-allowed p-3 text-center font-medium text-black transition dark:border-strokedark dark:bg-meta-4 "
            >
              Cancel
            </button>
          </div>
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              disabled={loading}
              onClick={onSubmit}
              className="block w-full rounded border border-black bg-black hover:bg-black/90 disabled:bg-black/90 disabled:cursor-not-allowed p-3 text-center font-medium text-white transition "
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateNoteForCandidate;
