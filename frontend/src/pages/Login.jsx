import React from 'react';
// components
import AuthForm from '../components/AuthForm';
import CustomLayout from '@/components/MatchaLayout';

const Login = () => {
  return (
    <CustomLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </CustomLayout>
  );
};

export default Login;
