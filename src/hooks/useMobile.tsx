import { useState, useEffect } from 'react';
const useMobile = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
  }, []);
  const isMobile = width <= 600;
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };
  return [isMobile];
};
export default useMobile;
