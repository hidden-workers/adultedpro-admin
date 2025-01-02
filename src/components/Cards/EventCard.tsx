import { Event } from '../../interfaces';
import CardsOne from '../../images/cards/cards-01.png';
import { extractDateTimeFromTimestamp } from '../../utils/functions';
import { useStateContext } from '../../context/useStateContext';

// const MediaLink = ({ path, type }) => {
//   const renderMedia = () => {
//     switch (type) {
//       case 'image':
//         return <img src={path} alt="Media" />;
//       case 'video':
//         return (
//           <video width="100%" height="auto" controls>
//             <source src={path} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         );
//       case 'document':
//         return (
//           <iframe
//             src={path}
//             title="Document"
//             width="100%"
//             height="500px"
//             frameBorder="0"
//           ></iframe>
//         );
//       default:
//         return null;
//     }
//   };

//   return <Link to="#" className="block px-4">{renderMedia()}</Link>;
// };
const EventCard = ({
  event,
  setSelectedEvent,
}: {
  event: Event;
  setSelectedEvent: any;
}) => {
  const { setShowEventViewModal } = useStateContext();

  return (
    <div
      onClick={() => {
        setSelectedEvent(event);
        setShowEventViewModal(true);
      }}
      className="cursor-pointer rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <div className="flex items-start gap-3 py-5 px-6">
        <div className="h-14 w-14 rounded-full">
          {event?.url ? (
            <img
              src={event?.url}
              alt="User"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="w-11 h-11 capitalize rounded-full bg-black text-white flex justify-center items-center ">
              {event?.contactName?.charAt(0)}
            </span>
          )}
        </div>
        <div style={{ width: 'calc(100% - 3.5rem)' }}>
          <div className="flex justify-between items-center w-full ">
            <h4 className="font-bold text-black dark:text-white p-1 capitalize">
              {event?.hostName}
            </h4>
            {event?.status && (
              <span
                className={`${event?.status.toString().toLowerCase() == 'approved' ? 'text-green-500 border-green-500' : event?.status.toString().toLowerCase() == 'pending' ? 'text-blue-500 border-blue-500' : 'text-red-500 border-red-500'} capitalize border px-1 py-0.5 rounded-full `}
              >
                {event?.status}
              </span>
            )}
          </div>
          <p className="text-sm font-medium p-1">{event?.contactTitle}</p>
          <p className="text-sm font-medium p-1">{event?.city}</p>
          <p className="text-sm font-medium p-1 ">{event?.state}</p>
          <p className="text-sm font-medium p-1">
            {extractDateTimeFromTimestamp(event?.eventDate).date}
          </p>
          <p className="text-sm font-medium p-1">
            {extractDateTimeFromTimestamp(event?.eventFrom).time +
              ' - ' +
              extractDateTimeFromTimestamp(event?.eventTo).time}
          </p>
        </div>
      </div>

      <div className="block px-4 w-full h-[16rem] ">
        <img
          src={event?.carouselImages?.[0] || CardsOne}
          alt="Cards"
          className="w-full h-full rounded-sm object-cover "
        />
      </div>
      {/* <MediaLink path={cardImageSrc} type={Image} />; */}

      <div className="p-6">
        <h4 className="mb-3 text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary">
          {event?.title}
        </h4>
        <p>{event?.description}</p>
      </div>
    </div>
  );
};

export default EventCard;
