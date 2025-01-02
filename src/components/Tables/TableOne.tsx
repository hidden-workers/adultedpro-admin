import { BRAND } from '../../types/brand';
import BrandOne from '../../images/brand/brand-01.svg';
import BrandTwo from '../../images/brand/brand-02.svg';
import BrandThree from '../../images/brand/brand-03.svg';
import BrandFour from '../../images/brand/brand-04.svg';
import BrandFive from '../../images/brand/brand-05.svg';

const brandData: BRAND[] = [
  {
    logo: BrandOne,
    name: 'Quantum Mechanics Fundamentals',
    visitors: 'Dr. Olivia Chen',
    revenues: '54',
    sales: 590,
    conversion: 4.8,
  },
  {
    logo: BrandTwo,
    name: 'Quantum Mechanics Fundamentals',
    visitors: 'Dr. Olivia Chen',
    revenues: '24',
    sales: 467,
    conversion: 4.3,
  },
  {
    logo: BrandThree,
    name: 'Quantum Mechanics Fundamentals',
    visitors: 'Dr. Olivia Chen',
    revenues: '64',
    sales: 420,
    conversion: 3.7,
  },
  {
    logo: BrandFour,
    name: 'Quantum Mechanics Fundamentals',
    visitors: 'Dr. Olivia Chen',
    revenues: '32',
    sales: 389,
    conversion: 2.5,
  },
  {
    logo: BrandFive,
    name: 'Quantum Mechanics Fundamentals',
    visitors: 'Dr. Olivia Chen',
    revenues: '27',
    sales: 390,
    conversion: 4.2,
  },
];

const TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-2xl font-extrabold tracking-widest	 text-center text-black dark:text-white">
        Winter 2024 Classes
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-3">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-bold uppercase xsm:text-base">Class</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-bold uppercase xsm:text-base">
              Instructor Name
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-bold uppercase xsm:text-base">
              Total Students
            </h5>
          </div>
        </div>

        {brandData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-3 ${
              key === brandData.length - 1
                ? ''
                : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="hidden text-black dark:text-white sm:block">
                {brand.name}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.visitors}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3">{brand.revenues}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
