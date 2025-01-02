import { X } from 'lucide-react';
import { Tooltip, IconButton, Modal } from '@mui/material';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState } from '../../store/store';
import { User, Program, UserApplication } from '../../interfaces';
import dayjs from 'dayjs';
import { parseDate } from '../../utils/datetime';

const StudentProfileModal = ({
  open,
  setOpen,
  selectedStudent,
  applicationData,
}: {
  open: boolean;
  setOpen: any;
  selectedStudent: User;
  applicationData?: UserApplication[];
}) => {
  /////////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////
  const { students: fetchedStudents } = useSelector(
    (state: RootState) => state.user,
  );

  /////////////////////////////////////////////////////// STATES ///////////////////////////////////////////////////
  const [student, setStudent] = useState<User | null>(null);
  const [tab, setTab] = useState<
    'Personal Details' | 'User Activity' | 'Resume'
  >('Personal Details');
  /////////////////////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////////
  useEffect(() => {
    setStudent(
      fetchedStudents?.find((s) => s.id === selectedStudent?.id) || null,
    );
  }, [fetchedStudents, selectedStudent]);
  /////////////////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
  const onCloseModal = () => {
    setOpen(false);
  };
  const formatDate = (dateInput: any) => {
    const parsedDate = parseDate(dateInput);
    return dayjs(parsedDate).format('MM-DD-YYYY');
  };

  const handleTabChange = (
    newTab: 'Personal Details' | 'User Activity' | 'Resume',
  ) => {
    setTab(newTab);
  };

  /////////////////////////////////////////////////////// RENDER ///////////////////////////////////////////////////
  if (!student) return null;

  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/70"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[700px] md:px-8 rounded-lg bg-white px-6 py-4  dark:bg-boxdark md:py-8 overflow-auto space-y-4">
        <div className="flex justify-between items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
          <div className="flex-grow flex justify-center items-center">
            <h4 className="text-2xl font-semibold text-black text-center dark:text-white">
              Student Profile
            </h4>
          </div>
          <div className="flex justify-end items-center gap-4.5">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={onCloseModal}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="bg-gray-100 rounded-md shadow-md mb-4">
          <div className="flex w-full">
            <button
              onClick={() => handleTabChange('Personal Details')}
              className={`flex-1 px-4 py-2 rounded-l-md border-b-2 ${tab === 'Personal Details' ? 'bg-graydark text-white border-graydark' : 'bg-gray-200 border-transparent'}`}
            >
              Personal Details
            </button>
            <button
              onClick={() => handleTabChange('Resume')}
              className={`flex-1 px-4 py-2  border-b-2 ${tab === 'Resume' ? 'bg-graydark text-white border-graydark' : 'bg-gray-200 border-transparent'}`}
            >
              Resume
            </button>
            <button
              onClick={() => handleTabChange('User Activity')}
              className={`flex-1 px-4 py-2 rounded-r-md border-b-2 ${tab === 'User Activity' ? 'bg-graydark text-white border-graydark' : 'bg-gray-200 border-transparent'}`}
            >
              User Activity
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {tab === 'Personal Details' && (
            <>
              {/* Section: Name */}
              <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-700">Name</h3>
                <p className="text-gray-600">{student?.name}</p>
              </div>

              {/* Section: Tagline */}
              {student?.tagLine && (
                <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-700">Tagline</h3>
                  <p className="text-gray-600">{student.tagLine}</p>
                </div>
              )}

              {/* Section: Program */}
              {student?.program && (
                <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-700">Program</h3>
                  <p className="text-gray-600">
                    {typeof student?.program === 'object' &&
                    student?.program !== null
                      ? (student?.program as Program).name
                      : String(student.program)}
                  </p>
                </div>
              )}

              {/* Section: Education */}
              {student?.aiProfile?.educationsList?.length > 0 && (
                <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-700">Education</h3>
                  <ul className="list-disc pl-6 text-gray-600">
                    {student?.aiProfile?.educationsList?.map(
                      (education, index) => (
                        <li key={index} className="py-2">
                          <h4 className="font-medium text-gray-700">
                            Education Level: {education?.educationLevelKey}
                          </h4>
                          {education.label && (
                            <p className="text-gray-600">
                              Label: {education?.label}
                            </p>
                          )}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              {/* Section: Interests and Traits */}
              {student?.aiProfile?.interestsList?.length > 0 && (
                <div>
                  <div className="border border-gray rounded-md p-2.5 mb-7 bg-gray-50">
                    {/* Interests Heading */}
                    <h3 className="font-bold text-lg text-gray-700">
                      Interests
                    </h3>
                    <ul className="list-disc pl-6 text-gray-600">
                      {student?.aiProfile?.interestsList?.map(
                        (interest, index) => (
                          <li key={index}>{interest.label}</li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                    {/* Traits Heading */}
                    {student?.aiProfile?.interestsList?.some(
                      (interest) => interest.traits,
                    ) && (
                      <>
                        <h3 className="font-bold text-lg text-gray-700 mt-1">
                          Traits
                        </h3>
                        <ul className="list-disc pl-6 text-gray-600">
                          {student?.aiProfile?.interestsList
                            .filter((interest) => interest.traits)
                            .map((interest, index) => (
                              <li key={index}>{interest.traits}</li>
                            ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Certificates */}
              {(student?.aiProfile?.certificatesList?.length > 0 ||
                student?.aiProfile?.doYouHaveDriverLicense ||
                student?.aiProfile?.doYouHaveLivescan ||
                student?.aiProfile?.isFirstAidCertified) && (
                <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-700">
                    Certificates
                  </h3>
                  <ul className="list-disc pl-6 text-gray-600">
                    {student?.aiProfile?.certificatesList?.length > 0 &&
                      student?.aiProfile?.certificatesList?.map(
                        (certificate, index) => (
                          <li key={index}>{certificate}</li>
                        ),
                      )}
                    {student?.aiProfile?.doYouHaveDriverLicense && (
                      <li>Driver License</li>
                    )}
                    {student?.aiProfile?.doYouHaveLivescan && <li>Livescan</li>}
                    {student?.aiProfile?.isFirstAidCertified && (
                      <li>First Aid Certified</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Section: Experience Notes */}
              {student?.aiProfile?.experienceNotes && (
                <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-700">
                    Experience Notes
                  </h3>
                  <p className="text-gray-600">
                    {student?.aiProfile?.experienceNotes}
                  </p>
                </div>
              )}

              {/* Section: Job Titles */}
              {applicationData?.length > 0 && (
                <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-700 mb-4">
                    Job Applications
                  </h3>
                  <ul className="space-y-2">
                    {applicationData?.map((application, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between border-b border-gray pb-2 mb-2"
                      >
                        {/* Job Title */}
                        <span className="text-gray-800 font-medium  pb-1">
                          {application.job?.title}
                        </span>

                        {/* Status */}
                        <span className="ml-4 inline-block px-3 py-1 text-sm font-medium rounded-full">
                          {application?.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {tab === 'User Activity' && (
            <>
              {/* Section: Date updated */}
              <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-700">
                  Last Account Update
                </h3>
                <p className="text-gray-600">
                  {formatDate(student?.dateUpdated)}
                </p>
              </div>

              {/* Section: Date updated */}
              <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-700">
                  Last Activity
                </h3>
                <p className="text-gray-600">
                  {student?.lastActivity
                    ? formatDate(student?.lastActivity)
                    : ''}
                </p>
              </div>
            </>
          )}

          {tab === 'Resume' && (
            <>
              {/* Section: Resumate */}
              <div className="border border-gray rounded-md p-2.5 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-700 mb-2">Resume</h3>
                {student?.pdfUrl ? (
                  <div>
                    <div className="w-full h-full overflow-hidden border rounded mb-2">
                      <iframe
                        src={student?.pdfUrl}
                        title="Resume Preview"
                        className="w-full h-full"
                        frameBorder="0"
                      ></iframe>
                    </div>

                    <button
                      onClick={() => {
                        if (
                          selectedStudent?.pdfUrl &&
                          selectedStudent.pdfUrl !== ''
                        ) {
                          window.open(selectedStudent.pdfUrl, '_blank');
                        } else {
                          alert('Resume not found');
                        }
                      }}
                      className="text-white bg-graydark px-4 py-2 rounded"
                    >
                      View and Download Resume
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">No resume provided</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StudentProfileModal;
