// import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { env } from './env';

export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        // Try to find user by email first, then by username
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          }
        });

        if (!user) {
          console.log('User not found:', credentials.identifier);
          return null;
        }

        if (!user.password) {
          console.log('User has no password set:', credentials.identifier);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          console.log('Invalid password for user:', credentials.identifier);
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified) {
          console.log('Email not verified for user:', credentials.identifier);
          return null;
        }

        console.log('Authentication successful for user:', credentials.identifier);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }: { user: any; account?: any; profile?: any; email?: any; credentials?: any }) {
      // This callback runs after the authorize function
      // We can add additional checks here if needed
      return true;
    },
  },
};

/**
 * Validate that a user session corresponds to an existing user in the database
 * This helps catch cases where the session contains a stale user ID
 */
export async function validateUserSession(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    return !!user;
  } catch (error) {
    console.error('Error validating user session:', error);
    return false;
  }
}
