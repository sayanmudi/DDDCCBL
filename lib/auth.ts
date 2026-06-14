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

        // Check if user is active (default to true if not set)
        const isActive = user.isActive !== false;
        if (!isActive) {
          throw new Error('User Deactivated. Please contact administrator or the Branch Manager');
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
    async jwt({ token, user, trigger, session }) {
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
      
      // Handle session updates (e.g., profile image changes)
      if (trigger === 'update' && session) {
        if (session.image !== undefined) {
          token.image = session.image;
        }
      }
      
      // Check session timeout on every request (but not during updates)
      if (token.loginTime && trigger !== 'update') {
        try {
          const settingsCollection = await getOrganizationSettingsCollection();
          const settings = await settingsCollection.findOne({ settingId: 'global' });
          const timeoutMinutes = settings?.sessionTimeoutMinutes || 15;
          const timeoutMs = timeoutMinutes * 60 * 1000;
          const currentTime = Date.now();
          
          // If session has expired, mark token as expired
          if (currentTime - (token.loginTime as number) > timeoutMs) {
            token.expired = true;
          }
        } catch (error) {
          console.error('Error checking session timeout:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // If token is expired, return null to force logout
      if (token?.expired) {
        return null as any;
      }
      
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
