// AddJobModal.tsx
import React, { useState } from 'react';

const AddJobModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: any;
  onClose: any;
  onSubmit: any;
}) => {
  const [title, setTitle] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [applicants, setApplicants] = useState('');

  const handleSubmit = () => {
    onSubmit({ title, pay, location, datePosted, applicants });
    onClose();
  };

  return (
    <div
      style={{
        display: isOpen ? 'block' : 'none',
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        zIndex: '999',
      }}
      onClick={onClose}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            padding: '1rem',
            width: '35vw', // Adjust the width as needed
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div className="font-bold text-[#3c50e0] dark:text-bodydark">
              Please Provide Details:
            </div>
            <button
              style={{
                background: 'blue',
                border: 'none',
                color: '#333',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              &times;
            </button>
          </div>
          {/* Input fields for job details */}
          <input
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <input
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            type="text"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            placeholder="Pay"
          />
          <input
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
          />
          <input
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            type="text"
            value={datePosted}
            onChange={(e) => setDatePosted(e.target.value)}
            placeholder=""
          />
          <input
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            type="text"
            value={applicants}
            onChange={(e) => setApplicants(e.target.value)}
            placeholder="Applicants"
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              style={{
                backgroundColor: '#3c50e0',
                color: 'white',
                padding: '0.7rem 1.2rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={handleSubmit}
            >
              Add Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddJobModal;
