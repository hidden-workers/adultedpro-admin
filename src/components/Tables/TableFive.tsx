import React from 'react';

interface User {
  pay: string;
  title: string;
  location: string;
  DatePosted: string;
  applicants: number;
}

const users: User[] = [
  {
    pay: '10000',
    title: 'Multidisciplinary Web Entrepreneur',
    location: 'NYC',
    DatePosted: '11-12-2023',
    applicants: 72,
  },
  {
    pay: '10000',
    title: 'Website Front-end Developer',
    location: 'WDC',
    DatePosted: '11-12-2023',
    applicants: 72,
  },
  {
    pay: '10000',
    title: 'Regional Paradigm Technician',
    location: 'Chicago',

    DatePosted: '11-12-2023',
    applicants: 72,
  },
  {
    pay: '10000',
    title: 'Applications Engineer',
    location: 'Texas',
    DatePosted: '11-12-2023',
    applicants: 72,
  },
  {
    pay: '10000',
    title: 'Lead Implementation Liaison',
    location: 'Carolina',
    DatePosted: '11-12-2023',
    applicants: 72,
  },
  {
    pay: '10000',
    title: 'Regional Paradigm Technician',
    location: 'San Andreas',
    DatePosted: '11-12-2023',
    applicants: 72,
  },
  {
    pay: '10000',
    title: 'Multidisciplinary Web Entrepreneur',
    location: 'Vice City',
    DatePosted: '11-12-2023',
    applicants: 72,
  },
  {
    pay: '10000',
    title: 'Central Security Manager',
    location: 'Lahore',
    DatePosted: '11-12-2023',
    applicants: 72,
  },
];

const TableFive: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-[10px]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1170px]">
          {/* table header start */}
          <div className="grid grid-cols-12 bg-[#F9FAFB] px-4 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-7">
            <div className="col-span-3">
              <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                TITLE
              </h5>
            </div>

            <div className="col-span-2">
              <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                PAY
              </h5>
            </div>

            <div className="col-span-2">
              <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                LOCATION
              </h5>
            </div>

            <div className="col-span-2">
              <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                DATE POSTED
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="font-bold text-[#3c50e0] dark:text-bodydark">
                APPLICANTS
              </h5>
            </div>
          </div>
          {/* table header end */}

          {/* table body start */}
          <div className="bg-white dark:bg-boxdark">
            {users.map((user, index) => (
              <div
                key={index}
                className="grid grid-cols-12 border-t border-[#EEEEEE] px-4 py-4 dark:border-strokedark lg:px-7.5 2xl:px-7"
              >
                <div className="col-span-3">
                  <p className="text-[#637381] dark:text-bodydark">
                    {user.title}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-[#637381] dark:text-bodydark">
                    {user.pay}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-[#637381] dark:text-bodydark">
                    {user.location}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="pl-2 text-[#637381] dark:text-bodydark">
                    {user.DatePosted}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="pl-8 text-[#637381] dark:text-bodydark">
                    {user.applicants}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* table body end */}
        </div>
      </div>
    </div>
  );
};

export default TableFive;
