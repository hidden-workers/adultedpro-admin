import { useEffect, useRef, useState } from 'react';
import { useStateContext } from '../../context/useStateContext';
import { Job } from '../../interfaces';
import { useDispatch } from 'react-redux';
import { setJob } from '../../store/reducers/jobSlice';
import toast from 'react-hot-toast';
import { extractDateTimeFromTimestamp } from '../../utils/functions';

const RenewJob = ({ job, className }: { job: Job; className: string }) => {
  /////////////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////////////////
  const { showJobRenewModal, setShowJobRenewModal } = useStateContext();
  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);
  const dispatch = useDispatch();

  /////////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  const [expireDate, setExpireDate] = useState(job?.expireDate);

  /////////////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////////
  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !showJobRenewModal ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      // setShowJobRenewModal(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!showJobRenewModal || keyCode !== 27) return;
      setShowJobRenewModal(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  /////////////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////////
  const onSave = () => {
    if (new Date(expireDate) <= new Date())
      return alert('Expire Date must be in future.');
    const j = { ...job, expireDate: new Date(expireDate) };
    dispatch<any>(setJob(j)).then(() => {
      toast.success('Job renewed.');
      setExpireDate('');
      setShowJobRenewModal(false);
    });
  };

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setShowJobRenewModal(!showJobRenewModal)}
        className={`${className ? className : 'rounded-md bg-primary px-9 py-3 font-medium text-white hover:bg-opacity-90'} w-max`}
      >
        Renew
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          showJobRenewModal ? 'block' : 'hidden'
        }`}
      >
        <div
          ref={modal}
          onFocus={() => setShowJobRenewModal(true)}
          className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:py-15"
        >
          <h3 className="mt-5.5 pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
            Renew Job
          </h3>
          <p className="mb-10">
            Your job expired at{' '}
            {extractDateTimeFromTimestamp(job?.expireDate)?.date}. Please select
            any future date.
          </p>

          <div className="flex flex-col gap-2 mb-4 ">
            <label
              htmlFor="expireDate"
              className="text-start block text-lg font</label>-medium text-black dark:text-white"
            >
              Job Expire Date
            </label>
            <input
              type="date"
              name="expireDate"
              value={expireDate}
              onChange={(e) => setExpireDate(e.target.value)}
              placeholder="Job Expire Date"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <div className="-mx-3 flex flex-wrap gap-y-4">
            <div className="2xsm:w-1/2 w-full px-3">
              <button
                onClick={() => setShowJobRenewModal(false)}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
              >
                Cancel
              </button>
            </div>
            <div className="2xsm:w-1/2 w-full px-3">
              <button
                onClick={onSave}
                className="block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewJob;
