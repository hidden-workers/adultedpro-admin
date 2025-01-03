import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import NotificationsOne from '../../components/Notifications/NotificationsOne';
import NotificationsThree from '../../components/Notifications/NotificationsThree';
import NotificationsTwo from '../../components/Notifications/NotificationsTwo';
import DefaultLayout from '../../layout/DefaultLayout';
import LastMessages from '../../components/Notifications/LastMessages';

const Notifications: React.FC = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Notifications" />

      <div className="flex flex-col gap-7.5">
        <NotificationsOne />
        <NotificationsTwo />
        <NotificationsThree />
        <LastMessages />
      </div>
    </DefaultLayout>
  );
};

export default Notifications;
