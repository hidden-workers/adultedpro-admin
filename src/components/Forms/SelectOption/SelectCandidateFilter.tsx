import { useEffect, useState } from 'react';

interface Props {
  onChange: (name: string, value: string[]) => void;
  defaultValue: string[];
  options: string[];
  label: string;
  isRequired?: boolean;
  fieldName: string;
}
const SelectMultipleOptions = ({
  onChange,
  defaultValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  label,
  fieldName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isRequired = false,
}: Props) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    defaultValue || [],
  );
  // const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onChange(fieldName, selectedValues);
  }, [selectedValues]);

  const onOptionChange = (value: string) => {
    setSelectedValues((pre) =>
      pre.includes(value) ? pre.filter((v) => v !== value) : [...pre, value],
    );
  };

  // const toggleDropdown = () => {
  //   setIsOpen(!isOpen);
  // };

  return (
    <div className={`flex justify-between items-center gap-1 min-h-[40px] `}>
      <label
        key="all"
        className="cursor-pointer text-lg flex gap-1 text-black dark:text-white"
      >
        <input
          type="checkbox"
          name="recommend"
          checked={selectedValues.includes('All')}
          onChange={() => onOptionChange('All')}
        />
        All
      </label>
      <label
        key="reviewed"
        className="cursor-pointer text-lg flex gap-1 text-black dark:text-white"
      >
        <input
          type="checkbox"
          name="recommend"
          checked={selectedValues.includes('Reviewed')}
          onChange={() => onOptionChange('Reviewed')}
        />
        Reviewed
      </label>
      <label
        key="bookmarked"
        className="cursor-pointer text-lg flex gap-1 text-black dark:text-white"
      >
        <input
          type="checkbox"
          name="recommend"
          checked={selectedValues.includes('Bookmarked')}
          onChange={() => onOptionChange('Bookmarked')}
        />
        Bookmarked
      </label>
    </div>
  );
};

export default SelectMultipleOptions;
