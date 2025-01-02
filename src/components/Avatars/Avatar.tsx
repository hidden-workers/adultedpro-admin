import React from 'react';

interface AvatarProps {
  src: string;
  initial: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({ src, initial, size = 'sm' }) => {
  let widthClass = '';
  let heightClass = '';
  let fontSizeClass = '';

  switch (size) {
    case 'xs':
      widthClass = 'w-8';
      heightClass = 'h-8';
      fontSizeClass = 'text-lg font-medium';
      break;
    case 'sm':
      widthClass = 'w-11';
      heightClass = 'h-11';
      fontSizeClass = 'text-xl font-medium';
      break;
    case 'md':
      widthClass = 'w-16';
      heightClass = 'h-16';
      fontSizeClass = 'text-2xl font-semibold';
      break;
    case 'lg':
      widthClass = 'w-32';
      heightClass = 'h-32';
      fontSizeClass = 'text-4xl font-bold';
      break;
    case 'xl':
      widthClass = 'w-44';
      heightClass = 'h-44';
      fontSizeClass = 'text-8xl font-bold';
      break;
    default:
      break;
  }

  return (
    <div className="flex items-center justify-center">
      {src ? (
        <img
          src={src}
          alt="User"
          className={`rounded-full object-cover ${widthClass} ${heightClass}`}
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-full bg-black capitalize text-white ${widthClass} ${heightClass} ${fontSizeClass} `}
        >
          {initial}
        </span>
      )}
    </div>
  );
};

export default Avatar;
