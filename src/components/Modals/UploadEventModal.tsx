import React, { useState, useEffect } from 'react';
import { Tooltip, IconButton, Modal, Button } from '@mui/material';
import { Upload } from 'lucide-react';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { bulkUploadEvents } from '../../store/reducers/eventSlice';
import * as XLSX from 'xlsx';
import { EventFile } from '../../interfaces';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { fetchPartners } from '../../store/reducers/partnerSlice';
import { RootState } from '../../store/store';

interface UploadEventModalProps {
  open: boolean;
  onClose: () => void;
}

const UploadEventModal: React.FC<UploadEventModalProps> = ({
  open,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { partners } = useSelector((state: RootState) => state.partner);

  useEffect(() => {
    dispatch<any>(fetchPartners());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid Excel file (.xlsx)');
      setFile(null);
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    return regex.test(dateString);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const expectedHeader = [
          'program',
          'event type',
          'class',
          'days',
          'start time',
          'end time',
          'start date',
          'end date',
          'institute name',
        ];

        const headerRow = json[0] as string[];

        if (!headerRow || headerRow.length !== expectedHeader.length) {
          onClose();
          toast.error(
            'Error: Invalid file format. Please ensure the correct column headers are present.',
          );
          return;
        }

        for (let i = 0; i < expectedHeader.length; i++) {
          if (headerRow[i]?.toLowerCase() !== expectedHeader[i]) {
            onClose();
            toast.error(
              `Error: Invalid file format. Expected column "${expectedHeader[i]}", but found "${headerRow[i]}" instead.`,
            );
            return;
          }
        }

        // Updated regex to allow optional seconds (e.g., 12:00:00 PM or 12:00 PM)
        const timeRegex =
          /^([1-9]|1[0-2]):[0-5][0-9](?::[0-5][0-9])?\s?(AM|PM|am|pm)$/;

        const rows = json.slice(1);
        const events: EventFile[] = [];

        for (const row of rows) {
          const [
            program,
            eventType,
            className,
            days,
            startTimeStr,
            endTimeStr,
            startDateStr,
            endDateStr,
            instituteName,
          ] = row as (string | number)[];

          const status = 'Scheduled';
          const createrRole = 'SuperAdmin';

          if (
            !program ||
            !className ||
            !days ||
            !startTimeStr ||
            !endTimeStr ||
            !startDateStr ||
            !endDateStr ||
            !eventType ||
            !instituteName
          ) {
            console.error('Validation failed for row:', row);
            onClose();
            toast.error(
              `Error: Missing required fields in the uploaded file. Program: "${program || 'N/A'}", Event Type: "${eventType || 'N/A'}". Please check your file and try again.`,
            );
            return;
          }

          const validPartner = partners?.find((p) => p?.name === instituteName);
          if (!validPartner) {
            onClose();
            toast.error(
              `Error: Institution "${instituteName}" not found in partners list.`,
            );
            return;
          }

          // Convert time if it's in numeric format (e.g., 0.5 to 12:00 PM)
          const convertTime = (time: string | number) => {
            if (typeof time === 'number') {
              const hours = Math.floor(time * 24);
              const minutes = Math.floor((time * 24 * 60) % 60);
              const period = hours >= 12 ? 'PM' : 'AM';
              const adjustedHours = hours % 12 || 12;
              return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
            }
            return time;
          };

          const convertDate = (date: any) => {
            if (typeof date === 'number') {
              const parsedDate = XLSX.SSF.parse_date_code(date);
              if (parsedDate) {
                const jsDate = new Date(
                  parsedDate.y,
                  parsedDate.m - 1,
                  parsedDate.d,
                );
                const month = (jsDate.getMonth() + 1)
                  .toString()
                  .padStart(2, '0');
                const day = jsDate.getDate().toString().padStart(2, '0');
                const year = jsDate.getFullYear();
                return `${month}/${day}/${year}`;
              }
            }
            return '';
          };

          const startDate = convertDate(startDateStr);
          const endDate = convertDate(endDateStr);

          if (!isValidDate(startDate) || !isValidDate(endDate)) {
            toast.error(
              'Error: Invalid date format. Dates must be in MM/DD/YYYY format. Please correct your file and try again.',
            );
            return;
          }

          // Convert the start and end time if they are numbers, then validate them
          const startTime = convertTime(startTimeStr);
          const endTime = convertTime(endTimeStr);

          // Validate the time format after conversion
          if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            toast.error(
              `Error: Invalid time format. Start Time: "${startTime}", End Time: "${endTime}". Time must be in the format '8:00 pm', '8:00pm', '12:00:00 PM', or '0.5' equivalent.`,
            );
            return;
          }

          events.push({
            id: uuidv4(),
            program: program as string,
            eventType: eventType as string,
            class: className as string,
            days: (days as string).split(',').map((day) => day.trim()),
            startTime: startTime,
            endTime: endTime,
            startDate: startDate,
            endDate: endDate,
            instituteName: instituteName as string,
            status: status as string,
            createrRole: createrRole as string,
          });
        }

        dispatch<any>(bulkUploadEvents(events));
        onClose();
        toast.success('Events uploaded successfully');
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error reading file:', err);
      onClose();
      toast.error('Error reading file. Please try again.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center bg-black/90"
    >
      <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-md shadow-md w-full max-w-[800px]">
        <div className="flex justify-between items-center mb-4 bg-[#F9FAFB] rounded-md px-4 py-3">
          <h2 className="text-2xl font-semibold text-black">
            Upload Events File
          </h2>
          <Tooltip title="Close" placement="top">
            <IconButton onClick={onClose}>
              <X />
            </IconButton>
          </Tooltip>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-medium px-4">File Format:</h3>
          <div className="overflow-x-auto bg-gray-100 p-3 rounded-md mt-2">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray">
                <tr>
                  <th className="border border-gray-300 px-2 py-1">Program</th>
                  <th className="border border-gray-300 px-2 py-1">
                    Event Type
                  </th>
                  <th className="border border-gray-300 px-2 py-1">Class</th>
                  <th className="border border-gray-300 px-2 py-1">Days</th>
                  <th className="border border-gray-300 px-2 py-1">
                    Start Time
                  </th>
                  <th className="border border-gray-300 px-2 py-1">End Time</th>
                  <th className="border border-gray-300 px-2 py-1">
                    Start Date
                  </th>
                  <th className="border border-gray-300 px-2 py-1">End Date</th>
                  <th className="border border-gray-300 px-2 py-1">
                    Institute Name
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">
                    Sample Program
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    Sample Event
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    Sample Class
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    Mon, Wed, Fri
                  </td>
                  <td className="border border-gray-300 px-2 py-1">12:00 PM</td>
                  <td className="border border-gray-300 px-2 py-1">01:00 PM</td>
                  <td className="border border-gray-300 px-2 py-1">
                    9/10/2024
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    9/15/2024
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    Sample Institution
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex flex-col md:flex-row justify-between gap-2">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="mb-4 w-full"
          />
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={!file}
            className="w-55"
            sx={{
              backgroundColor: '#1C2434',
              '&:hover': {
                backgroundColor: '#1C2434',
                opacity: 0.9,
              },
            }}
          >
            <Upload className="mr-2" /> Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadEventModal;
