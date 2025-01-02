import DefaultLayout from '../../layout/DefaultLayout';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import CLoader from '../../common/CLoader';
import { useEffect, useState } from 'react';
import { updateUserSubscriptionStatus } from '../../store/reducers/userSlice';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.user);

  const handleSubscribeUser = async () => {
    setIsLoading(true);
    try {
      // first check if the customr is available in stripe or not
      await updateUserSubscriptionStatus({
        email: user?.email,
        isSubscribed: true,
      });
    } catch (error) {
      alert(JSON.stringify(error));
    } finally {
      setIsLoading(false);
      navigate('/dashboard/employerdashboard');
    }
  };

  useEffect(() => {
    if (user?.email) {
      handleSubscribeUser();
    }
  }, [user]);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Subscription" />

        <div className="flex flex-col gap-4">
          <div className="bg-gray-300  mt-4">
            <div className="mx-5 pb-10 ">
              {isLoading && (
                <div className="flex justify-center items-center w-full h-[70vh] m-auto  ">
                  <CLoader size="lg" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SubscriptionSuccessPage;
