import React, { useState } from 'react';
import {
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';

interface Program {
  id: string;
  name: string;
  approved: boolean;
  questionType: string;
}

const SelectProgram: React.FC<{
  programs: Program[];
  onFilterChange: (program: Program | null) => void;
}> = ({ programs, onFilterChange }) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const programId = event.target.value;
    const selectedProgram =
      programs.find((program) => program.id === programId) || null;
    setSelectedProgram(selectedProgram);
    onFilterChange(selectedProgram);
  };
  return (
    <FormControl className="flex justify-start gap-4 mb-2 ml-3">
      <Select
        value={selectedProgram?.id || ''}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <span className="text-sm text-gray-500">Select Program</span>
            );
          }
          return selectedProgram?.name || '';
        }}
        className="h-10 w-120 text-left px-2.5 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {programs.map((program) => (
          <MenuItem key={program?.id} value={program?.id} className="text-sm">
            {program?.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectProgram;
