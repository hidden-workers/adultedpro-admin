import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateBulkEvent } from '../../store/reducers/eventSlice';
import { EventFile } from '../../interfaces';
import { Tooltip, IconButton } from '@mui/material';
import { X } from 'lucide-react';

interface UpdateBulkEventModalProps {
  open: boolean;
  onClose: () => void;
  bulkEvent: EventFile | null;
}

const UpdateBulkEventModal: React.FC<UpdateBulkEventModalProps> = ({
  open,
  onClose,
  bulkEvent,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<EventFile | null>(null);

  useEffect(() => {
    setFormData(bulkEvent || null);
  }, [bulkEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = () => {
    if (formData) {
      dispatch<any>(updateBulkEvent(formData));
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="flex justify-between text-bold items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
        <DialogTitle
          className="text-2xl font-semibold text-black dark:text-white flex items-center gap-2"
          style={{ fontWeight: 'bold' }}
        >
          Update Event
        </DialogTitle>
        <div className="flex justify-end items-center gap-4.5 w-fit">
          <Tooltip title="Close" placement="top">
            <IconButton onClick={onClose}>
              <X />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <DialogContent>
        {formData && (
          <>
            <TextField
              margin="dense"
              name="program"
              label="Program"
              fullWidth
              value={formData.program || ''}
              onChange={handleChange}
              className="bg-[#F9FAFB]"
            />
            <TextField
              margin="dense"
              name="eventType"
              label="Event Type"
              fullWidth
              value={formData.eventType || ''}
              onChange={handleChange}
              className="bg-[#F9FAFB]"
            />
            <TextField
              margin="dense"
              name="startDate"
              label="Start Date"
              fullWidth
              value={formData.startDate || ''}
              onChange={handleChange}
              className="bg-[#F9FAFB]"
            />
            <TextField
              margin="dense"
              name="endDate"
              label="End Date"
              fullWidth
              value={formData.endDate || ''}
              onChange={handleChange}
              className="bg-[#F9FAFB]"
            />
            <TextField
              margin="dense"
              name="startTime"
              label="Start Time"
              fullWidth
              value={formData.startTime || ''}
              onChange={handleChange}
              className="bg-[#F9FAFB]"
            />
            <TextField
              margin="dense"
              name="endTime"
              label="End Time"
              fullWidth
              value={formData.endTime || ''}
              onChange={handleChange}
              className="bg-[#F9FAFB]"
            />
            <TextField
              margin="dense"
              name="days"
              label="Days"
              fullWidth
              value={formData.days || ''}
              onChange={handleChange}
              className="bg-[#F9FAFB]"
            />
          </>
        )}
      </DialogContent>
      <DialogActions className="flex space-x-2">
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#333333',
            color: 'white',
            borderColor: '#333333',
            borderWidth: '1px',
            fontSize: '12px',
            '&:hover': {
              backgroundColor: '#444444',
              borderColor: '#444444',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#333333',
            color: 'white',
            borderColor: '#333333',
            borderWidth: '1px',
            fontSize: '12px',
            '&:hover': {
              backgroundColor: '#444444',
              borderColor: '#444444',
            },
          }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBulkEventModal;
