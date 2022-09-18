import React from 'react';
import Navbar from './navbar';
import Footer from './footer';

import { ApolloProvider } from '@apollo/client';
import client from '../../pages/api/graphql';

interface Props {
  children?: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <ApolloProvider client={client}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </ApolloProvider>
    </>
  );
};

export default Layout;
