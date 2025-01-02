import React, { useState, useEffect, useRef } from 'react';

const BulkUploadModal: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !modalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setModalOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setModalOpen(!modalOpen)}
        className="rounded-md bg-[#1C2434] px-9 py-2 font-medium text-white hover:bg-opacity-90 h-fit "
      >
        Labour Market
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          modalOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          ref={modal}
          onFocus={() => setModalOpen(true)}
          onBlur={() => setModalOpen(false)}
          className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:py-15"
        >
          <span className="mx-auto inline-block">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                opacity="0.1"
                width="60"
                height="60"
                rx="30"
                fill="#1E40AF"
              />
              <path
                d="M30 27.2498V29.9998V27.2498ZM30 35.4999H30.0134H30ZM20.6914 41H39.3086C41.3778 41 42.6704 38.7078 41.6358 36.8749L32.3272 20.3747C31.2926 18.5418 28.7074 18.5418 27.6728 20.3747L18.3642 36.8749C17.3296 38.7078 18.6222 41 20.6914 41Z"
                stroke="#1E40AF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 30H26V34H22V30ZM34 30H38V34H34V30ZM33.9999 20H26.0289L28 19H36L37.9711 20H33.9999Z"
                fill="#1E40AF"
              />
            </svg>
          </span>
          <h3 className="mt-5.5 pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
            Bulk Upload/API Connection
          </h3>
          <p className="mb-10">
            Contact support@adultedpro.com and we will help you setup a
            connection to upload jobs automatically. API/Bulk uploads require
            Basic Plan and above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
