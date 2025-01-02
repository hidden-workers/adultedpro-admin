import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Employer, SelectedChat, User, UserApplication } from '../interfaces';
import { ENVIRONMENT } from '../constants';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface StateContextType {
  page: 'Employer' | 'Institution';
  setPage: any;
  mainBranch: Employer;
  setMainBranch: any;
  isPartnerApproved: boolean;
  setIsPartnerApproved: any;
  selectedCandidatesFilter: string;
  setSelectedCandidatesFilter: (string) => void;
  selectedChat: SelectedChat;
  setSelectedChat: (SelectedChat) => void;
  selectedUserApplication: UserApplication;
  setSelectedUserApplication: (UserApplication) => void;
  selectedStudent: User & { status: string };
  setSelectedStudent: (User) => void;
  showJobForm: boolean;
  setShowJobForm: (boolean) => void;
  showEventPlanModalForDashboard: boolean;
  setShowEventPlanModalForDashboard: (boolean) => void;
  showJobViewModal: boolean;
  setShowJobViewModal: (boolean) => void;
  showJobRenewModal: boolean;
  setShowJobRenewModal: (boolean) => void;
  showEventFormModal: boolean;
  setShowEventFormModal: (boolean) => void;
  showEventViewModal: boolean;
  setShowEventViewModal: (boolean) => void;
  showEventPlanModal: boolean;
  setShowEventPlanModal: (boolean) => void;
  showUpdateMainBranch: boolean;
  setShowUpdateMainBranch: (boolean) => void;
  authRole: string;
  setAuthRole: (string) => void;
  showBranchForm: boolean;
  setShowBranchForm: (boolean) => void;
  showBranchPreviewModal: boolean;
  setShowBranchPreviewModal: (boolean) => void;
  chatMessageInput: string;
  setChatMessageInput: (string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  //
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const { branches } = useSelector((state: RootState) => state.employer);
  const initialMainBranch: Employer = {
    addressLine1: '',
    addressLine2: '',
    description: '',
    branchLocation: '',
    city: '',
    contactEmail: '',
    contactName: '',
    contactNumber: '',
    contactBio: '',
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
    isHeadquarter: branches?.length == 0,

    name: '',
    bio: '',
    bannerImage: '',
    logo: '',
    mission: '',
    companySize: '',
    cultureAndEnvironment: '',
    benefitsAndPerks: '',
    awardsAndAccolades: '',
    alumniLinks: [],
    socialMediaLinks: [],
  };

  // For Auth section
  const [authRole, setAuthRole] = useState<'employer' | 'school' | ''>('');

  // For School Dashboard section
  const [isPartnerApproved, setIsPartnerApproved] = useState<boolean>(true);

  // For Employer Dashboard section
  const [showEventPlanModalForDashboard, setShowEventPlanModalForDashboard] =
    useState<boolean>(false);
  const [page, setPage] = useState<'Employer' | 'Institution'>('Employer');

  // For Chat section
  const [selectedChat, setSelectedChat] = useState<SelectedChat>(null);
  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // For EmployerCandidates section
  const [selectedUserApplication, setSelectedUserApplication] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCandidatesFilter, setSelectedCandidatesFilter] = useState<
    'all' | 'applied' | 'rejected' | 'hired'
  >('all');

  // For Jobcentral section
  const [showJobForm, setShowJobForm] = useState(false);
  const [showJobViewModal, setShowJobViewModal] = useState(false);
  const [showJobRenewModal, setShowJobRenewModal] = useState(false);

  // For EmployerProfile section
  const [mainBranch, setMainBranch] = useState(initialMainBranch);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showBranchPreviewModal, setShowBranchPreviewModal] = useState(false);
  const [showUpdateMainBranch, setShowUpdateMainBranch] = useState(false);

  // For EmployerEvents section
  const [showEventViewModal, setShowEventViewModal] = useState(false);
  const [showEventFormModal, setShowEventFormModal] = useState(false);
  const [showEventPlanModal, setShowEventPlanModal] = useState(
    ENVIRONMENT == 'production',
  );

  return (
    <StateContext.Provider
      value={{
        page,
        setPage,
        isPartnerApproved,
        setIsPartnerApproved,
        mainBranch,
        setMainBranch,
        showUpdateMainBranch,
        setShowUpdateMainBranch,
        showEventPlanModalForDashboard,
        setShowEventPlanModalForDashboard,
        selectedCandidatesFilter,
        setSelectedCandidatesFilter,
        authRole,
        setAuthRole,
        selectedChat,
        setSelectedChat,
        selectedUserApplication,
        setSelectedUserApplication,
        selectedStudent,
        setSelectedStudent,
        showJobForm,
        setShowJobForm,
        showJobViewModal,
        setShowJobViewModal,
        showJobRenewModal,
        setShowJobRenewModal,
        showEventFormModal,
        setShowEventFormModal,
        showEventViewModal,
        setShowEventViewModal,
        showEventPlanModal,
        setShowEventPlanModal,
        showBranchForm,
        setShowBranchForm,
        showBranchPreviewModal,
        setShowBranchPreviewModal,
        chatMessageInput,
        setChatMessageInput,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = (): StateContextType => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};
