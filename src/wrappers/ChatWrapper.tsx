import React, { ReactNode } from 'react';
interface ChatWrapperProps {
  children: ReactNode;
}

const ChatWrapper: React.FC<ChatWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default ChatWrapper;
