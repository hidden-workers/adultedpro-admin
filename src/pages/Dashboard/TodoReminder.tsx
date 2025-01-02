import React, { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { Todo } from '../../interfaces';
import { X } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';

interface ReminderTickerProps {
  todos: Todo[];
}

const ReminderTicker: React.FC<ReminderTickerProps> = ({ todos }) => {
  const [reminders, setReminders] = useState<Todo[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const now = new Date();
    const reminderSet = new Set<Todo>();

    todos.forEach((todo) => {
      let dueDate: Date | null = null;

      if (!todo.dueDateTime) {
        console.warn(`Todo "${todo.description}" has a null due date`);
        return; // Skip processing this todo
      }

      if (typeof todo.dueDateTime === 'string') {
        dueDate = new Date(todo.dueDateTime);
      } else if (todo.dueDateTime instanceof Date) {
        dueDate = todo.dueDateTime;
      } else if (todo.dueDateTime?.seconds) {
        dueDate = todo.dueDateTime.toDate();
      }

      if (dueDate instanceof Date && !isNaN(dueDate.getTime())) {
        const diffMinutes = differenceInMinutes(dueDate, now);

        if (diffMinutes > 0 && diffMinutes <= 4320 && !todo.completed) {
          reminderSet.add(todo);
        }
      } else {
        console.error(`Invalid due date for task: "${todo.description}"`);
      }
    });

    setReminders(Array.from(reminderSet));
  }, [todos]);

  if (reminders.length === 0 || !visible) {
    return null;
  }
  return (
    <div className="relative bg-[#800000] text-white py-2 px-4 mb-4 flex items-center">
      <Marquee gradient={false} speed={70} className="flex-grow">
        {reminders.map((todo, index) => (
          <span key={index} className="mr-8">
            {index + 1}- "{todo.description}" is due on{' '}
            {todo.dueDateTime instanceof Date
              ? todo.dueDateTime.toLocaleDateString()
              : new Date(todo.dueDateTime).toLocaleDateString()}
          </span>
        ))}
      </Marquee>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2"
        aria-label="Close"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default ReminderTicker;
