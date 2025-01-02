// import { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../store/store';

const Footer = () => {
  // const [partnerLogo, setPartnerLogo] = useState(undefined);
  // const location = useLocation();
  // const { pathname } = location;
  // const { partner } = useSelector((state: RootState) => state.partner);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   const isPathName = pathname.startsWith('/partner');
  //   if (partner && isPathName) {
  //     setPartnerLogo({
  //       photoUrl: partner.photoUrl,
  //       logoName: partner.name,
  //     });
  //   }
  // }, [partner, dispatch, pathname]);

  return (
    <footer className="pt-6 pb-4 bg-[#1C2434] text-white font-medium mt-auto">
      <div className="w-full flex flex-col justify-center items-center gap-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full md:max-w-3xl">
          <ul className="menu-footer flex flex-col md:flex-row gap-4 md:gap-10 font-medium text-center">
            {/* <li>
              <a
                target="_blank"
                href="https://adultedpro.com/student"
                rel="noreferrer"
              >
                Find Work
              </a>
            </li> */}
            {/* <li>
              <a
                target="_blank"
                href="https://adultedpro.com/employer"
                rel="noreferrer"
              >
                Find Workers
              </a>
            </li> */}
            {/* <li>
              <a
                target="_blank"
                href="https://adultedpro.com/institutions"
                rel="noreferrer"
              >
                Institutions
              </a>
            </li> */}
            <li>
              <a
                target="_blank"
                href="https://goevolo.com/privacy-policy/"
                rel="noreferrer"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="https://goevolo.com/terms-of-service/"
                rel="noreferrer"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="https://goevolo.com/cookie-policy/"
                rel="noreferrer"
              >
                Cookies Policy
              </a>
            </li>
          </ul>
        </div>

        <div
          className="mt-3 font-medium text-center"
          style={{ whiteSpace: 'nowrap' }}
        >
          <p>©adultedpro.com 2024. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
