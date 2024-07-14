import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmitAuth = async (data) => {
    try {
      let apiUrl = isLogin
        ? `http://localhost:3000/user/login`
        : `http://localhost:3000/user/create-user`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(data),
          credentials: 'include',

        });
      const responseData = await response.json();
      if (responseData.success) {
        if (isLogin)
          navigate('/member/dashboard');
        else
          navigate(`/fill-profile?username=${encodeURIComponent(data.username)}`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
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
      {errors[Object.keys(errors)[0]] && (
        <CardFooter>
          <p className="text-red-500">{errors[Object.keys(errors)[0]].message}</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default AuthForm;