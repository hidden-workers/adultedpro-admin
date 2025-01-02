import React, { useState } from 'react';
import {
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import useMobile from '../../hooks/useMobile';

interface Program {
  id: string;
  name: string;
}

const ProgramFilter: React.FC<{
  programs: Program[];
  onFilterChange: (programName: string | null) => void;
}> = ({ programs, onFilterChange }) => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [isMobile] = useMobile();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const programName = event.target.value as string;
    setSelectedProgram(programName);
    onFilterChange(programName);
  };

  return (
    <FormControl className="flex justify-start gap-4 mb-4 ml-3">
      <Select
        value={selectedProgram || ''}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <span className="text-sm text-gray-500">Filter Program</span>
            );
          }
          return selected;
        }}
        className={` px-2.5 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 ${isMobile ? 'h-7.5 w-40' : 'h-10 w-40'}`}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {programs.map((program) => (
          <MenuItem key={program.id} value={program.name} className="text-sm">
            {program.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ProgramFilter;
