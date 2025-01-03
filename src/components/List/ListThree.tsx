import React from 'react';
import DropdownFive from '../Dropdowns/DropdownFive';

import userOne from '../../images/user/user-01.png';
import userTwo from '../../images/user/user-03.png';
import userThree from '../../images/user/user-02.png';
import userFour from '../../images/user/user-05.png';

interface ListItem {
  image: string;
  name: string;
  position: string;
}

const listItems: ListItem[] = [
  { image: userOne, name: 'Devid Wilium', position: 'Digital marketer' },
  { image: userTwo, name: 'Deniyal Shifer', position: 'Graphics designer' },
  { image: userThree, name: 'Philifs Geno', position: 'Content creator' },
  { image: userFour, name: 'Marko Diyan', position: 'Web developer' },
  { image: userFour, name: 'Marko Diyan', position: 'Web developer' },
  { image: userFour, name: 'Marko Diyan', position: 'Web developer' },
  { image: userTwo, name: 'Deniyal Shifer', position: 'Graphics designer' },
  { image: userTwo, name: 'Deniyal Shifer', position: 'Graphics designer' },
  { image: userTwo, name: 'Deniyal Shifer', position: 'Graphics designer' },
  { image: userThree, name: 'Philifs Geno', position: 'Content creator' },
];

const ListThree: React.FC = () => {
  return (
    <div
      style={{ height: '90vh', overflowY: 'scroll' }}
      className="w-full max-w-[360px] rounded-md border border-stroke py-2.5 dark:border-strokedark"
    >
      <div className="flex flex-col">
        {listItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4.5 hover:bg-[#F9FAFB] dark:hover:bg-meta-4"
          >
            <div className="flex items-center">
              <div className="mr-4 h-[50px] w-full max-w-[50px] overflow-hidden rounded-full">
                <img
                  src={item.image}
                  alt="user"
                  className="rounded-full object-cover object-center"
                />
              </div>
              <div>
                <h4 className="text-base font-medium text-black dark:text-white">
                  {item.name}
                </h4>
                <p className="text-sm">{item.position}</p>
              </div>
            </div>

            <div>
              <DropdownFive />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListThree;
