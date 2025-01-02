export const BASE = 'api end point';

export const loginUserByMailUrl = () => {
  return encodeURI(`/auth/login`);
};

export const signUplUrl = () => {
  return encodeURI(`/auth/register`);
};
export const getProgramsUrl = (approved: boolean) => {
  return encodeURI(`/institute/get-programs?approved=${approved}`);
};

export const getJobsByEmployerId = (
  userId: string,
  includeJobApplications: boolean,
  limit: number,
) => {
  return encodeURI(
    `/job/getByUserId?id=${userId}&includeJobApplications=${includeJobApplications}&limit=${limit}`,
  );
};
export const getJobsByEmployerEmail = (email: string) => {
  return encodeURI(`/job/getByEmployerEmail?email=${email}`);
};
export const getAllJobs = (
  limit: number,
  page: number,
  includeJobApplications: boolean,
) => {
  return encodeURI(
    `/job/getAll?limit=${limit}&page=${page}&includeJobApplications=${includeJobApplications}`,
  );
};

export const getJobUrl = (jobId: string) => {
  return encodeURI(`/job/get?id=${jobId}`);
};
export const getApplicationsUrl = () => {
  return encodeURI(`/job/getApplications`);
};

export const updateApplicationUrl = (applicationId: string) => {
  return encodeURI(`/job/update-application?id=${applicationId}`);
};
export const getApplicationsByEmployerEmail = (
  email: string,
  limit: number,
) => {
  return encodeURI(
    `/employer/applications-by-employer-email?employerEmail=${email}&limit=${limit}`,
  );
};
export const createJobUrl = () => {
  return encodeURI(`/job/create`);
};

export const updateJobUrl = (userId: string) => {
  return encodeURI(`/job/update?id=${userId}`);
};

export const getUsersUrl = (limit?: number) => {
  const params = new URLSearchParams();

  if (limit !== undefined) {
    params.append('limit', limit.toString());
  }

  return `/user/get-users?${params.toString()}`;
};

export const getUserEmployersUrl = (
  page: number,
  limit: number,
  role: string,
) => {
  return encodeURI(
    `/institute/users-by-role?page=${page}&limit=${limit}&role=${role}`,
  );
};
export const createUserUrl = () => {
  return encodeURI(`/user/create-student`);
};

export const getUserByIdUrl = (userId: string) => {
  return encodeURI(`/user/get-user?id=${userId}`);
};

export const getUsersByInstituteIdUrl = (
  instituteId: string,
  limit: number,
  page: number,
  search?: string,
) => {
  let url = `/user/getusersbyinstituteid?id=${instituteId}&limit=${limit}&page=${page}`;
  if (search) {
    url += `&search=${search}`;
  }
  return encodeURI(url);
};

export const getUsersByProgramIdUrl = (
  programId: string,
  limit: number,
  page: number,
) => {
  return encodeURI(
    `/user/getusersbyprogramid?id=${programId}&limit=${limit}&page=${page}`,
  );
};

export const getInstituteUsersByProgramId = (
  programId: string,
  instituteId: string,
  limit: number,
) => {
  return encodeURI(
    `/institute/get-institute-users-by-programId?programId=${programId}&instituteId=${instituteId}&limit=${limit}`,
  );
};

export const getInstituteTeacherUrl = (
  instituteId: string,
  limit?: number,
  page?: number,
  search?: string,
) => {
  const queryParams = [
    `instituteId=${instituteId}`,
    limit !== undefined ? `limit=${limit}` : '',
    page !== undefined ? `page=${page}` : '',
    search ? `search=${encodeURIComponent(search)}` : '',
  ]
    .filter(Boolean)
    .join('&');

  return `/institute/institue-teachers?${queryParams}`;
};

export const linkProgramWithInstituteUrl = (instituteId: string) => {
  return encodeURI(`/institute/update-institute?id=${instituteId}`);
};

export const deleteUserUrl = (userId: string) => {
  return encodeURI(`/user/delete-user?id=${userId}`);
};

export const getDashboardCountUrl = (id: string, userId: string) => {
  return encodeURI(`/institute/getDashboardCounts?id=${id}&userId=${userId}`);
};

export const getEmployerDashboardCountsUrl = (id: string) => {
  return encodeURI(`/employer/getEmployerDashboardCounts?id=${id}`);
};

export const getEmployerByCompanyAndBranchUrl = (
  name: string,
  branchLocation: string,
) => {
  return encodeURI(
    `/employer/getEmployerByCompanyAndBranch?name=${name}&branchLocation=${branchLocation}`,
  );
};

export const getEmployerMainBranchUrl = (name: string) => {
  return encodeURI(`/employer/getEmployerMainBranch?name=${name}`);
};
export const createEventUrl = () => {
  return encodeURI(`/event/create`);
};

export const updateEventUrl = (id: string) => {
  return encodeURI(`/event/update?id=${id}`);
};

export const getEventByOrganizerUrl = (
  organizerType: string,
  organizerId: string,
  page?: string,
  limit?: string,
  startDate?: string,
  endDate?: string,
  search?: string,
) => {
  let url = `/event/getByOrganizer?organizerType=${organizerType}&organizerId=${organizerId}`;

  if (page) url += `&page=${page}`;
  if (limit) url += `&limit=${limit}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  return encodeURI(url);
};

export const getEventByParticipantUrl = (
  participantType: string,
  participantId: string,
) => {
  return encodeURI(
    `/event/getByParticipant?participantType=${participantType}&participantId=${participantId}`,
  );
};

export const getRequestedEventsByPartnerIdUrl = (
  instituteId: string,
  page: number,
  limit: number,
) => {
  return encodeURI(
    `/event/requested-events?instituteId=${instituteId}&page=${page}&limit=${limit}`,
  );
};

export const getEventParticipantsUrl = (
  eventId: string,
  page: number,
  limit: number,
) => {
  return encodeURI(
    `/event/event-participants?id=${eventId}&page=${page}&limit=${limit}`,
  );
};

export const addEventParticipantsUrl = () => {
  return encodeURI(`/event/addParticipant`);
};

export const getJoinedEventsByEmployerUrl = (
  employerId: string,
  page: number,
  limit: number,
) => {
  return encodeURI(
    `/event/joined-events-by-employer?employerId=${employerId}&limit=${limit}&page=${page}`,
  );
};

export const getAllEventsUrl = (limit:number) => {
  return encodeURI(`/event/getAll?limit=${limit}`);
};

export const getInstituteEmployersUrl = () => {
  return encodeURI(`/institute/institute-employers`);
};

export const getAllTodosUrl = () => {
  return encodeURI(`/todo/todos`);
};

export const getTodoForUserUrl = () => {
  return encodeURI(`/todo/todos-by-userid`);
};

export const removeSingleTodoUrl = (id: string) => {
  return encodeURI(`/todo/todos?id=${id}`);
};

export const updateSingleTodoUrl = (id: string) => {
  return encodeURI(`/todo/todos?id=${id}`);
};

export const createTodoUrl = () => {
  return encodeURI(`/todo/todos`);
};

export const getEmployersUrl = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return encodeURI(
    `/institute/institute-employers?limit=${limit}&page=${page}`,
  );
};
export const registerEmployerUrl = () => {
  return encodeURI(`/employer/branch/create`);
};

export const getEmployerBranchesUrl = ({
  page,
  limit,
  employerEmail,
}: {
  page: number;
  limit: number;
  employerEmail: string;
}) => {
  return encodeURI(
    `/employer/employer-branches?limit=${limit}&page=${page}&email=${employerEmail}`,
  );
};
export const getEmployerUrl = (userId: string) => {
  return encodeURI(`/employer/getbranch?id=${userId}`);
};

export const updateEmployerUrl = (userId: string) => {
  return encodeURI(`/employer/update?id=${userId}`);
};

export const getBranchByUserIdUrl = (userId: string) => {
  return encodeURI(`/employer/getbranch-userId?id=${userId}`);
};
export const updateUserUrl = (id: string) => {
  return encodeURI(`/user/update-user?id=${id}`);
};
export const updateCandidateUserUrl = (id: string) => {
  return encodeURI(`/user/update-candidate-user?id=${id}`);
};
export const getInstituteUrl = (id: string) => {
  return encodeURI(`/institute/get-institute?id=${id}`);
};

export const updateInstituteUrl = (id: string) => {
  return encodeURI(`/institute/update-institute?id=${id}`);
};

export const getInstitueAnnouncementsUrl = (id: string) => {
  return encodeURI(`/announcement/announcements?institute_id=${id}`);
};

export const createAnnouncementUrl = () => {
  return encodeURI(`/announcement/announcement`);
};

export const getInstitutesUrl = ({
  approved,
  page,
  limit,
}: {
  approved: boolean;
  page: number;
  limit: number;
}) => {
  return encodeURI(
    `/institute/get-institutes?approved=${approved}&limit=${limit}&page=${page}`,
  );
};

export const getUserChatsUrl = (limit: number) => {
  return encodeURI(`/chats/user-chats?limit=${limit}`);
};

export const getStudentEmployerUrl = (
  studentId: string,
  jobId: string,
  limit: number,
  page: number,
) => {
  return encodeURI(
    `/chats/student-employer-chat?id=${studentId}&jobId=${jobId}&limit=${limit}&page=${page}`,
  );
};
export const getMultipleUsersChatsUrl = (limit: number) => {
  return encodeURI(`/chats/users-chats?limit=${limit}`);
};

export const createChatUrl = () => {
  return encodeURI(`/chats/create-chat`);
};

export const findChatMessagesUrl = (chatId: string) => {
  return encodeURI(`/messages/chat-messages?chatId=${chatId}`);
};

export const sendMessagesUrl = (chatId: string) => {
  return encodeURI(`/messages/send-message?chatId=${chatId}`);
};

export const getProgramsWithStudentsUrl = (
  instituteId: string,
  limit: number,
  page: number,
) => {
  return encodeURI(
    `/institute/get-programs-with-students?id=${instituteId}&limit=${limit}&page=${page}`,
  );
};

export const getInstituteUserApplicationsUrl = (
  instituteId: string,
  limit: number,
  page: number,
) => {
  return encodeURI(
    `/institute/get-institute-jobApplications?id=${instituteId}&limit=${limit}&page=${page}`,
  );
};

export const getApplicantUrl = (id: string) => {
  return encodeURI(`/common/user-by-id?id=${id}`);
};

export const getApplicantAppliedJobsUrl = (
  applicantId: string,
  limit: number,
  page: number,
) => {
  return encodeURI(
    `/job/applicant-applied-jobs?id=${applicantId}&limit=${limit}&page=${page}`,
  );
};

export const updateChatUrl = (id: string) => {
  return encodeURI(`/chats/update-chat?id=${id}`);
};

export const getPusherAuthorizationUrl = () => {
  return encodeURI(`/common/pusher-auth`);
};


