import { Link } from 'react-router-dom';
import LogoDark from '../../images/logo/logo-dark.png';
import Logo from '../../images/logo/logo.png';
import { AuthImage } from '../../assets'; // TODO: place the image in right folder if it is

const LeftSide = () => {
  return (
    <div className="flex flex-col justify-center items-center py-17.5 px-26 text-center h-full">
      <Link className="mb-5.5 inline-block" to="/">
        <img className="hidden dark:block h-10" src={Logo} alt="Logo" />
        <img className="dark:hidden " src={LogoDark} alt="Logo" />
      </Link>
      <p className="mt-3 2xl:px-20">
        Brand, Source, Engage and Hire Talent from Adult Education Centers, all
        in one place.
      </p>

      <span className="mt-15 inline-block">
        <img src={AuthImage} alt="" />
      </span>
    </div>
  );
};

export default LeftSide;
