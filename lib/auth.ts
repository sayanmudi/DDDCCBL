import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import { getUsersCollection } from './mongodb';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'User ID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const users = await getUsersCollection();
        const user = await users.findOne({ userId: credentials.username });

        if (!user || user.password !== credentials.password) {
          return null;
        }

        const profileImage = user.image;

        return {
          id: user.userId,
          name: user.name,
          role: user.role,
          image: profileImage
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        if ((user as any).image) {
          token.image = (user as any).image;
        }
        if ((user as any).id) {
          token.sub = (user as any).id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user ?? { name: null };
      if (token?.role) {
        (session.user as any).role = token.role;
      }
      if (token?.sub) {
        (session.user as any).id = token.sub;
      }
      if (token?.image) {
        (session.user as any).image = token.image;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};
