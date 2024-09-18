import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const user = localStorage.getItem('user');
  const { username, id } = JSON.parse(user) || {};

  const handleLogout = async () => {
    localStorage.removeItem('user');
    const response = await fetch('/user/logout', {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      window.location.reload();
    } else {
      console.error('Error logging out:', response.status);
    }
  };

  return (
    <header className="p-5 bg-white bg-opacity-10 backdrop-blur-md shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold text-text-light">
          <Link className="text-secondary hover:underline" to="/">Matcha</Link>
        </h1>
        <nav className="flex items-center">
          {!username ? (
            <Button variant="outline" className="mr-2 text-text-light">
              <Link to="/login">Login/Register</Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-text-light">{username}</span>
              <Button variant="outline" className="text-text-light" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};


export default Header;