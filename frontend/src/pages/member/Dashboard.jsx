// libs
import CustomLayout from '@/components/MatchaLayout';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// homemade components
import { useUser } from '@/components/providers/UserProvider';
import ChatPanel from '@/components/Chat'

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();


  const goToProfile = () => {
      navigate(`/member/profile?username=${encodeURIComponent(user.username)}`);
  }

  return (
    <CustomLayout>
      <div className="container mx-auto mt-10 p-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <section className="text-center mb-20">
          <h2 className="text-5xl font-bold text-text-light mb-4">Your Profiles</h2>
          <p className="text-xl text-text-light mb-8">Welcome {user.username}, View your profiles and start a match.</p>
          <button onClick={goToProfile} className="bg-primary text-text-light font-bold rounded-lg px-4 py-2 hover:bg-primary-light">
            See my Profile
          </button>
        </section>
        <section>
          <h2 className='text-5xl font-bold text-text-light mb-4'>Explore profiles</h2>
          <p className='text-xl text-text-light mb-8'>Find profiles that match your interests</p>
          <button className='bg-primary text-text-light font-bold rounded-lg px-4 py-2 hover:bg-primary-light'>
            <Link to="/member/explore">Explore</Link>
          </button>
        </section>
        <section>
          <h2 className='text-5xl font-bold text-text-light mb-4'>Conversations</h2>
          <Link to="/member/chat">Get chatting</Link>
        </section>
      </div>
    </CustomLayout>
  );
};

export default Dashboard;
