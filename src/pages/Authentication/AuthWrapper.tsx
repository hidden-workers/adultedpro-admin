import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../../components/Footer';
import Logo from '../../images/logo/logo.png';
import useMobile from '../../hooks/useMobile';

export const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [isMobile] = useMobile();
  return (
    <div className="relative flex min-h-screen flex-col justify-between">
      <div className="absolute left-4 top-4">
        {pathname == '/' && (
          <Link to="/">
            <img
              alt="Evolo AI"
              src={Logo}
              className={isMobile ? 'h-18 w-18' : ''}
            />
          </Link>
        )}
      </div>
      {children}
      <Footer />
    </div>
  );
};
