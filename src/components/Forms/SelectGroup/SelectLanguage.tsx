import { useState } from 'react';

const SelectLanguage = ({
  onChange,
  value: v,
}: {
  onChange: (e: any) => void;
  value: string;
}) => {
  const languages = ['English', 'Spanish', 'Tagalog', 'Mandarin', 'Cantonese'];

  const [showOther, setShowOther] = useState(!languages.includes(v));
  const [selectValue, setSelectValue] = useState(
    languages.includes(v) ? v : 'Other',
  );

  const onSelectInputChange = (e) => {
    setSelectValue(e.target.value);
    if (e.target.value == 'Other') {
      setShowOther(true);
    } else {
      setShowOther(false);
      onChange(e);
    }
  };

  return (
    <div className="mb-5.5">
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        Languages <span className="text-red">*</span>
      </label>

      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          value={selectValue}
          name="language"
          onChange={onSelectInputChange}
          className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary `}
        >
          <option value="" disabled className="text-body dark:text-bodydark">
            Select your Language
          </option>
          {languages.map((language, index) => (
            <option
              key={index}
              value={language}
              className="text-body dark:text-bodydark"
            >
              {language}
            </option>
          ))}
          <option value="Other" className="text-body dark:text-bodydark">
            Other
          </option>
        </select>

        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              ></path>
            </g>
          </svg>
        </span>
      </div>

      {showOther && (
        <input
          type="text"
          name="language"
          value={v}
          onChange={onChange}
          placeholder="Please enter other language here"
          className="mt-2 w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      )}
    </div>
  );
};

export default SelectLanguage;
