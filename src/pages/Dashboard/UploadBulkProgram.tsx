import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPrograms,
  updateSingleProgram,
} from '../../store/reducers/programSlice';
import { Program } from '../../interfaces';
import { RootState } from '../../store/store';

const UploadBulkProgram: React.FC = () => {
  //////////////////////////////////////////////////// VARIABLES /////////////////////////////////////////////////////////
  const dispatch = useDispatch();
  const uploadPrograms = useRef(null);
  //////////////////////////////////////////////////// STATES /////////////////////////////////////////////////////////
  const [program, setProgram] = useState<any>({});
  const [programs, setAllPrograms] = useState<Program[]>([]);
  const [updatedPrograms, setUpdatedPrograms] = useState<any>([]);
  const bulkProgramsLoading = useSelector(
    (state: RootState) => state.programs.status,
  );

  //////////////////////////////////////////////////// USE EFFECTS /////////////////////////////////////////////////////////

  //////////////////////////////////////////////////// FUNCTIONS /////////////////////////////////////////////////////////
  const onUploadJsonData = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const jsonData = e.target?.result;
      if (jsonData) {
        try {
          const data = JSON.parse(jsonData as string);

          setUpdatedPrograms(data); // Example: storing it in state as an array
        } catch (error) {
          console.error('Error parsing JSON data:', error);
        }
      }
    };

    reader.readAsText(file);
  };

  const onStoreData = async () => {
    if (Object.keys(program)?.length) {
      const updatedProgram = { program, stats: updatedPrograms };
      await dispatch<any>(updateSingleProgram(updatedProgram));
      setProgram({});
      setUpdatedPrograms([]);
    } else {
      console.log('Please select a program');
    }
  };

  useEffect(() => {
    const fetchProgramsData = async () => {
      try {
        const response = await dispatch<any>(fetchPrograms(true));
        const programsData = response.payload as Program[];
        // setAllPrograms(programsData);
        setAllPrograms(
          [...programsData].sort((a, b) => a.name.localeCompare(b.name)),
        );
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchProgramsData();
  }, [dispatch]);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Labour Market" />

      <div className="mt-4 flex flex-col gap-10">
        <div className="flex items-center justify-between ">
          <div className=""></div>

          <div className="flex items-center justify-end gap-4 ">
            <div className="flex w-full  items-center justify-end gap-2 ">
              <span className="text-sm md:text-base font-medium">
                Select Program:
              </span>
              <select
                className="w-full md:w-48 rounded border border-stroke bg-gray px-2 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                name="program"
                onChange={(e) => {
                  const selectedProgram = programs.find(
                    (program) => program?.name === e.target.value,
                  );
                  setProgram(selectedProgram);
                }}
                value={program?.name ?? ''}
                id="program"
                title="Program Selection"
              >
                {programs?.length === 0 ? (
                  <option value="">No Branch</option>
                ) : (
                  <option value="all">All</option>
                )}
                {programs?.map((program, index) => (
                  <option value={program?.name} key={index}>
                    {program?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-row">
              {Object.keys(program)?.length ? (
                <button
                  onClick={() =>
                    uploadPrograms.current && uploadPrograms.current.click()
                  }
                  className="flex w-[250px] mr-4 justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50 "
                >
                  Upload Program Data
                  <input
                    ref={uploadPrograms}
                    type="file"
                    accept=".json"
                    onChange={onUploadJsonData}
                    className="hidden h-full w-full "
                    title="Upload"
                    placeholder="Upload"
                  />
                </button>
              ) : null}
              <button
                disabled={!updatedPrograms?.length}
                onClick={() => onStoreData()}
                className={`flex w-[250px] ${!updatedPrograms?.length ? 'cursor-not-allowed' : 'cursor-pointer'}  justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50 `}
              >
                {bulkProgramsLoading == 'loading' ? (
                  <div
                    className={`flex items-center justify-center  dark:bg-black w-fit h-fit`}
                  >
                    <div className=" w-6 h-6 border-[2px] border-solid border-white border-t-transparent animate-spin rounded-full " />
                  </div>
                ) : (
                  'Export Programs'
                )}
              </button>

              {/* <p className='items-center text-center font-semibold text-[18px]'>Success</p> */}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UploadBulkProgram;
