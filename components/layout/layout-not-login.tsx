import React from 'react';
import Navbar from './navbar';
import Footer from './footer';

interface Props {
  children?: React.ReactNode;
}

const LayoutNotLogin: React.FC<Props> = ({ children }) => {
  return (
    <>
      <div
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <Navbar />
      </div>
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default LayoutNotLogin;
