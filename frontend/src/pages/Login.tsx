import React, { useState } from 'react';

import Button from '../components/button';

const Login: React.FC = () => {

	return (
		<div className='flex flex-col m-10'>
			<div className='flex flex-col p-10 gap-4'>
				<Button bgColor='mPrimary' txtColor='white' text='Login with email' onClick={() => console.log('Login')} />
				<Button bgColor='mSecondary' txtColor='black' text='Login with 42' onClick={() => console.log('Login')} />
			
				<p className='text-center text-sm'>
					Don't have an account? <a href="/register">Register</a>
				</p>
			</div>
		</div>
	);
};

export default Login;