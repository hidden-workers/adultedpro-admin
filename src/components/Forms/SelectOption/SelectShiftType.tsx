import { useEffect, useState } from 'react';

const shifts: string[] = ['Full Time', 'Part Time', 'Flexible'];

const SelectShiftType = ({
  onChange,
  defaultValue,
}: {
  onChange: (name: string, value: string) => void;
  defaultValue: string[];
}) => {
  const [selected, setSelected] = useState<string[]>(defaultValue || []);

  useEffect(() => {
    onChange('shiftDescription', selected);
  }, [selected]);

  const onShiftChange = (type: string) => {
    setSelected(type);
  };

  return (
    <div className="mb-6">
      <label className="mb-4.5 block text-sm font-medium text-black dark:text-white">
        Shift Description<span className="text-red">*</span>
      </label>

      <div className="flex flex-col gap-2.5">
        {shifts.map((item, index) => {
          const isChecked = selected.includes(item.toLowerCase());
          return (
            <div key={index}>
              <label className="relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white">
                <input
                  className="sr-only"
                  type="checkbox"
                  name="roleSelect"
                  id={item.toLowerCase()}
                  checked={isChecked}
                  onChange={() => onShiftChange(item.toLowerCase())}
                />
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    isChecked ? 'border-primary' : 'border-body'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-primary ${
                      isChecked ? 'flex' : 'hidden'
                    }`}
                  ></span>
                </span>
                {item}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectShiftType;
