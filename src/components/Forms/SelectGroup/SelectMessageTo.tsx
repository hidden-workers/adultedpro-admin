import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

const SelectMessageTo: React.FC<{ onChange: any; value: string }> = ({
  onChange,
  value,
}) => {
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div className="mb-4.5">
      <label className="mb-2.5 block text-black font-bold dark:text-white">
        Message To
      </label>

      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          value={value}
          title="Message To"
          name="to"
          onChange={(e) => {
            onChange(e);
            changeTextColor();
          }}
          className={`${isOptionSelected ? 'text-black dark:text-white' : ''} relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary `}
        >
          <option
            value=""
            disabled
            className="text-body font-bold dark:text-bodydark"
          >
            Message To
          </option>
          <option value="Teachers" className="text-body dark:text-bodydark">
            Teachers
          </option>
          <option value="Counsellors" className="text-body dark:text-bodydark">
            Counsellors
          </option>
          <option value="Students" className="text-body dark:text-bodydark">
            Students
          </option>
        </select>

        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
          <ChevronDown />
        </span>
      </div>
    </div>
  );
};

export default SelectMessageTo;
