import React from 'react';

interface ListItem {
  text: string;
}

const listItems: ListItem[] = [
  { text: 'Physics' },
  { text: 'English' },
  { text: 'Asronomy' },
  { text: 'Geography' },
  { text: 'Political Science' },
];

const ListOne: React.FC = () => {
  return (
    <div className="min-w-[270px] max-w-max rounded-md border border-stroke py-1 dark:border-strokedark">
      <ul className="flex flex-col">
        {listItems.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2.5 border-b border-stroke px-5 py-3 last:border-b-0 dark:border-strokedark"
          >
            <span className="max-w-6.5 flex h-6.5 w-full items-center justify-center rounded-full bg-primary text-white">
              {index + 1}
            </span>
            <span> {item.text} </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListOne;
