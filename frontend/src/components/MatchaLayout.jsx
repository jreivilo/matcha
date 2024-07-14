import React from 'react';
import Header from './Header';

const CustomLayout = ({ children }) => {
  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-background-start to-background-end">
      <Header />
      <div className="container mx-auto p-5">
        {children}
      </div>
      <footer className="footer--pin mt-20 bg-white bg-opacity-10 backdrop-blur-md py-10">
        <div className="container mx-auto text-center text-text-light">
          <p>&copy; 2024 Matcha Dating. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomLayout;