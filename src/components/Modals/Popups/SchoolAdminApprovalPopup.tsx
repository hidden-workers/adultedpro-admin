import { useStateContext } from '../../../context/useStateContext';

const AdminApprovalPopup = () => {
  ////////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////////////////
  const role = String(localStorage.getItem('Role'));
  const { isPartnerApproved } = useStateContext();

  ////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////////////////

  return (
    <>
      {!isPartnerApproved && (
        <div
          style={{ height: 'calc(100vh - 80px)' }}
          className="sticky top-[80px] z-9 right-0 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
        >
          <div
            style={{ height: 'calc(100vh - 4rem)' }}
            className="sticky top-0 h-full w-full"
          >
            <div className="absolute right-1/2 top-1/2 h-fit w-full max-w-142.5 -translate-y-1/2 translate-x-1/2 transform rounded-lg bg-white text-center dark:bg-boxdark">
              <div className="relative flex h-full w-full flex-col items-center justify-center px-8 py-12 md:py-15">
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
                  Need Approval
                </h3>
                <p className="mb-10">
                  {role == 'SchoolAdmin' ? (
                    <>
                      Please contact AdultEdPro Admin{' '}
                      <a
                        className="text-meta-5 hover:underline cursor-pointer"
                        href="mailto:rose@adultedpro.com"
                      >
                        here
                      </a>{' '}
                      to get access.
                    </>
                  ) : (
                    'You are not approved by the School Admin yet.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminApprovalPopup;
