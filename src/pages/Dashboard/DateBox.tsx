// import React, { useState } from 'react';
// import EventModal from './EventModal'; // Create a modal for adding events

// const DateBox = ({ date }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleAddEvent = () => {
//     setIsModalOpen(true);
//   };

//   return (
//     <div
//     style={{
//       border: '1px solid #ccc',
//       padding: '10px',
//       textAlign: 'center',
//       margin: '5px',
//       cursor: 'pointer',
//     }}
//     onClick={handleAddEvent}
//   >
//     <span style={{ display: 'block', marginBottom: '5px' }}>{date.getDate()}</span>
//     <button>Add Event</button>

//     {/* Event Modal */}
//     {isModalOpen && (
//       <EventModal
//         date={date}
//         onClose={() => setIsModalOpen(false)}
//       />
//     )}
//   </div>
//   );
// };

// export default DateBox;
