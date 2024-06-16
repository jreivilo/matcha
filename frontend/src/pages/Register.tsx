import React, { useState } from 'react';

const Register: React.FC = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value);
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		// Add your registration logic here
	};

	return (
		<div>
			<h1>Register</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Username:
					<input type="text" value={username} onChange={handleUsernameChange} />
				</label>
				<br />
				<label>
					Email:
					<input type="email" value={email} onChange={handleEmailChange} />
				</label>
				<br />
				<label>
					Password:
					<input type="password" value={password} onChange={handlePasswordChange} />
				</label>
				<br />
				<button type="submit">Register</button>
			</form>
		</div>
	);
};

export default Register;