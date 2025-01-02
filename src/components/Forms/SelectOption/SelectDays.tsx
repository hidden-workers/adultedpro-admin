import { useEffect, useState } from 'react';

const options: string[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

const SelectDay = ({
  onChange,
  defaultValue,
}: {
  onChange: (name: string, value: string[]) => void;
  defaultValue: string[];
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    defaultValue || [],
  );

  useEffect(() => {
    onChange('days', selectedValues);
  }, [selectedValues]);

  const onOptionChange = (value: string) => {
    setSelectedValues((pre) =>
      pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
    );
  };

  return (
    <div className="mb-5.5">
      <label
        htmlFor="recommend"
        className="mb-4.5 block text-sm font-medium text-black dark:text-white"
      >
        Days: <span className="text-red">*</span>
      </label>

      <div className="flex flex-col gap-2.5">
        {options.map((option, index) => (
          <div key={index}>
            <label className="relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white">
              <input
                className="sr-only"
                type="checkbox"
                name="recommend"
                onChange={() => onOptionChange(option)}
              />
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border 
                ${selectedValues.includes(option) ? 'border-primary' : 'border-body'}
              `}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-sm bg-primary 
                  ${selectedValues.includes(option) ? 'flex' : 'hidden'}
                `}
                ></span>
              </span>
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectDay;
