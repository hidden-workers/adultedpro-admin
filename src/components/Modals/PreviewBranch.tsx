import { useEffect, useRef } from 'react';
import { Employer } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import { Info, MapPin, Type, X, BarChart2 } from 'lucide-react';
import { Tooltip, IconButton } from '@mui/material';

const PreviewBranch = ({ branch }: { branch: Employer }) => {
  /////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const { showBranchPreviewModal, setShowBranchPreviewModal } =
    useStateContext();
  const modal = useRef<any>(null);

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    // close if the esc key is pressed
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (showBranchPreviewModal && keyCode === 27) {
        setShowBranchPreviewModal(false);
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [showBranchPreviewModal]);
  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  return (
    <div>
      {showBranchPreviewModal && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
          <div
            ref={modal}
            className="max-h-[90vh] min-h-[90vh] w-full max-w-150 space-y-4 overflow-auto rounded-lg bg-[#F9FAFB]/95 px-6 py-4 text-center dark:bg-boxdark md:px-8 md:py-8"
            style={{ maxWidth: '1000px', width: '90vw' }}
          >
            <div className="flex w-full items-center justify-between rounded-md bg-[#F9FAFB] px-4 py-2 ">
              <div className="flex w-full items-center justify-start">
                <h4 className="text-2xl font-semibold text-black dark:text-white">
                  Preview Branch
                </h4>
              </div>
              <Tooltip title="View" placement="top">
                <IconButton onClick={() => setShowBranchPreviewModal(false)}>
                  <X />
                </IconButton>
              </Tooltip>
            </div>

            {/* Media, Company title and other detials */}
            <div className="flex flex-col gap-4 rounded-md bg-white shadow-lg  ">
              {/* media */}
              <div className="block h-[20rem] w-full ">
                {branch?.bannerImage ? (
                  <img
                    src={branch?.bannerImage}
                    alt="Cards"
                    className="h-full w-full rounded-md object-cover "
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-lg bg-gray-2 text-2xl font-semibold">
                    Banner Image
                  </span>
                )}
              </div>

              {/* logo, title and details */}
              <div className="flex w-full gap-4 px-6 pb-5 pt-2 ">
                {/* logo */}
                <img
                  src={branch?.photoUrl || branch?.logo}
                  alt="Cards"
                  className="h-12 w-12 rounded-full border object-cover "
                />
                {/* title and detail */}
                <div className="w-full space-y-2">
                  <h2 className="text-start text-2xl font-bold text-black ">
                    {branch?.name}
                  </h2>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex w-1/2 flex-col justify-center gap-2 ">
                      <Tooltip placement="top" title="Location">
                        <span className="flex items-center gap-2 ">
                          <MapPin className="h-4 w-4" />
                          {branch?.addressLine1}
                        </span>
                      </Tooltip>
                      <Tooltip placement="top" title="Company Type">
                        <span className="flex items-center gap-2 ">
                          <Type className="h-4 w-4" />
                          No company type
                        </span>
                      </Tooltip>
                    </div>
                    <div className="flex w-1/2 flex-col justify-center gap-2 ">
                      <Tooltip placement="top" title="Category">
                        <span className="flex items-center gap-2 ">
                          <Info className="h-4 w-4" />
                          Movies, TV, Music
                        </span>
                      </Tooltip>
                      <Tooltip placement="top" title="Company Size">
                        <span className="flex items-center gap-2 ">
                          <BarChart2 className="h-4 w-4" />
                          {branch?.companySize}
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company about and contact information*/}
            <div className="grid grid-cols-12 gap-4">
              {/* About */}
              <div className="col-span-12 space-y-2 rounded-md bg-white px-6 py-6 shadow-xl xl:col-span-8 ">
                <h3 className="text-start text-xl font-semibold text-black">
                  About {branch?.name}
                </h3>
                <p className="text-start">{branch?.description}</p>
              </div>
              {/* Contact */}
              <div className="col-span-12 space-y-2 rounded-md bg-white px-6 py-6 shadow-xl xl:col-span-4 ">
                <h3 className="text-start text-xl font-semibold text-black">
                  Contact Information
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 ">
                    <span className="text-start font-medium text-black ">
                      Email
                    </span>
                    <span className="text-start text-primary/80 ">
                      {branch?.contactEmail}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 ">
                    <span className="text-start font-medium text-black ">
                      Phone
                    </span>
                    <span className="text-start text-primary/80 ">
                      {branch?.contactNumber}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 ">
                    <span className="text-start font-medium text-black ">
                      Links
                    </span>
                    <div className="flex flex-col gap-1 ">
                      {branch?.socialMediaLinks?.map((link, index) => (
                        <span key={index} className="text-start">
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewBranch;
