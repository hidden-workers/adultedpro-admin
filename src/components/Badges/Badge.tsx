import React from 'react';

type BadgeVariant =
  | 'primary'
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

const Badge: React.FC<BadgeProps> = ({ text, variant = 'primary' }) => {
  const getBadgeColor = (variant: BadgeVariant): string => {
    switch (variant) {
      case 'primary':
        return 'bg-meta-5 text-white';
      case 'neutral':
        return 'bg-meta-4 text-white';
      case 'success':
        return 'bg-meta-3 text-white';
      case 'danger':
        return 'bg-meta-1 text-white';
      case 'warning':
        return 'bg-meta-6 text-white';
      case 'info':
        return 'bg-meta-10 text-white';
      default:
        return 'bg-meta-5 text-white';
    }
  };

  return (
    <div
      className={`rounded-full px-2 py-1 text-center text-sm ${getBadgeColor(variant)}`}
    >
      <h3 className="font-medium text-meta ">{text}</h3>
    </div>
  );
};

export default Badge;
