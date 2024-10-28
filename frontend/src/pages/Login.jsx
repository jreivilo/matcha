import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import CustomLayout from '@/components/MatchaLayout';
import { fetcher } from '@/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors } } = useForm();

  const onSubmitAuth = async (data) => {
    try {
      const responseData = await fetcher(isLogin
        ? `http://localhost:3000/user/login`
        : `http://localhost:3000/user/create-user`,
        data, 'POST');
      if (responseData.success) {
        window.dispatchEvent(new Event('authStateChanged'));
        if (isLogin)
          navigate('/member/dashboard');
        else
          navigate(`/member/fill-profile`);
      } else if (responseData.code === 'USER_NOT_FOUND')
        setError('root.serverError', { type: 400, message: 'Username does not exist' });
      else if (responseData.code === 'INVALID_PASSWORD')
        setError('root.serverError', { type: 400,message: 'Invalid password' });
      else if (responseData.message === "Email or Username already exists")
        setError('root.serverError', { type: 400, message: 'User or email already exists' });
      else {
        setError('root.serverError', { type: 400, message: 'An error occurred while authenticating' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <CustomLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md">
          <Card className="w-[350px] bg-card-background">
            <CardHeader>
              <CardTitle className="text-card-text">{isLogin ? 'Log In' : 'Sign Up'}</CardTitle>
              <CardDescription className="text-card-text">{isLogin ? 'Welcome back' : 'Create your account'}</CardDescription>
              <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-primary">
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitAuth)}>
                <Input
                  type="text"
                  placeholder="Username"
                  className="bg-white text-card-text"
                  {...register('username', { required: 'Username is required' })}
                  />
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-white text-card-text mt-2"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                  />
                {!isLogin && (
                  <>
                    <Input
                      type="email"
                      placeholder="Email"
                      className="bg-white text-card-text mt-2"
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                    />
                    <Input
                      type="text"
                      placeholder="First Name"
                      className="bg-white text-card-text mt-2"
                      {...register('first_name', { required: 'First Name is required' })}
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      className="bg-white text-card-text mt-2"
                      {...register('last_name', { required: 'Last Name is required' })}
                    />
                  </>
                )}
                <Button type="submit" className="w-full mt-4 bg-primary text-text-light">
                  {isLogin ? 'Log In' : 'Sign Up'}
                </Button>
              </form>
            </CardContent>
            {errors.root?.serverError.type === 400 && (
              <div className="flex justify-center">
                <CardFooter className="text-red-500">
                  <p>{errors.root.serverError.message}</p>
                </CardFooter>
              </div>
            )}
          </Card>
        </div>
      </div>
    </CustomLayout>
  );
};

export default Login;

