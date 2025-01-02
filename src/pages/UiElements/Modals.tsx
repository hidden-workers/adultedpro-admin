import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import ModalThree from '../../components/Modals/ModalThree';
import DefaultLayout from '../../layout/DefaultLayout';

const Modals: React.FC = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Modals" />

      <div className="rounded-sm border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap justify-center gap-5">
          <ModalThree />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Modals;
