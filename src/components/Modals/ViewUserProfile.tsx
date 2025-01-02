import { X } from 'lucide-react';
import { Tooltip, IconButton } from '@mui/material';
import Avatar from '../Avatars/Avatar';
import { Program } from '../../interfaces';

const ViewUserProfile = ({
  showViewProfileModal,
  selectedChat,
  setShowViewProfileModal,
}: {
  showViewProfileModal: any;
  selectedChat: any;
  setShowViewProfileModal: any;
}) => {
  return (
    <div>
      {showViewProfileModal && (
        <div className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
          <div
            className="max-h-[90vh] min-h-[90vh] md:px-8 w-full max-w-150 rounded-lg bg-white px-6 py-4 text-center dark:bg-boxdark md:py-8 overflow-auto space-y-4"
            style={{ maxWidth: '1000px', width: '90vw' }}
          >
            <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-2 ">
              <div className="w-full flex justify-start items-center gap-4">
                <h4 className="text-2xl font-semibold text-black dark:text-white">
                  View Profile
                </h4>
              </div>
              <Tooltip title="View" placement="top">
                <IconButton onClick={() => setShowViewProfileModal(false)}>
                  <X />
                </IconButton>
              </Tooltip>
            </div>

            <div className="flex flex-col bg-[#F9FAFB] dark:bg-meta-4 rounded-lg overflow-hidden">
              <div className="mb-8 grid grid-cols-5 gap-8">
                <div className="col-span-5 xl:col-span-3">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Personal Details
                      </h3>
                    </div>
                    <div className="p-7">
                      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/2">
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white text-left"
                            htmlFor="name"
                          >
                            Full Name
                          </label>
                          <div className="relative">
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="text"
                              contentEditable={false}
                              name="name"
                              disabled={true}
                              value={selectedChat?.otherUser?.name}
                              onChange={() => {}}
                              id="name"
                            />
                          </div>
                        </div>

                        {selectedChat?.otherUser?.program && (
                          <div className="w-full sm:w-1/2">
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white text-left"
                              htmlFor="program"
                            >
                              Program
                            </label>
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="text"
                              name="program"
                              disabled={true}
                              value={
                                typeof selectedChat?.otherUser?.program ===
                                  'object' &&
                                selectedChat?.otherUser?.program !== null
                                  ? (
                                      selectedChat?.otherUser
                                        ?.program as Program
                                    ).name
                                  : String(selectedChat?.otherUser.program)
                              }
                              contentEditable={false}
                              onChange={() => {}}
                              id="program"
                            />
                          </div>
                        )}
                      </div>

                      {selectedChat?.otherUser?.city && (
                        <div className="mb-5.5">
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white text-left"
                            htmlFor="city"
                          >
                            City
                          </label>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="city"
                            disabled={true}
                            value={selectedChat?.otherUser?.city}
                            contentEditable={false}
                            onChange={() => {}}
                            id="city"
                          />
                        </div>
                      )}
                      {selectedChat?.otherUser?.state && (
                        <div className="mb-5.5">
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white text-left"
                            htmlFor="state"
                          >
                            State
                          </label>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="state"
                            disabled={true}
                            value={selectedChat?.otherUser?.state}
                            contentEditable={false}
                            onChange={() => {}}
                            id="state"
                          />
                        </div>
                      )}

                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white text-left"
                          htmlFor="tagLine"
                        >
                          TagLine
                        </label>
                        <textarea
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="tagLine"
                          id="tagLine"
                          value={selectedChat?.otherUser?.tagLine}
                          onChange={() => {}}
                          disabled={true}
                          contentEditable={false}
                          rows={3}
                        ></textarea>
                      </div>

                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white text-left"
                          htmlFor="bio"
                        >
                          Brief Description about yourself
                        </label>
                        <div className="relative">
                          <textarea
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            name="bio"
                            id="bio"
                            value={selectedChat?.otherUser?.bio}
                            onChange={() => {}}
                            disabled={true}
                            contentEditable={false}
                            rows={6}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-5 xl:col-span-2">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Profile Photo
                      </h3>
                    </div>
                    <div className="p-7">
                      <div className="mb-4 flex items-center justify-center gap-3">
                        <div className="h-48 w-64 rounded-full">
                          <Avatar
                            src={
                              !selectedChat?.isGroup &&
                              selectedChat?.otherUser?.photoUrl
                            }
                            initial={
                              selectedChat?.groupName?.charAt(0) ||
                              selectedChat?.otherUser?.name?.charAt(0)
                            }
                            size="xl"
                          />
                        </div>
                      </div>
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

export default ViewUserProfile;
