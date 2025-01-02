import { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UserRolesEnum } from '../../utils/enums';
import React from 'react';
import SidebarLinkGroup from './SidebarLinkGroup';
import {
  Menu,
  BookOpen,
  Calendar,
  Captions,
  ChevronDown,
  Home,
  ListTodo,
  Mail,
  MessageSquareX,
  School,
  Upload,
  User,
  UserCog,
  UserRound,
  Users,
  Settings,
  Building2,
  ArrowLeftRight,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchUnreadCounts } from '../../store/reducers/chatSlice';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  ////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////////
  const location = useLocation();
  const { pathname } = location;
  const dispatch = useDispatch();
  const loggedIn_user_role = localStorage.getItem('Role');
  const authUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSelector((state: RootState) => state.user);

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  // const { chats } = useSelector((state: RootState) => state.chat);
  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const sidebarExpanded =
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true';
  const isInTestMode = localStorage.getItem('isTestMode');
  // const totalUnreadCount = useSelector(
  //   (state: RootState) => state.chat.totalUnreadCount,
  // );
  // const studentEmployerChatModal = useSelector(
  //   (state: RootState) => state.chat.studentEmployerChatModal,
  // );
  ////////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////////
  // useEffect(() => {
  //   if (authUser?.id && chats.length > 0 && !studentEmployerChatModal) {
  //     dispatch<any>(fetchUnreadCounts(authUser.id));
  //   }
  // }, [dispatch, authUser?.id, chats]);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  // Handler to toggle collapse
  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      ref={sidebar}
      className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } absolute left-0 top-0 z-50 flex h-full flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        isCollapsed ? 'w-25' : 'w-72.5'
      }`}
    >
      <button
        type="button"
        title="Collapse Sidebar"
        onClick={handleCollapseToggle}
        style={{
          width: '45px', // or whatever size you want
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          right: '4px',
          padding: '8px', // p-2
          top: isCollapsed ? '28px' : '15px',
          transform: isCollapsed ? 'translateY(-50%) translateX(-50%)' : 'none',
        }}
        className={`bg-gray-800 absolute right-4 top-1 z-10 rounded-full p-2 ${
          isCollapsed ? 'rotate-180' : ' rotate-180'
        }`}
      >
        <Menu size={23} />
      </button>

      {/* <!-- SIDEBAR HEADER --> */}
      <div
        className={`flex items-center justify-between gap-2 px-6 py-1 lg:py-2 ${
          isCollapsed ? 'hidden' : ''
        }`}
      >
        <div 
          className="flex items-center justify-start gap-2 text-lg font-bold capitalize mt-3.5"
        >

          <span className="text-m">
            Admin Portal
          </span>
        </div>
      </div>

      {/* <!-- SIDEBAR HEADER --> */}

      <div className="flex flex-1 flex-col justify-between overflow-y-auto">
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 px-4 py-4 lg:mt-0 lg:px-6">
            <div>
              <ul className="mb-6 flex flex-col gap-1.5">
                  <>
                    {/* Employer Applications */}
                    <li>
                      <NavLink
                        to="/employer/applications"
                        className={`${
                          isCollapsed ? 'justify-center' : 'justify-start'
                        } group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                  ${
                                    pathname == '/employer/applications'
                                      ? 'bg-graydark dark:bg-meta-4'
                                      : ''
                                  } `}
                      >
                        <Captions size={20} strokeWidth={1} />
                        <span className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}>
                          Applications
                        </span>
                      </NavLink>
                    </li>

                    {/* JobCentral */}
                    <li>
                      <NavLink
                        to="/"
                        className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                ${
                                  pathname == '/employer/jobcentral'
                                    ? 'bg-graydark dark:bg-meta-4'
                                    : ''
                                }${
                                  isCollapsed
                                    ? 'justify-center'
                                    : 'justify-start'
                                }`}
                      >
                        <BookOpen size={20} strokeWidth={1} />
                        <span className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}>
                          Job Central
                        </span>
                      </NavLink>
                    </li>

                    {/* Employer Chat */}
                    <li>
                      <NavLink
                        to="/employer/chat"
                        className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                ${
                                  pathname == '/employer/chat'
                                    ? 'bg-graydark dark:bg-meta-4'
                                    : ''
                                }${
                                  isCollapsed
                                    ? 'justify-center'
                                    : 'justify-start'
                                }`}
                      >
                        <MessageSquareX size={20} strokeWidth={1} />
                        <div
                          className={`flex items-center justify-between ${isCollapsed ? 'hidden' : ''}`}
                        >
                          <span className="ml-2">Chats</span>
                        </div> 
                      </NavLink>
                    </li>
                    {/* <div
                          className={`flex items-center justify-between ${isCollapsed ? 'hidden' : ''}`}
                        >
                          <span className="ml-2">Chats</span>
                          {totalUnreadCount > 0 && (
                            <span className="flex items-center justify-center ml-3 w-5 h-5 bg-white text-black text-sm font-semibold rounded-full">
                              {totalUnreadCount}
                            </span>
                          )}
                        </div> */}

                    {/* Employer Candidates */}
                    <li>
                      <NavLink
                        to="/employer/candidates"
                        className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                ${
                                  pathname == '/employer/candidates'
                                    ? 'bg-graydark dark:bg-meta-4'
                                    : ''
                                }${
                                  isCollapsed
                                    ? 'justify-center'
                                    : 'justify-start'
                                }`}
                      >
                        <Users size={20} strokeWidth={1} />
                        <span className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}>
                          Candidates
                        </span>
                      </NavLink>
                    </li>

                    {/* Employer Events */}
                    <li>
                      <NavLink
                        to="/employer/events"
                        className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                ${
                                  pathname == '/employer/events'
                                    ? 'bg-graydark dark:bg-meta-4'
                                    : ''
                                }${
                                  isCollapsed
                                    ? 'justify-center'
                                    : 'justify-start'
                                }`}
                      >
                        <Calendar size={20} strokeWidth={1} />
                        <span className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}>
                          Events
                        </span>
                      </NavLink>
                    </li>

                    {/* Profile */}
                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/employer/companyprofile' ||
                          pathname === '/employer/subscription' ||
                          pathname.includes('/recruiter/profile')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                          ${
                                            (open ||
                                              pathname ===
                                                '/employer/companyprofile' ||
                                              pathname ===
                                                '/employer/subscription' ||
                                              pathname.includes(
                                                '/recruiter/profile',
                                              )) &&
                                            'bg-graydark dark:bg-meta-4'
                                          } ${
                                            isCollapsed
                                              ? 'justify-center'
                                              : 'justify-start'
                                          }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleClick();
                                }}
                              >
                                <User size={20} strokeWidth={1} />
                                <span
                                  className={`ml-2 ${
                                    isCollapsed ? 'hidden' : ''
                                  }`}
                                >
                                  Profile
                                </span>
                                {!isCollapsed && (
                                  <ChevronDown
                                    className={`${
                                      open && 'rotate-180'
                                    } absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-current`}
                                  />
                                )}
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              {!isCollapsed && (
                                <div
                                  className={`translate transform overflow-hidden ${
                                    !open && 'hidden'
                                  }`}
                                >
                                  <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                                    <li>
                                      <NavLink
                                        to="/recruiter/profile"
                                        className={`group relative text-sm flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                                  ${
                                                    pathname ==
                                                      '/recruiter/profile' &&
                                                    'bg-graydark dark:bg-meta-4'
                                                  }`}
                                      >
                                        My Profile
                                      </NavLink>
                                    </li>
                                    <li>
                                      <NavLink
                                        className={`group relative text-sm flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                                  ${
                                                    pathname ==
                                                      '/employer/companyprofile' &&
                                                    'bg-graydark dark:bg-meta-4'
                                                  }`}
                                        to="/employer/companyprofile"
                                      >
                                        Company Profile
                                      </NavLink>
                                    </li>
                                    {user?.is_subscribed_user ? (
                                      <li>
                                        <NavLink
                                          className={`group relative text-sm flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4`}
                                          to={`${
                                            isInTestMode
                                              ? //@ts-expect-error: env might give error
                                                import.meta.env
                                                  .VITE_STRIPE_CUSTOMER_PORTAL_TEST
                                              : //@ts-expect-error: env might give error
                                                import.meta.env
                                                  .VITE_STRIPE_CUSTOMER_PORTAL_PROD
                                          }?prefilled_email=${user?.email}`}
                                        >
                                          Manage Subscriptions
                                        </NavLink>
                                      </li>
                                    ) : (
                                      <li>
                                        <NavLink
                                          className={`group relative text-sm flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                                      ${
                                                        pathname ==
                                                          '/employer/subscription' &&
                                                        'bg-graydark dark:bg-meta-4'
                                                      }`}
                                          to="/employer/subscription"
                                        >
                                          Subscriptions
                                        </NavLink>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                    {/* Employer Settings */}
                    <li>
                      <NavLink
                        to="/employer/settings"
                        className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                ${
                                  pathname == '/employer/settings'
                                    ? 'bg-graydark dark:bg-meta-4'
                                    : ''
                                }${
                                  isCollapsed
                                    ? 'justify-center'
                                    : 'justify-start'
                                }`}
                      >
                        <Settings size={20} strokeWidth={1} />
                        <span className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}>
                          Change Password
                        </span>
                      </NavLink>
                    </li>

                    {/* Upload Job Data */}
                    {loggedIn_user_role == UserRolesEnum.SuperAdmin && (
                      <li>
                        <NavLink
                          to="/employer/uploadjobdata"
                          className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                                ${
                                  pathname == '/employer/settings'
                                    ? 'bg-graydark dark:bg-meta-4'
                                    : ''
                                }${
                                  isCollapsed
                                    ? 'justify-center'
                                    : 'justify-start'
                                }`}
                        >
                          <Upload size={20} strokeWidth={1} />
                          <span
                            className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}
                          >
                            Upload Job Data
                          </span>
                        </NavLink>
                      </li>
                    )}

                    {/* Transfer Account */}
                    {loggedIn_user_role === UserRolesEnum.SuperAdmin && (
                      <>
                        <li>
                          <NavLink
                            to="/employer/transfer-account"
                            className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4`}
                          >
                            <ArrowLeftRight size={20} strokeWidth={1} />
                            <span
                              className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}
                            >
                              Transfer Account
                            </span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/employer/delete-account"
                            className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4`}
                          >
                            <ArrowLeftRight size={20} strokeWidth={1} />
                            <span
                              className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}
                            >
                              Delete Account
                            </span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/employer/labour-market"
                            className={`group relative flex text-sm items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 
                           `}
                          >
                            <Upload size={20} strokeWidth={1} />
                            <span
                              className={`ml-2 ${isCollapsed ? 'hidden' : ''}`}
                            >
                              Bulk upload
                            </span>
                          </NavLink>
                        </li>
                      </>
                    )}
                  </>
              </ul>
            </div>
          </nav>
        </div>

        <div className="px-4 py-4 text-center">
          <span
            className={`text-sm text-bodydark1 ${isCollapsed ? 'hidden' : ''}`}
            style={{ fontSize: '0.65rem' }}
          >
            Powered by Adulted Pro
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
