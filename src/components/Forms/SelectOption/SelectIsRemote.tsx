import { useEffect, useState } from 'react';

const SelectIsRemote = ({
  onChange,
  value,
}: {
  onChange: (name: string, value: boolean) => void;
  value: boolean;
}) => {
  const [isRemote, setIsRemote] = useState<boolean>(value);

  useEffect(() => {
    onChange('isRemote', isRemote);
  }, [isRemote]);

  return (
    <div className="mb-6">
      <label className="mb-4.5 block text-sm font-medium text-black dark:text-white">
        Remote Job
      </label>

      <div className="flex flex-col gap-2.5">
        <label className="relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-black dark:text-white">
          <input
            className="sr-only"
            type="checkbox"
            name="isRemote"
            checked={isRemote}
            onChange={() => setIsRemote((pre) => !pre)}
          />
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
              isRemote ? 'border-primary' : 'border-body'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-sm bg-primary ${
                isRemote ? 'flex' : 'hidden'
              }`}
            />
          </span>
          Remote Job
        </label>
      </div>
    </div>
  );
};

export default SelectIsRemote;
