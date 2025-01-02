import React, { useEffect, useState } from 'react';
import { Employer } from '../../interfaces';
import { X } from 'lucide-react';
import { Tooltip, IconButton, Modal } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Avatar from '../Avatars/Avatar';
import { extractDateTimeFromTimestamp } from '../../utils/functions';

const ViewEmployerModal = ({
  open,
  setOpen,
  selectedEmployer,
}: {
  open: boolean;
  setOpen: any;
  selectedEmployer: Employer;
}) => {
  /////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const { allEmployers } = useSelector((state: RootState) => state.employer);

  /////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////
  const [branches, setBranches] = useState([]);

  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    if (selectedEmployer) {
      setBranches(
        allEmployers.filter(
          (employer) => employer.email === selectedEmployer.email,
        ),
      );
    }
  }, [selectedEmployer, allEmployers]);
  /////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
  const onCloseModal = () => {
    setOpen(false);
  };

  /////////////////////////////////////////////////////// COMPONENTS ///////////////////////////////////////////////////
  const EmployerElement: React.FC<{
    title: string;
    value: string | number | undefined;
  }> = ({ title, value }) => {
    return (
      <div className="grid grid-cols-4 border-t border-x border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7">
        <p className="col-span-1 font-semibold text-start  ">{title}:</p>
        <p className="col-span-3 text-start  ">{value}</p>
      </div>
    );
  };

  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[1000px] md:px-8 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3 ">
          <div className="w-fit flex justify-start items-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2 ">
              View Employer
            </h4>
          </div>
          <div className="flex justify-end items-center gap-4.5 w-fit ">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={() => setOpen(false)}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="block w-full h-[16rem] rounded-lg overflow-hidden ">
          {selectedEmployer?.bannerImage ? (
            <img
              src={selectedEmployer?.bannerImage}
              alt="Banner Image"
              className="w-full h-full rounded-lg object-cover "
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-lg bg-gray-2 text-2xl font-semibold">
              Banner Image
            </span>
          )}
        </div>

        <div className="flex w-full gap-4 px-4 pb-5 pt-2 ">
          {/* logo */}
          <Avatar
            src={selectedEmployer?.photoUrl}
            initial={selectedEmployer?.name?.charAt(0)}
          />
          {/* title and detail */}
          <div className="w-full space-y-2">
            <div className="">
              <div className="flex flex-col items-start ">
                <h2 className="text-start text-xl font-bold text-black ">
                  {selectedEmployer?.name}{' '}
                </h2>
                <h3 className="tex-start text-base font-normal">
                  {selectedEmployer?.email}
                </h3>
              </div>
              <h4 className="text-md text-start font-medium text-black ">
                {selectedEmployer?.tagLine}
              </h4>
            </div>
            <p className="text-start">{selectedEmployer?.description}</p>
          </div>
        </div>

        <div className="flex flex-col bg-[#F9FAFB] dark:bg-meta-4 rounded-lg overflow-hidden">
          <EmployerElement
            title="Tagline"
            value={selectedEmployer?.tagLine || '-'}
          />
          <EmployerElement
            title="Address Line 1"
            value={selectedEmployer?.addressLine1 || '-'}
          />
          <EmployerElement
            title="Address Line 2"
            value={selectedEmployer?.addressLine2 || '-'}
          />
          <EmployerElement title="City" value={selectedEmployer?.city || '-'} />
          <EmployerElement
            title="State"
            value={selectedEmployer?.state || '-'}
          />
          <EmployerElement
            title="Contact Email"
            value={selectedEmployer?.contactEmail || '-'}
          />
          <EmployerElement
            title="Description"
            value={selectedEmployer?.description || '-'}
          />
        </div>

        <div className="mt-8 max-w-full space-y-4 overflow-x-auto ">
          <h4 className="text-start text-2xl text-black font-semibold ">
            Total Branches
          </h4>

          <div className="min-w-[1170px]">
            {/* table header start */}
            <div
              style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
              className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
            >
              <div className="col-span-2">
                <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                  Name
                </h5>
              </div>

              <div className="col-span-2">
                <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                  Branch Name
                </h5>
              </div>

              <div className="col-span-2">
                <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                  Location
                </h5>
              </div>

              <div className="col-span-2">
                <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                  Country
                </h5>
              </div>
              <div className="col-span-2">
                <h5 className="text-center font-bold text-[#3c50e0] dark:text-bodydark">
                  Date Created
                </h5>
              </div>
            </div>
            {/* table header end */}

            {/* table body start */}
            <div className="bg-white dark:bg-boxdark">
              {branches?.map((branch, index) => (
                <div
                  key={index}
                  style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
                  className="grid border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
                >
                  <div className="col-span-2">
                    <p className="text-center text-[#637381] dark:text-bodydark">
                      {branch?.name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center text-[#637381] dark:text-bodydark">
                      {branch?.branchLocation}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center text-[#637381] dark:text-bodydark">
                      {branch?.city} , {branch?.state}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center text-[#637381] dark:text-bodydark">
                      {branch?.country}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-center text-[#637381] dark:text-bodydark">
                      {extractDateTimeFromTimestamp(branch?.dateCreated)?.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* table body end */}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewEmployerModal;
