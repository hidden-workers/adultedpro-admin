import { IconButton } from '@mui/material';
import { X } from 'lucide-react';
import React from 'react';
import { useStateContext } from '../../../context/useStateContext';

const EventPlanPopupForDashboard: React.FC = () => {
  const { setShowEventPlanModalForDashboard } = useStateContext();

  return (
    <div
      style={{ height: '100%', backdropFilter: 'blur(8px)' }}
      className="bg-blur absolute left-0 top-0 z-50 w-full bg-opacity-10 dark:bg-bodydark dark:bg-opacity-50"
    >
      <div
        style={{ height: 'calc(100vh - 4rem)' }}
        className="sticky top-0 h-full w-full"
      >
        <div className="absolute right-1/2 top-1/2 h-fit w-full max-w-142.5 -translate-y-1/2 translate-x-1/2 transform rounded-lg bg-white text-center dark:bg-boxdark">
          <div className="relative flex h-full w-full flex-col items-center justify-center px-8 py-12 md:py-15">
            <IconButton
              onClick={() => setShowEventPlanModalForDashboard(false)}
              style={{ position: 'absolute' }}
              className="absolute right-4 top-4"
            >
              <X />
            </IconButton>
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
              Coming Soon
            </h3>
            <p className="mb-10">
              {/* Upgrade to a paid plan to be able to quickly setup on and off campus events
                        via AdultEd Pro for your local Adult Education students. Have lunch, host a presentation or invite them on site, it's up to you! */}
              Here you can create and review upcoming events both on campus and
              off campus. This feature will be released soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPlanPopupForDashboard;
