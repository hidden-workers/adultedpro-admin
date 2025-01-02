import React, { useState } from 'react';
import { Modal, Tooltip, IconButton, TextField } from '@mui/material';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

// Email Templates
let initialEmailTemplates = [
  {
    description: 'Class Schedule Change Notification',
    subject: '[Important] Class Schedule Change for [Course Name]',
    message: `Dear [Student Name],

Please be informed that the schedule for the course [Course Name] has been updated.

Original Schedule: [Previous Date and Time]

New Schedule: [New Date and Time]

We apologize for any inconvenience this may cause. Please make the necessary adjustments to your calendar.

Thank you for your understanding.

Best regards,
[Institute Name]
[Admin Name]`,
  },
  {
    description: 'Exam Schedule Notification',
    subject: '[Important] Upcoming Exam Schedule for [Course Name]',
    message: `Dear [Student Name],

This is to remind you that the upcoming exam for [Course Name] is scheduled as follows:

Date: [Exam Date]

Time: [Exam Time]

Location: [Exam Venue/Online Details]

Please ensure that you arrive at least 15 minutes early and bring the necessary materials (ID, stationery, etc.).

Best of luck with your preparation!

Best regards,
[Institute Name]
[Admin Name]`,
  },
  {
    description: 'Payment Reminder Notification',
    subject: '[Urgent] Payment Reminder for [Term/Semester]',
    message: `Dear [Student Name],

We noticed that your payment for the [Term/Semester] has not been completed yet. Please be advised that the payment deadline is [Deadline Date].

Amount Due: [Amount]

Payment Link/Instructions: [Payment Portal Link]

Failure to complete the payment may result in a late fee or temporary suspension of access to course materials. We encourage you to make the payment as soon as possible.

If you have already made the payment, please disregard this notice.

Best regards,
[Institute Name]
[Admin Name]`,
  },
  {
    description: 'Event/Workshop Invitation',
    subject: '[Invitation] Join Us for [Event/Workshop Name]',
    message: `Dear [Student Name],

We are excited to invite you to [Event/Workshop Name], which will be held on [Event Date] at [Event Time].

Details:

Topic: [Event Topic]

Location: [Event Venue/Online Platform]

Speaker: [Speaker Name]

This event is a great opportunity to gain valuable insights and network with peers. Don't miss out!

Please register at the following link: [Registration Link]

We hope to see you there!

Best regards,
[Institute Name]
[Admin Name]`,
  },
  {
    description: 'Assignment Deadline Reminder',
    subject: '[Reminder] Assignment Submission Due for [Course Name]',
    message: `Dear [Student Name],

This is a reminder that the assignment for [Course Name] is due on [Due Date].

Please ensure that your submission is uploaded to the [Submission Portal Link] before the deadline to avoid any penalties.

If you have any questions or need clarification, feel free to contact your instructor.

Best regards,
[Institute Name]
[Admin Name]`,
  },
  {
    description: 'Holiday Notification',
    subject: '[Holiday Notice] Institute Closed on [Holiday Name]',
    message: `Dear Students,

Please be informed that the institute will be closed on [Holiday Name] on [Date].

Regular classes will resume on [Reopen Date]. Please use this time to rest, and if needed, catch up on any pending coursework.

Enjoy the holiday!

Best regards,
[Institute Name]
[Admin Name]`,
  },
  {
    description: 'Graduation Ceremony Invitation',
    subject: '[Invitation] Graduation Ceremony for the Class of [Year]',
    message: `Dear [Student Name],

Congratulations! We are thrilled to invite you to the Graduation Ceremony for the Class of [Year] on [Date] at [Time].

Details:

Location: [Ceremony Venue/Virtual Platform]

Dress Code: [Dress Code Details]

Please confirm your attendance by registering at the following link: [Registration Link].

We look forward to celebrating your achievements with you!

Best regards,
[Institute Name]
[Admin Name]`,
  },
  {
    description: 'General Announcement Notification',
    subject: '[Important] [Announcement Title]',
    message: `Dear Students,

We would like to inform you about [Announcement Details]. Please take note of the following:

What: [Brief Explanation of the Announcement]

When: [Relevant Dates/Times]

Who is Affected: [Target Group]

For more details, please refer to [Link to More Information].

Thank you for your attention.

Best regards,
[Institute Name]
[Admin Name]`,
  },
];

// Notification Templates
let initialNotificationTemplates = [
  {
    description: 'Class Schedule Change Notification',
    subject: 'Class Schedule Change for [Course Name]',
    message: `The schedule for [Course Name] has been updated. Check your email for more details.`,
  },
  {
    description: 'Exam Schedule Notification',
    subject: 'Exam Scheduled for [Course Name]',
    message: `Your exam for [Course Name] is on [Exam Date]. Check your email for more details.`,
  },
  {
    description: 'Payment Reminder Notification',
    subject: 'Payment Due for [Term/Semester]',
    message: `Your payment for [Term/Semester] is due by [Deadline Date]. Check your email for payment details.`,
  },
  {
    description: 'Event/Workshop Invitation',
    subject: 'Invitation to [Event/Workshop Name]',
    message: `Join us for [Event Name] on [Event Date]. Check your email for details and registration link.`,
  },
  {
    description: 'Assignment Deadline Reminder',
    subject: 'Assignment Due for [Course Name]',
    message: `Your assignment for [Course Name] is due on [Due Date]. Check your email for details.`,
  },
  {
    description: 'Holiday Notification',
    subject: 'Institute Closed for [Holiday Name]',
    message: `The institute will be closed on [Holiday Name]. Check your email for details.`,
  },
  {
    description: 'Graduation Ceremony Invitation',
    subject: 'Invitation to Graduation Ceremony',
    message: `Congratulations! Join us for the graduation ceremony on [Date]. Check your email for details and registration link.`,
  },
  {
    description: 'General Announcement Notification',
    subject: '[Important Announcement Title]',
    message: `Please read the latest announcement on [Topic]. Check your email for details.`,
  },
];

interface Template {
  description: string;
  subject: string;
  message: string;
}
interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onClose,
  onSelectTemplate,
}) => {
  const [tab, setTab] = useState<'email' | 'notification'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [emailTemplates, setEmailTemplates] = useState<Template[]>(
    initialEmailTemplates,
  );
  const [notificationTemplates, setNotificationTemplates] = useState<
    Template[]
  >(initialNotificationTemplates);
  const [showCustomTemplateForm, setShowCustomTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Template>({
    description: '',
    subject: '',
    message: '',
  });

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    toast.success('Template Selected');
  };
  const handleTabChange = (newTab: 'email' | 'notification') => {
    setTab(newTab);
    setSelectedTemplate(null);
  };
  const handleAddCustomTemplate = () => {
    if (tab === 'email') {
      setEmailTemplates((prev) => [...prev, newTemplate]);
      initialEmailTemplates = [...initialEmailTemplates, newTemplate];
    } else if (tab === 'notification') {
      setNotificationTemplates((prev) => [...prev, newTemplate]);
      initialNotificationTemplates = [
        ...initialNotificationTemplates,
        newTemplate,
      ];
    }
    setShowCustomTemplateForm(false);
    setNewTemplate({ description: '', subject: '', message: '' });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    >
      <div className="max-h-[90vh] min-h-[90vh] w-full max-w-[800px] rounded-lg bg-white px-6 py-4 text-left dark:bg-boxdark overflow-auto space-y-4">
        <div className="flex items-center bg-[#F9FAFB] w-full rounded-md px-4 py-3">
          <div className="flex-grow text-center">
            <h4 className="text-2xl font-semibold text-black dark:text-white">
              Select a Template
            </h4>
          </div>

          <Tooltip title="Close" placement="top">
            <IconButton onClick={onClose}>
              <X />
            </IconButton>
          </Tooltip>
        </div>

        <div className="bg-gray-100 rounded-md shadow-md mb-4">
          <div className="flex w-full">
            <button
              onClick={() => handleTabChange('email')}
              className={`flex-1 px-4 py-2 rounded-l-md border-b-2 ${tab === 'email' ? 'bg-graydark text-white border-graydark' : 'bg-gray-200 border-transparent'}`}
            >
              Email Templates
            </button>
            <button
              onClick={() => handleTabChange('notification')}
              className={`flex-1 px-4 py-2 rounded-r-md border-b-2 ${tab === 'notification' ? 'bg-graydark text-white border-graydark' : 'bg-gray-200 border-transparent'}`}
            >
              Notification Templates
            </button>
          </div>
        </div>

        {selectedTemplate && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-black">Selected Template</h4>
            <div className="border border-slate-200 p-4 rounded bg-gray-50 overflow-auto">
              <p className="font-semibold">Subject:</p>
              <p className="whitespace-normal break-words">
                {selectedTemplate.subject}
              </p>
              <p className="font-semibold mt-2">Message:</p>
              <p className="whitespace-pre-line">{selectedTemplate.message}</p>
            </div>
          </div>
        )}

        <div>
          {tab === 'email' ? (
            <div>
              <h3 className="font-semibold mb-2 text-black">Email Templates</h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {emailTemplates.map((template, index) => (
                  <div
                    key={index}
                    className={` p-4 rounded-md cursor-pointer shadow-md ${selectedTemplate === template ? 'bg-slate-50 text-black  shadow-lg' : ' shadow-md hover:bg-gray-200'}`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <h4 className="font-semibold">{template.description}</h4>
                    <p className="mt-2 text-sm truncate">{template.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-2 text-black">
                Notification Templates
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {notificationTemplates.map((template, index) => (
                  <div
                    key={index}
                    className={` p-4 rounded-md cursor-pointer transition-colors duration-300 ${selectedTemplate === template ? 'bg-slate-50 text-black  shadow-lg' : 'shadow-md hover:bg-gray-200'}`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <h4 className="font-semibold">{template.description}</h4>
                    <p className="mt-2 text-sm truncate">{template.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showCustomTemplateForm ? (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-black">
                Add Custom Template
              </h4>
              <TextField
                label="Template Description"
                fullWidth
                margin="normal"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <TextField
                label="Template Subject"
                fullWidth
                margin="normal"
                value={newTemplate.subject}
                onChange={(e) =>
                  setNewTemplate((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
              <TextField
                label="Template Message"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={newTemplate.message}
                onChange={(e) =>
                  setNewTemplate((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
              />
              <button
                className="flex h-fit justify-center text-sm rounded bg-graydark px-2.5 py-2 font-medium text-gray hover:bg-opacity-90 disabled:bg-primary/50"
                onClick={handleAddCustomTemplate}
              >
                Add Template
              </button>
            </div>
          ) : (
            <button
              className={`bg-graydark  cursor-pointer text-white  rounded w-full p-2 mt-4`}
              onClick={() => setShowCustomTemplateForm(true)}
            >
              Add Custom Template
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TemplateSelector;
