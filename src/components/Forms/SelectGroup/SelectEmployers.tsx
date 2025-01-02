import { useEffect, useState } from 'react';
import { RootState } from '../../../store/store';
import { useSelector } from 'react-redux';
import { Employer } from '../../../interfaces';
import { X, ChevronDown } from 'lucide-react';

interface SelectEmployerIdsProps {
  onChange: (name: string, value: string[]) => void;
  defaultValue?: string[];
  setShowEmployerFields: any;
  loading: boolean;
}

const SelectEmployerIds: React.FC<SelectEmployerIdsProps> = ({
  onChange,
  defaultValue,
  setShowEmployerFields,
  loading,
}) => {
  /////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////////////
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    defaultValue || [],
  );
  const { allEmployers } = useSelector((state: RootState) => state.employer);

  /////////////////////////////////////////////// STATES //////////////////////////////////////////////////////////////
  const [employers, setEmployers] = useState(allEmployers);
  const [searchValue, setSearchValue] = useState('');

  /////////////////////////////////////////////// USE EFFECTS //////////////////////////////////////////////////////////////
  useEffect(() => {
    if (selectedOptions.includes('other')) setShowEmployerFields(true);
    else setShowEmployerFields(false);
    onChange('requestedEmployerIds', selectedOptions);
  }, [selectedOptions]);
  useEffect(() => {
    setEmployers(allEmployers);
  }, [allEmployers]);
  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue]);
  useEffect(() => {
    if (defaultValue) {
      setSelectedOptions(defaultValue);
    }
  }, [defaultValue]);
  useEffect(() => {
    // Sort employers alphabetically by name
    const sortedEmployers = [...allEmployers].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    setEmployers(sortedEmployers);
  }, [allEmployers]);

  /////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////////////
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
  const onSearch = (value: string) => {
    setEmployers(
      allEmployers.filter((e) =>
        e?.email?.toLowerCase()?.includes(value?.toLowerCase()),
      ),
    );
  };

  return (
    <>
      <div className="w-full sm:w-1/2">
        <label className="text-start mb-3 block text-sm font-medium text-black dark:text-white">
          Employers
        </label>
        <div className="relative">
          <div
            onClick={toggleDropdown}
            className="min-h-[48px] text-start capitalize w-full rounded border-[1.5px] border-stroke bg-gray px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary cursor-pointer"
          >
            {selectedOptions?.length === 0
              ? 'Select Options'
              : allEmployers
                  .filter((e) => selectedOptions.includes(e.id))
                  .map((e) => e.name)
                  .join(', ')}
            {selectedOptions.includes('other') && 'Other'}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown />
            </span>
          </div>
          {isOpen && (
            <div className="absolute h-48 overflow-auto z-10 w-full mt-1 bg-white rounded-md shadow-lg">
              <div className="p-2 relative ">
                <input
                  type="text"
                  placeholder="Search employers"
                  value={searchValue}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchValue.length > 0 && (
                  <span
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center justify-center w-fit h-fit p-[1px] rounded-full bg-black text-white cursor-pointer"
                    onClick={() => setSearchValue('')}
                  >
                    <X className="w-4 h-4" />
                  </span>
                )}
              </div>
              {loading && (
                <label className="py-5 capitalize hover:bg-gray relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white px-4">
                  Loading...
                </label>
              )}
              {!loading && (
                <label className="capitalize hover:bg-gray relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white px-4 py-3">
                  <input
                    className="sr-only"
                    type="checkbox"
                    name="recommend"
                    onChange={() => handleOptionClick('other')}
                  />
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border 
                                        ${selectedOptions.includes('other') ? 'border-primary' : 'border-body'}
                                    `}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedOptions.includes('other') ? 'flex' : 'hidden'}`}
                    />
                  </span>
                  Other
                </label>
              )}
              {employers.map(
                (employer: Employer, index) =>
                  employer.name && (
                    <label
                      key={index}
                      className="capitalize hover:bg-gray relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white px-4 py-3"
                    >
                      <input
                        className="sr-only"
                        type="checkbox"
                        name="recommend"
                        onChange={() => handleOptionClick(employer.id)}
                      />
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border 
                                        ${selectedOptions.includes(employer.id) ? 'border-primary' : 'border-body'}
                                    `}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-sm bg-primary ${selectedOptions.includes(employer.id) ? 'flex' : 'hidden'}`}
                        />
                      </span>
                      {employer.name}
                    </label>
                  ),
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SelectEmployerIds;
