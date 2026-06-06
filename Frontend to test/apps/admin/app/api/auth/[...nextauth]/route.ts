import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ENDPOINT_API } from '../../../../config/api_endpoint';

if (process.env.NEXTAUTH_URL_ADMIN) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL_ADMIN;
}

if (process.env.NEXTAUTH_SECRET_ADMIN) {
  process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET_ADMIN;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_ADMIN || 'https://identity.physio.agregatech.com';
        
        try {
          const res = await fetch(`${API_BASE_URL}${ENDPOINT_API.AUTH.LOGIN}`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: { 'Content-Type': 'application/json' },
          });

          const data = await res.json();

          if (res.ok && data.user) {
            return {
              ...data.user,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              permissions: data.permissions,
            };
          }
          
          console.error('Login failed in authorize:', {
            status: res.status,
            data,
          });
          return null;
        } catch (error) {
          console.error('Login error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.user = token;
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    },
  },
  secret: process.env.NEXTAUTH_SECRET_ADMIN,
});

export { handler as GET, handler as POST };
