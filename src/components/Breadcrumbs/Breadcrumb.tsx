import { Link, useLocation } from 'react-router-dom';
import useMobile from '../../hooks/useMobile';
interface BreadcrumbProps {
  pageName: string;
  size?: number;
}
const Breadcrumb = ({ pageName, size }: BreadcrumbProps) => {
  const { pathname } = useLocation();
  const page = pathname.includes('employer') ? 'Employer' : 'Institution';
  const [isMobile] = useMobile();

  return (
    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2
        className={` font-semibold text-black dark:text-white ${isMobile ? 'text-xl' : 'text-title-md2'}`}
      >
        {pageName}{' '}
        {size && (
          <span
            className={`font-medium  ml-1 ${isMobile ? 'text-lg' : 'text-title-sm'}`}
          >
            ({size} Total)
          </span>
        )}
      </h2>

      {!isMobile && (
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link
                className="font-medium"
                to={
                  page == 'Employer'
                    ? '/employer/dashboard'
                    : '/institution/dashboard'
                }
              >
                Dashboard /
              </Link>
            </li>
            <li className="font-medium text-primary">{pageName}</li>
          </ol>
        </nav>
      )}
    </div>
  );
};

export default Breadcrumb;
