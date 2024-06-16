import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import Register from './pages/Register';
import LoginMail from './pages/LoginMail';
import Login42 from './pages/Login42';

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/login-with-mail" element={<LoginMail />} />
				<Route path="/login-with-42" element={<Login42 />} />
				<Route path="/register" element={<Register />} />
			</Routes>
		</Router>
	);
};

export default App;
