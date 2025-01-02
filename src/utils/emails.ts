import { EmailData } from '../interfaces';
import { sendEmail } from '../store/reducers/emailSlice';

export const sendInstitutionSignUpEmail = ({
  name,
  email,
  role,
  instituteName,
}) => {
  const emailToAdmin: EmailData = {
    to: 'support@adultedpro.com',
    template: {
      name: 'institution-signup',
      data: {
        name: name,
        email: email,
        role: role,
        instituteName: instituteName,
      },
    },
    isTest: localStorage.getItem('isTest') === 'true',
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };

  sendEmail(emailToAdmin);
};
