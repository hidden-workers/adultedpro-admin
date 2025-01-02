import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchApplicantUserById } from '../../store/reducers/userSlice';
import { fetchAppliedJobsForApplicant } from '../../store/reducers/userApplicationsSlice';

const ApplicantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const userApplications = useSelector(
    (state: RootState) => state.userApplication.userApplicationsByStudentIds,
  );

  const [loading, setLoading] = useState(true);
  const { applicantUser } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    if (id) {
      (dispatch as AppDispatch)(fetchApplicantUserById(id))
        .then((action) => {
          if (action.payload) {
            return (dispatch as AppDispatch)(fetchAppliedJobsForApplicant(id));
          } else {
            throw new Error('User not found');
          }
        })
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, [id, dispatch]);
  if (loading) return <div className="text-center py-4">Loading...</div>;

  if (!applicantUser)
    return <div className="text-center py-4">User not found</div>;

  const userAppliedJobs = userApplications?.filter(
    (application) => application.applicantId === id,
  );
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
        <div className="bg-[#1C2434] p-4 rounded-t-lg">
          <h2 className="text-3xl font-semibold text-center text-white">
            Applicant Details
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-42 h-42 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mr-6">
              {applicantUser.photoUrl ? (
                <img
                  src={applicantUser?.photoUrl}
                  alt={applicantUser?.name}
                  className="object-cover"
                  style={{ width: '150px', height: '150px' }}
                />
              ) : (
                <span className="text-gray-500">No Photo</span>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {applicantUser.name}
              </h3>
              <p className="text-gray-600 mb-1">
                <strong>Email:</strong> {applicantUser?.email}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Phone:</strong> {applicantUser?.phone}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Bio:</strong> {applicantUser?.bio}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Country:</strong> {applicantUser?.country}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>State:</strong> {applicantUser?.state}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>City:</strong> {applicantUser?.city}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-lg">
          <div className="bg-gray-200 p-4">
            <h3 className="text-2xl font-semibold text-gray-800">
              Jobs Applied
            </h3>
          </div>
          <ul className="space-y-4">
            {userAppliedJobs.length > 0 ? (
              userAppliedJobs.map((application) => (
                <li
                  key={application?.id}
                  className="p-4 bg-white rounded-lg shadow-sm"
                >
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    Job Title: {application?.job?.title}
                  </p>
                  <p className="text-gray-600">Status: {application?.status}</p>
                </li>
              ))
            ) : (
              <p>No jobs applied.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailsPage;
