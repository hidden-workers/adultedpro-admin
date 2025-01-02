import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchEmployerBranchesByEmail } from '../../store/reducers/employersSlice';
import { Employer } from '../../interfaces';
import { useStateContext } from '../../context/useStateContext';
import { CreateBranch } from '../Form/CreateBranch';
import CLoader from '../../common/Loader';
import { Copy, Eye, Pencil, Search } from 'lucide-react';
import { Tooltip, IconButton } from '@mui/material';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { UpdateMainBranchDetail } from '../Form/UpdateMainBranchDetails';
import PreviewBranch from '../../components/Modals/PreviewBranch';
import { useLocation } from 'react-router-dom';
import Avatar from '../../components/Avatars/Avatar';
import { Timestamp } from 'firebase/firestore';

const EmployerProfile = () => {
  //////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { showBranchForm, setShowBranchForm, setShowBranchPreviewModal } =
    useStateContext();
  const { branches: fetchedBranches, isLoading } = useSelector(
    (state: RootState) => state.employer,
  );
  const { user } = useSelector((state: RootState) => state.user);
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : user;

  //////////////////////////////////////////////////// STATES //////////////////////////////////////////////////////
  const [branches, setBranches] = useState<Employer[]>(fetchedBranches || []);
  const [mainBranch, setMainBranch] = useState<Employer>(fetchedBranches[0]);
  const initialEmployerData: Employer = {
    isTest: false,
    addressLine1: '',
    addressLine2: '',
    description: '',
    branchLocation: '',
    city: '',
    contactEmail: '',
    contactName: '',
    contactBio: '',
    contactNumber: '',
    country: '',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    email: authUser?.email || '',
    media: [],
    partnerId: '',
    requirements: '',
    state: '',
    tagLine: '',
    userId: '',
    zipCode: '',
    bio: '',
    isHeadquarter: branches?.length == 0, // if it is first branch of employer

    name: mainBranch?.name ?? '',
    bannerImage: mainBranch?.bannerImage ?? '',
    photoUrl: mainBranch?.photoUrl ?? '',
    mission: mainBranch?.mission ?? '',
    companySize: mainBranch?.companySize ?? '',
    cultureAndEnvironment: mainBranch?.cultureAndEnvironment ?? '',
    benefitsAndPerks: mainBranch?.benefitsAndPerks ?? '',
    awardsAndAccolades: mainBranch?.awardsAndAccolades ?? '',
    alumniLinks: mainBranch?.alumniLinks ?? [],
    socialMediaLinks: mainBranch?.socialMediaLinks ?? [],
    cultureMedia: mainBranch?.cultureMedia ?? [],
  };
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedBranch, setSelectedBranch] =
    useState<Employer>(initialEmployerData);
  //////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////
  useEffect(() => {
    if (fetchedBranches) {
      const mainBranch: Employer = fetchedBranches.filter(
        (b) => b?.isHeadquarter,
      )[0];
      if (!mainBranch && fetchedBranches.length > 0) {
        setMainBranch(fetchedBranches[0]);
      } else {
        setMainBranch(mainBranch);
      }
      setBranches(fetchedBranches);
    }
  }, [fetchedBranches, pathname]);
  useEffect(() => {
    dispatch<any>(fetchEmployerBranchesByEmail(initialEmployerData.email));
  }, []);
  //////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
  const onOpenUpdateForm = (branch: Employer) => {
    setSelectedBranch(branch);
    setShowBranchForm(true);
  };
  const onPreview = (branch: Employer) => {
    setSelectedBranch(branch);
    setShowBranchPreviewModal(true);
  };
  const onSearch = () => {
    const filtered = fetchedBranches.filter(
      (employer: Employer) =>
        employer?.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        employer?.branchLocation
          ?.toLowerCase()
          .includes(searchValue?.toLowerCase()) ||
        employer?.city?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        employer?.state?.toLowerCase().includes(searchValue?.toLowerCase()),
    );
    setBranches(searchValue?.trim().length == 0 ? fetchedBranches : filtered);
  };
  const handleSorting = (a: any, b: any) => {
    const getDate = (timestamp: any) => {
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
      } else if (timestamp && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
      } else {
        return new Date(timestamp); // Fallback for other formats
      }
    };

    const dateA = getDate(a.dateCreated);
    const dateB = getDate(b.dateCreated);

    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      console.error('Invalid date:', { a, b });
      return 0; // Keep original order if dates are invalid
    }

    return dateB.getTime() - dateA.getTime();
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <PreviewBranch branch={selectedBranch} />

        <Breadcrumb pageName="Employer" />

        <div className="flex flex-col gap-4">
          {showBranchForm && (
            <div className="w-f flex items-center justify-end">
              <button
                className="flex justify-center rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                onClick={() => setShowBranchForm(false)}
              >
                Show Branches
              </button>
            </div>
          )}

          {showBranchForm ? (
            <CreateBranch initialData={selectedBranch} branches={branches} />
          ) : (
            <div className="flex flex-col gap-4 overflow-hidden rounded-[10px] ">
              {branches.length == 0 && !isLoading ? (
                // If there's no branch
                <div className="mt-4 flex h-60 w-full flex-col items-center justify-center gap-2 rounded-md bg-white ">
                  <h3 className="text-title-md font-medium text-black dark:text-white">
                    No branches found
                  </h3>
                  <UpdateMainBranchDetail
                    initialData={mainBranch || branches[0]}
                  />
                </div>
              ) : (
                // Main Branch
                branches.length != 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-start gap-3">
                      <h3 className="text-title-md font-medium text-black dark:text-white">
                        Main Branch
                      </h3>
                      <UpdateMainBranchDetail
                        initialData={mainBranch || branches[0]}
                      />
                    </div>
                    <div className="space-y-2 ">
                      {/* Media, Company title and other details */}
                      <div className="flex flex-col gap-4 rounded-md bg-white py-4 shadow-lg ">
                        {/* banner image */}
                        <div className="block h-[20rem] w-full px-4 ">
                          {mainBranch?.bannerImage ? (
                            <img
                              src={mainBranch?.bannerImage}
                              alt="Cards"
                              className="h-full w-full rounded-lg object-cover "
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center rounded-lg bg-gray-2 text-2xl font-semibold">
                              Banner Image
                            </span>
                          )}
                        </div>

                        {/* logo, title and details */}
                        <div className="flex w-full gap-4 px-4 pb-5 pt-2 ">
                          {/* logo */}
                          <Avatar
                            src={mainBranch?.photoUrl || mainBranch?.logo}
                            initial={
                              mainBranch?.name?.charAt(0) ||
                              user?.name?.charAt(0)
                            }
                          />
                          {/* title and detail */}
                          <div className="w-full space-y-2">
                            <div className="">
                              <div className="flex items-center gap-2 ">
                                <h2 className="text-start text-2xl font-bold text-black ">
                                  {mainBranch?.name}
                                </h2>
                                <Tooltip placement="top" title="Company size">
                                  <span className="text-sm ">
                                    {mainBranch?.companySize
                                      ? `(${mainBranch?.companySize})`
                                      : ''}
                                  </span>
                                </Tooltip>
                              </div>
                              <h4 className="text-md text-start font-medium text-black ">
                                {mainBranch?.tagLine}
                              </h4>
                            </div>
                            <p className="text-start">
                              {mainBranch?.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Company about and contact information*/}
                      <div className="grid grid-cols-12 gap-4">
                        {/* About */}
                        <div className="col-span-12 space-y-2 rounded-md bg-white px-6 py-6 shadow-xl md:col-span-8 ">
                          <div className="">
                            <h3 className="text-start text-xl font-semibold text-black">
                              Mission
                            </h3>
                            <p className="text-start">{mainBranch?.mission}</p>
                          </div>
                          <div className="">
                            <h3 className="text-start text-xl font-semibold text-black">
                              Culture & Environment
                            </h3>
                            <p className="text-start">
                              {mainBranch?.cultureAndEnvironment}
                            </p>
                          </div>
                          <div className="">
                            <h3 className="text-start text-xl font-semibold text-black">
                              Benefits & Perks
                            </h3>
                            <p className="text-start">
                              {mainBranch?.benefitsAndPerks}
                            </p>
                          </div>
                          <div className="">
                            <h3 className="text-start text-xl font-semibold text-black">
                              Awards & Accolades
                            </h3>
                            <p className="text-start">
                              {mainBranch?.awardsAndAccolades}
                            </p>
                          </div>
                          {/* Culture Media */}
                          <div>
                            <h3 className="text-start text-xl font-semibold text-black">
                              Our Culture
                            </h3>
                            <div className="flex gap-4 overflow-x-auto">
                              {mainBranch?.cultureMedia &&
                              mainBranch?.cultureMedia?.length > 0 ? (
                                mainBranch?.cultureMedia?.map(
                                  (media, index) => (
                                    <div key={index} className="flex-shrink-0">
                                      <img
                                        src={media}
                                        alt={`Culture Media ${index + 1}`}
                                        className="w-[200px] h-[200px] object-cover rounded-md shadow-sm"
                                      />
                                    </div>
                                  ),
                                )
                              ) : (
                                <p>No culture media available</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Contact */}
                        <div className="col-span-12 space-y-2 rounded-md bg-white px-6 py-6 shadow-xl md:col-span-4 ">
                          <h3 className="text-start text-xl font-semibold text-black">
                            Contact Information
                          </h3>
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1 ">
                              <span className="text-start font-medium text-black ">
                                Email
                              </span>
                              <span className="text-start text-primary/80 ">
                                {mainBranch?.contactEmail}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 ">
                              <span className="text-start font-medium text-black ">
                                Phone
                              </span>
                              <span className="text-start text-primary/80 ">
                                {mainBranch?.contactNumber}
                              </span>
                            </div>
                            {mainBranch?.socialMediaLinks?.length > 0 && (
                              <div className="flex flex-col gap-1 ">
                                <span className="text-start font-medium text-black ">
                                  Social Links
                                </span>
                                <div className="flex flex-col gap-1 ">
                                  {mainBranch?.socialMediaLinks?.map(
                                    (link, index) => (
                                      <div
                                        className="group relative"
                                        key={index}
                                      >
                                        <input
                                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                          type="text"
                                          value={link}
                                          disabled={true}
                                          placeholder="Social Media Link"
                                        />
                                        <Tooltip placement="top" title="Copy">
                                          <button
                                            type="button"
                                            title="Copy"
                                            className="hover:text-red-icon absolute right-0 top-1/2 hidden h-full w-10 -translate-y-1/2 transform items-center  justify-center rounded-md bg-graydark/50 text-gray-icon group-hover:flex"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                link,
                                              );
                                            }}
                                          >
                                            <Copy />
                                          </button>
                                        </Tooltip>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                            {mainBranch?.alumniLinks?.length != 0 && (
                              <div className="flex flex-col gap-1 ">
                                <span className="text-start font-medium text-black ">
                                  Alumni Links
                                </span>
                                <div className="flex flex-col gap-1 ">
                                  {mainBranch?.alumniLinks?.map(
                                    (link, index) => (
                                      <div
                                        className="group relative"
                                        key={index}
                                      >
                                        <input
                                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                          type="text"
                                          value={link}
                                          disabled={true}
                                          placeholder="Social Media Link"
                                        />
                                        <Tooltip placement="top" title="Copy">
                                          <button
                                            type="button"
                                            title="Copy"
                                            className="hover:text-red-icon absolute right-0 top-1/2 hidden h-full w-10 -translate-y-1/2 transform items-center  justify-center rounded-md bg-graydark/50 text-gray-icon group-hover:flex"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                link,
                                              );
                                            }}
                                          >
                                            <Copy />
                                          </button>
                                        </Tooltip>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Branches Table */}
              <div className="space-y-4">
                <h3 className="text-title-md font-medium text-black dark:text-white ">
                  Branches
                </h3>
                <div
                  className={`flex ${
                    showBranchForm ? 'justify-end' : 'justify-between'
                  } items-center gap-2`}
                >
                  {!showBranchForm && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onSearch();
                      }}
                      className="w-1/2"
                    >
                      <div className="relative w-full rounded-md bg-[#F9FAFB] px-4 py-3 dark:bg-meta-4 ">
                        <button
                          type="button"
                          title="Search"
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                        >
                          <Search />
                        </button>
                        <input
                          type="text"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          onKeyUp={() => onSearch()}
                          placeholder="Type to search..."
                          className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
                        />
                      </div>
                    </form>
                  )}

                  <button
                    className="flex justify-center rounded bg-graydark px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                    onClick={() => {
                      setShowBranchForm(!showBranchForm);
                      setSelectedBranch(initialEmployerData);
                    }}
                  >
                    {!showBranchForm ? 'Add Branch' : 'Show Branches'}
                  </button>
                </div>

                <div className="mt-4 max-w-full space-y-4 overflow-x-auto ">
                  <div className="min-w-[1170px]">
                    {/* table header start */}
                    <div
                      style={{
                        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                      }}
                      className="grid bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7"
                    >
                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-black dark:text-bodydark">
                          Name
                        </h5>
                      </div>

                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-black dark:text-bodydark">
                          Branch Name
                        </h5>
                      </div>

                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-black dark:text-bodydark">
                          Location
                        </h5>
                      </div>

                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-black dark:text-bodydark">
                          Country
                        </h5>
                      </div>
                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-black dark:text-bodydark">
                          Date Created
                        </h5>
                      </div>
                      <div className="col-span-2">
                        <h5 className="text-center font-bold text-black dark:text-bodydark">
                          Actions
                        </h5>
                      </div>
                    </div>
                    {/* table header end */}

                    {/* table body start */}
                    <div className="bg-white dark:bg-boxdark">
                      {isLoading ? (
                        <CLoader />
                      ) : (
                        branches
                          ?.slice() // Create a copy of the array to avoid mutating the original
                          .sort(handleSorting)
                          .map((branch, index) => (
                            <div
                              key={index}
                              style={{
                                gridTemplateColumns:
                                  'repeat(12, minmax(0, 1fr))',
                              }}
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
                                  {
                                    extractDateTimeFromTimestamp(
                                      branch?.dateCreated,
                                    )?.date
                                  }
                                </p>
                              </div>
                              <div className="col-span-2">
                                <div className="flex items-center justify-center">
                                  <Tooltip title="Edit" placement="top">
                                    <IconButton
                                      onClick={() => onOpenUpdateForm(branch)}
                                    >
                                      <Pencil className="text-gray-icon" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Preview" placement="top">
                                    <IconButton
                                      onClick={() => onPreview(branch)}
                                    >
                                      <Eye className="text-gray-icon" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                    {/* table body end */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EmployerProfile;
