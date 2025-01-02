import { useEffect, useState } from 'react';

const shifts: string[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

const SelectShift = ({
  onChange,
  defaultValue,
}: {
  onChange: (name: string, value: string[]) => void;
  defaultValue?: string[];
}) => {
  const [selectedShifts, setSelectedShifts] = useState<string[]>(
    defaultValue || [],
  );

  useEffect(() => {
    onChange('shift', selectedShifts);
  }, [selectedShifts]);

  const onShiftChange = (id: string) => {
    setSelectedShifts((pre) =>
      pre.includes(id) ? pre.filter((s) => s !== id) : [...pre, id],
    );
  };

  return (
    <div className="mb-6">
      <label className="mb-4.5 block text-sm font-medium text-black dark:text-white">
        Shift <span className="text-red">*</span>
      </label>

      <div className="flex flex-col gap-2.5">
        {shifts.map((shift, index) => {
          const isChecked = selectedShifts.includes(shift.toLowerCase());
          return (
            <div key={index}>
              <label className="relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white">
                <input
                  className="sr-only"
                  type="checkbox"
                  name="roleSelect"
                  id={shift.toLowerCase()}
                  checked={isChecked}
                  onChange={() => onShiftChange(shift.toLowerCase())}
                />
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    isChecked ? 'border-primary' : 'border-body'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-sm bg-primary ${
                      isChecked ? 'flex' : 'hidden'
                    }`}
                  ></span>
                </span>
                {shift}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectShift;
