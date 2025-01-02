import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export const sendContactForm = async (contactForm) => {
  try {
    if (!contactForm?.contactFormLocation) {
      alert(
        'Please specify contactForm and contactFormLocation for submitting contact form details',
      );
      return;
    }

    const data = {
      to: ['contact@hiddenworkers.org'],
      name: contactForm.name,
      institutionName: contactForm.institution ?? '-',
      email: contactForm.email,
      phone: contactForm.phone,
      message: contactForm.message,
      businessName: contactForm.businessName ?? '-',
      contactFormLocation: contactForm.contactFormLocation,
    };

    sendEmail({ templateName: 'contact-form', data });
  } catch (e) {
    alert(e);
    console.error('exception', e);
  }
};

export const sendJobApplicationEmail = async ({ job, applicant }) => {
  try {
    if (!job || !applicant) {
      alert('Please specify job and applicant data for application email');
      return;
    }

    const data = {
      to: ['contact@hiddenworkers.org'], // undo me ["contact@hiddenworkers.org", job.employerEmail, job.contactEmail]
      applicantEmail: applicant.email ?? '',
      applicantName: applicant.name ?? applicant.email ?? '',
      applicantPhone: applicant.phone ?? '',
      applicantSkills: Array.isArray(applicant.skills)
        ? applicant.skills.join(', ')
        : (applicant.skills ?? ''),
      applicantMissionStatement: applicant.bio ?? '',
      jobTitle: job.title ?? '',
      jobCompany: job.employerName ?? '',
      jobDescription: job.description ?? '',
    };

    sendEmail({ templateName: 'job-application-email', data });
  } catch (e) {
    alert(e);
    console.error('exception', e);
  }
};

const sendEmail = async ({ templateName, data }) => {
  const docId = uuidv4();
  const mailRef = collection(db, 'emails');
  const mail = {
    to: data.to,
    template: {
      name: templateName,
      data,
    },
  };

  return await setDoc(doc(mailRef, docId), mail, {
    merge: true,
  });
};
