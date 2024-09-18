// libs
import CustomLayout from '@/components/MatchaLayout';
import React from 'react';
import { useNavigate } from 'react-router-dom';
// homemade components
import { useUser } from '@/components/UserProvider';
import { useRedirectIfLoggedOut } from '@/hooks/useRedirectLogout';

const Dashboard = () => {
  useRedirectIfLoggedOut();

  const navigate = useNavigate();
  const { user } = useUser();


  const goToProfile = () => {
      navigate(`/member/profile?username=${encodeURIComponent(user.username)}`);
  }

  return (
    <CustomLayout>
      <div className="container mx-auto mt-10 p-5">
        <section className="text-center mb-20">
          <h2 className="text-5xl font-bold text-text-light mb-4">Your Profiles</h2>
          <p className="text-xl text-text-light mb-8">Welcome {user.username}, View your profiles and start a match.</p>
          <button onClick={goToProfile} className="bg-primary text-text-light font-bold rounded-lg px-4 py-2 hover:bg-primary-light">
            See my Profile
          </button>
        </section>
      </div>
    </CustomLayout>
  );
};

export default Dashboard;
