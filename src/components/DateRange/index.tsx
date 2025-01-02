import React, { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

export const DateRangee = ({
  onFilterJobByDateRange,
  setSelectionRange,
  selectionRange,
}) => {
  const [selectedRange, setSelectedRange] = useState<{
    from: Dayjs | null;
    to: Dayjs | null;
  }>({ from: null, to: null });

  const handleStartDateChange = (date: Dayjs | null) => {
    setSelectedRange((prev) => ({ ...prev, from: date }));
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    setSelectedRange((prev) => ({ ...prev, to: date }));
  };
  useEffect(() => {
    if (selectedRange.from && selectedRange.to) {
      const range = {
        selection: {
          startDate: selectedRange.from.toDate(),
          endDate: selectedRange.to.toDate(),
          key: 'selection',
        },
      };

      onSelectDateRange(range);
    }
  }, [selectedRange]);

  const onSelectDateRange = (range) => {
    onFilterJobByDateRange(range.selection);
    setSelectionRange(range.selection);
  };

  const onRemoveDateFilter = () => {
    setSelectedRange({ from: null, to: null });
    setSelectionRange(null);
    onFilterJobByDateRange(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="relative justify-start flex flex-col items-center gap-2 rounded-lg bg-gray-50 w-100">
        <div className="flex justify-between gap-2 w-full">
          <div className="w-full ">
            <DatePicker
              label="Start Date"
              value={selectedRange.from}
              onChange={handleStartDateChange}
              maxDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  className: 'w-full h-10',
                },
              }}
            />
          </div>
          <div className="w-full h-15">
            <DatePicker
              label="End Date"
              value={selectedRange.to}
              onChange={handleEndDateChange}
              minDate={selectedRange.from}
              maxDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  className: 'w-full ',
                },
              }}
            />
          </div>
          {selectionRange && (
            <div className="flex items-center">
              <button
                onClick={onRemoveDateFilter}
                className="whitespace-nowrap cursor-pointer text-primary hover:underline"
              >
                Remove Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
};
