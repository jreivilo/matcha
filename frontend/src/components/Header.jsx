import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="p-5 bg-white bg-opacity-10 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold text-text-light"><Link className="text-secondary" to="/">Matcha</Link></h1>
        <nav>
          <Button variant="outline" className="mr-2 text-text-light">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button className="bg-primary text-text-light">
            <Link to="/login">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;