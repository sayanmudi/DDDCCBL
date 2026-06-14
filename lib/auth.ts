import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import { getUsersCollection, getOrganizationSettingsCollection } from './mongodb';

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
          image: profileImage,
          branch_code: user.branch_code,
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // Default 15 minutes in seconds
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role;
        if ((user as any).image) {
          token.image = (user as any).image;
        }
        if ((user as any).id) {
          token.sub = (user as any).id;
        }
        if ((user as any).branch_code !== undefined) {
          token.branch_code = (user as any).branch_code;
        }
        // Set initial login time
        token.loginTime = Date.now();
      }
      
      // Check session timeout on every request
      if (token.loginTime) {
        try {
          const settingsCollection = await getOrganizationSettingsCollection();
          const settings = await settingsCollection.findOne({ settingId: 'global' });
          const timeoutMinutes = settings?.sessionTimeoutMinutes || 15;
          const timeoutMs = timeoutMinutes * 60 * 1000;
          const currentTime = Date.now();
          
          // If session has expired, return null to force logout
          if (currentTime - (token.loginTime as number) > timeoutMs) {
            return null as any;
          }
        } catch (error) {
          console.error('Error checking session timeout:', error);
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
      if (token?.branch_code !== undefined) {
        (session.user as any).branch_code = token.branch_code;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};
