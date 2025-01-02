import { Check, Loader2, PauseCircle } from 'lucide-react';
import React from 'react';

interface StatusItemProps {
  name: string;
  status: number;
  total: number;
  isDelete: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({
  name,
  status,
  total,
  isDelete = false,
}) => {
  const icon = {
    0: <PauseCircle className="text-gray-500" />,
    1: <Loader2 className="animate-spin text-blue-500" />,
    2: <Check className="text-green-500" />,
  };

  const statusText = {
    0: `waiting to ${isDelete ? 'delete' : 'update'} ${name} - Total Records: ${total}`,
    1: `updating ${name} - Total Records: ${total}`,
    2: `completed ${isDelete ? 'deleting' : 'updating'} ${name} - Total Records: ${total}`,
  };

  return (
    <div className="flex items-center space-x-2">
      {icon[status]}
      <span className="capitalize">{statusText[status]}</span>
    </div>
  );
};

export default StatusItem;
