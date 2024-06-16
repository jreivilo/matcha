import React from 'react';

const Login42: React.FC = () => {
	const handleLogin = () => {
		// Handle login with 42 OAuth here
	};

	return (
		<div>
			<h1>Login with 42</h1>
			<button onClick={handleLogin}>Login</button>
		</div>
	);
};

export default Login42;