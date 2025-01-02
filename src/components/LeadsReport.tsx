import React from 'react';
import User17 from '../images/user/user-17.png';
import { Lead } from '../types/Lead';

const leadsData: Lead[] = [
  {
    avatar: User17,
    name: 'Charlie Donin',
    email: 'wdavis@aol.com',
    project: '25 Dec 2024 - 28 Dec 2024',
    classes: 'Phy, Chem, Math',
    status: 'lost',
  },
  // {
  //   avatar: User18,
  //   name: 'Makenna Carder',
  //   email: 'ltorres@aol.com',
  //   project: '25 Dec 2024 - 28 Dec 2024',
  //   duration: 3,
  //   status: 'active',
  // },
  // {
  //   avatar: User19,
  //   name: 'Talan Dokidis',
  //   email: 'rtaylor@aol.com',
  //   project: '25 Dec 2024 - 28 Dec 2024',
  //   duration: 3,
  //   status: 'active',
  // },
  // {
  //   avatar: User20,
  //   name: 'Cheyenne Levin',
  //   email: 'ebrown@aol.com',
  //   project: '25 Dec 2024 - 28 Dec 2024',
  //   duration: 3,
  //   status: 'active',
  // },
  // {
  //   avatar: User21,
  //   name: 'James Aminoff',
  //   email: 'slee@aol.com',
  //   project: '25 Dec 2024 - 28 Dec 2024',
  //   duration: 3,
  //   status: 'lost',
  // },
];

const LeadsReport: React.FC = () => {
  return (
    <div className="col-span-12">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-4 pb-5 dark:border-strokedark md:px-6 xl:px-7.5">
          <div className="flex items-center gap-26 pt-4">
            <div className="w-2/12 xl:w-3/12">
              <span className="font-semibold">Picture</span>
            </div>
            <div className="w-6/12 2xsm:w-5/12 md:w-3/12">
              <span className="font-semibold">Name</span>
            </div>

            <div className="w-4/12 2xsm:w-3/12 md:w-2/12 xl:w-1/12">
              <span className="font-semibold">Classes</span>
            </div>
            <div className="hidden w-2/12 text-center 2xsm:block md:w-1/12">
              <span className="font-semibold">Approval</span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 xl:p-7.5">
          <div className="flex flex-col gap-7">
            {leadsData.map((lead, key) => (
              <div className="flex items-center gap-24" key={key}>
                <div className="flex items-center gap-4">
                  <div className="2xsm:h-24 2xsm:w-full 2xsm:max-w-24 2xsm:rounded-full">
                    <img src={lead.avatar} alt="User" />
                  </div>
                </div>
                <div className="w-6/12 2xsm:w-5/12 md:w-3/12">
                  <span className="hidden font-medium xl:block">
                    {lead.name}
                  </span>
                </div>

                <div className="hidden w-1/12 xl:block">
                  <span className="font-medium">{lead.classes}</span>
                </div>

                <div className="hidden w-2/12 2xsm:block md:w-1/12">
                  <button className="rounded-md bg-primary px-1 py-1.5 font-medium text-white hover:bg-opacity-90">
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsReport;
