import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_GRAPHQL,
});

const authLink = setContext((_, { headers }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      ...headers,
      authorization: user?.token ? `Bearer ${user?.token}` : "",
    }
  }
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache
})

export default client;