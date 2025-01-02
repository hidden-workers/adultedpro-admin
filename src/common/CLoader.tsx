import React from 'react';

type LoaderProps = {
  fit?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'screen';
};

const CLoader: React.FC<LoaderProps> = ({ size }) => {
  const getSizeClassName = () => {
    switch (size) {
      case 'xs':
        return 'w-4 h-4 border-[1px] border-solid border-primary border-t-transparent';
      case 'sm':
        return 'w-6 h-6 border-[1px] border-solid border-primary border-t-transparent';
      case 'md':
        return 'w-8 h-8 border-[2px] border-solid border-primary border-t-transparent';
      case 'lg':
        return 'w-12 h-12 border-[3px] border-solid border-primary border-t-transparent';
      case 'xl':
        return 'w-16 h-16 border-[4px] border-solid border-primary border-t-transparent';
      case 'screen':
        return 'w-16 h-16 border-[4px] border-solid border-primary border-t-transparent';
      default:
        return '';
    }
  };

  return (
    <div
      className={`flex items-center justify-center dark:bg-black ${size == 'screen' ? 'w-full h-screen' : 'w-fit h-fit'}`}
    >
      <div className={`${getSizeClassName()} animate-spin rounded-full`} />
    </div>
  );
};

export default CLoader;
