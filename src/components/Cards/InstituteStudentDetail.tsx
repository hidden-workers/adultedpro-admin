import React from 'react';
import { User, Employer, UserApplication } from '../../interfaces';
import { Program } from '../../interfaces';
interface Props {
  student: User;
  userApplications: UserApplication[];
  employers: Employer[];
}

const InstituteStudentDetail: React.FC<Props> = ({
  student,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userApplications,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  employers,
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  };

  const detailStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    background: '#f9f9f9',
    borderRadius: '5px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '10px',
  };

  const labelStyles: React.CSSProperties = {
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  return (
    <div style={containerStyles}>
      <h2>Student Profile</h2>
      <div style={detailStyles}>
        <span style={labelStyles}>Name:</span> {student.name}
      </div>
      <div style={detailStyles}>
        <span style={labelStyles}>TagLine:</span> {student.tagLine}
      </div>
      <div style={detailStyles}>
        <span style={labelStyles}>Bio:</span> {student.bio}
      </div>
      <div style={detailStyles}>
        <span style={labelStyles}>Program:</span>
        {typeof student.program === 'object' && student.program !== null
          ? (student.program as Program).name
          : String(student.program)}
      </div>
      <div style={detailStyles}>
        <span style={labelStyles}>City:</span> {student.city}
      </div>
      <div style={detailStyles}>
        <span style={labelStyles}>State:</span> {student.state}
      </div>
      {/* Add more fields as necessary */}
    </div>
  );
};

export default InstituteStudentDetail;
