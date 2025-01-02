import React from 'react';
import BadgeFour from '../../components/Badges/BadgeFour';
import BadgeThree from '../../components/Badges/BadgeThree';
import BadgeTwo from '../../components/Badges/BadgeTwo';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';

const Badge: React.FC = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Badge" />

      <div className="flex flex-col gap-7.5">
        <BadgeTwo />
        <BadgeThree />
        <BadgeFour />
      </div>
    </DefaultLayout>
  );
};

export default Badge;
