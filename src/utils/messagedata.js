export const activeUser = [
  {
    text: 'Claire Baker',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
    lastmessage: 'Hi,Calrie!How the search going?',
    time: '3:52pm',
  },
  {
    text: 'Emily Davidson',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
    lastmessage: 'Emily,I think you need to do is',
    time: '2:00pm',
  },
  {
    text: 'Raj Patel',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
    lastmessage: 'Emily,I think you need to do is',
    time: '2:00pm',
  },
  {
    text: 'Mary wu',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
    lastmessage: 'Emily,I think you need to do is',
    time: '2:00pm',
  },
  {
    text: 'Anita Campbell',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
    lastmessage: 'Emily,I think you need to do is',
    time: '2:00pm',
  },
];

export const inactiveUser = [
  {
    text: 'Mar Chen',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
  },
  {
    text: 'Emily',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
  },
  {
    text: 'Raj Patel',
    image: '/assets/imgs/partners/hero-azusa/1.jpg',
  },
];

export const get_combinedusersChatsId = (senderId, receiverId) => {
  return senderId > receiverId ? senderId + receiverId : receiverId + senderId;
};
