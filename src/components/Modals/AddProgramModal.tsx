import React, { useState, useEffect } from 'react';
import {
  Modal,
  Checkbox,
  FormControlLabel,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  linkProgramWithInstitute,
  getInstituteApi,
} from '../../store/reducers/programSlice';
import { Program, Institute } from '../../interfaces';
import { X } from 'lucide-react';

interface ProgramSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  partnerId: string;
  allPrograms: Program[];
}

const ProgramSelectionModal: React.FC<ProgramSelectionModalProps> = ({
  isOpen,
  onClose,
  programs,
  partnerId,
  allPrograms,
}) => {
  const dispatch = useDispatch();
  const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [institute, setInstitute] = useState<Institute | null>(null);

  useEffect(() => {
    if (isOpen && partnerId) {
      const fetchData = async () => {
        try {
          const instituteData = await dispatch<any>(
            getInstituteApi(partnerId),
          ).unwrap();
          setInstitute(instituteData.institute);
        } catch (error) {
          console.error('Error fetching institute data:', error);
        }
      };
      fetchData();
    }
  }, [dispatch, partnerId, isOpen]);

  const handleToggleProgram = (program: Program) => {
    setSelectedPrograms((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === program.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== program.id);
      } else {
        return [...prevSelected, program];
      }
    });
  };

  const handleConfirm = async () => {
    setIsAdding(true);

    const existingProgramIds = institute.program;

    const updatedProgramIds = Array.from(
      new Set([...existingProgramIds, ...selectedPrograms.map((p) => p.id)]),
    );
    const updatedInstitute: Institute = {
      ...institute,
      program: updatedProgramIds,
    };

    try {
      await dispatch<any>(
        linkProgramWithInstitute({
          instituteId: partnerId,
          updatedInstitute,
        }),
      );

      setSelectedPrograms([]);
      onClose();
    } catch (error) {
      console.error('Error linking programs with institute:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const sortedPrograms = [...allPrograms].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const availablePrograms = sortedPrograms.filter(
    (program) => !programs.some((p) => p.id === program.id),
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[1000px] rounded-lg bg-white px-6 py-4 text-left dark:bg-boxdark md:px-8 md:py-8 overflow-auto space-y-4">
        <div className="flex items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
          <div className="flex-grow flex justify-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              Select Program
            </h4>
          </div>
          <div className="flex items-center gap-4.5">
            <Tooltip title="Close" placement="top">
              <IconButton onClick={onClose}>
                <X />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <div className="w-1/2 p-4 bg-gray-100 shadow-lg rounded-lg">
            <h5 className="font-semibold text-lg mb-2 text-center text-black">
              My Programs
            </h5>
            <div className="flex flex-col gap-2">
              {programs.map((program) => (
                <ul className="list-disc pl-5" key={program.id}>
                  {' '}
                  {/* Add key here */}
                  <li>{program.name}</li>
                </ul>
              ))}
            </div>
          </div>

          <div className="w-1/2 p-4 bg-gray-100 shadow-lg rounded-lg">
            <h5 className="font-semibold text-lg mb-2 text-center text-black">
              All Programs
            </h5>
            <div className="flex flex-col gap-2">
              {availablePrograms.map((program) => (
                <FormControlLabel
                  key={program.id}
                  control={
                    <Checkbox
                      checked={
                        !!selectedPrograms.find((p) => p.id === program.id)
                      }
                      onChange={() => handleToggleProgram(program)}
                    />
                  }
                  label={program.name}
                  className="flex items-center"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="-mx-3 flex flex-wrap gap-y-4">
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              onClick={onClose}
              className="block w-full rounded border border-stroke bg-gray disabled:cursor-not-allowed p-3 text-center font-medium text-black transition dark:border-strokedark dark:bg-meta-4"
            >
              Cancel
            </button>
          </div>
          <div className="2xsm:w-1/2 w-full px-3">
            <button
              onClick={handleConfirm}
              disabled={isAdding}
              className={`block w-full rounded border border-black bg-black hover:bg-black/90 ${isAdding ? 'disabled:bg-black/90 disabled:cursor-not-allowed' : 'text-white'} p-3 text-center font-medium transition`}
            >
              Add Selected Programs
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProgramSelectionModal;
