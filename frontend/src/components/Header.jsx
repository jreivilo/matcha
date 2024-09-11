import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  // get username from local storage
  const user = localStorage.getItem('user');
  console.log(user);
  const { username, id } = JSON.parse(user) || {};

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <header className="p-5 bg-white bg-opacity-10 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold text-text-light"><Link className="text-secondary" to="/">Matcha</Link></h1>
        <nav>
          {!username ? (
            <Button variant="outline" className="mr-2 text-text-light">
              <Link to="/login">Login/Register</Link>
            </Button>
            ) : (
              <div>  
                <h2>{username} is logged in</h2>
                <Button variant="outline" className="mr-2 text-text-light" onClick={handleLogout}>
                  <Link to="/">Logout</Link>
                </Button>
              </div>
            )
          }
          </nav>
      </div>
    </header>
  );
};

export default Header;