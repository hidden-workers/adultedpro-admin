import { useEffect, useState } from 'react';

interface SelectDocumentsProps {
  onChange: (name: string, selectedOptions: string[]) => void;
  defaultValue?: string[];
}

const SelectDocuments: React.FC<SelectDocumentsProps> = ({
  onChange,
  defaultValue,
}) => {
  ///////////////////////////////////////////////   VARIABLES //////////////////////////////////////////////////////////////
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    defaultValue || [],
  );

  ///////////////////////////////////////////////   FUNCTIONS //////////////////////////////////////////////////////////////
  useEffect(() => {
    onChange('requiredDocuments', selectedOptions);
  }, [selectedOptions]);

  ///////////////////////////////////////////////   FUNCTIONS //////////////////////////////////////////////////////////////
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleOptionClick = (value: string) => {
    const index = selectedOptions.indexOf(value);
    if (index === -1) {
      setSelectedOptions([...selectedOptions, value]);
    } else {
      setSelectedOptions(selectedOptions.filter((option) => option !== value));
    }
  };

  return (
    <div className="mb-5.5">
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        Required Documents <span className="text-red">*</span>
      </label>
      <div className="relative">
        <div
          onClick={toggleDropdown}
          className="capitalize w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary cursor-pointer"
        >
          {selectedOptions.length === 0
            ? 'Select Options'
            : selectedOptions.join(', ')}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`w-6 h-6 transition transform `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
            {['resume', 'coverLetter', 'transcript', 'otherDocuments'].map(
              (option, i) => (
                <label
                  key={i}
                  className="capitalize hover:bg-gray relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white px-4 py-3"
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    name="recommend"
                    id={option}
                    onChange={() => handleOptionClick(option)}
                  />
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border 
                  ${selectedOptions.includes(option) ? 'border-primary' : 'border-body'}
                `}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedOptions.includes(option) ? 'flex' : 'hidden'}`}
                    />
                  </span>
                  {option}
                </label>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDocuments;
