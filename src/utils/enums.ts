export enum UserRolesEnum {
  Student = 'Student',
  Partner = 'Partner',
  Teacher = 'Teacher',
  SchoolAdmin = 'Admin',
  Counsellor = 'Counsellor',
  Employer = 'Employer',
  SuperAdmin = 'SuperAdmin',
}
export enum UserApplicationStatus {
  All = 'all',
  Applied = 'approved',
  JobOffered = 'job Offered',
  Bookmarked = 'bookmarked',
  Inactive = 'inactive',
  Skipped = 'skipped',
  Disqualified = 'disqualified',

  Chatting = 'chatting',
  Interviewing = 'interviewing',
  Hired = 'hired',
  Rejected = 'rejected',
}

export enum BoardMessageType {
  Email = 'Email',
  Notification = 'Notification',
  EmailAndNotification = 'EmailAndNotification',
}

export enum BoardMessageTo {
  Teachers = 'Teachers',
  Counsellors = 'Counsellors',
  AllStudents = 'AllStudents',
  Students = 'Students',
  AllPrograms = 'AllPrograms',
  Programs = 'Programs',
  Admin = 'Admin',
}

export enum EventStatus {
  Requested = 'Requested',
  Scheduled = 'Scheduled',
  Reschedule = 'Reschedule',
  Cancelled = 'Cancelled',
}

export enum EventTypes {
  OffCampus = 'OffCampus',
  OnCampus = 'OnCampus',
}

export enum ChatTypes {
  IS_STUDENT_CHAT = 'IS_STUDENT_CHAT',
  IS_JOB_APPLICATION_CHAT = 'IS_JOB_APPLICATION_CHAT',
  OneToOne = '1:1',
  Class = 'class', //pause
  Group = 'group', //pause
  Employer = 'employer',
}
