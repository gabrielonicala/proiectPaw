// import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { getUniqueUsername } from './username-generator';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (user) {
        console.log('Session callback - user object:', { id: user.id, email: user.email, username: user.username });
        session.user.id = user.id;
        session.user.username = user.username;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }: { user: any; account?: any; profile?: any; email?: any; credentials?: any }) {
      // Let PrismaAdapter handle everything for Google OAuth
      if (account?.provider === "google") {
        console.log('Google OAuth sign-in attempt for:', user.email);
        return true; // Allow PrismaAdapter to handle user/account creation
      }
      
      return true;
    },
  },
  events: {
    async createUser({ user }: { user: any }) {
      // Setup new Google users
      if (user.email && !user.username) {
        try {
          const username = await getUniqueUsername();
          const now = new Date();
          const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          
          await db.user.update({
            where: { id: user.id },
            data: { 
              username,
              emailVerified: now, // Google users are pre-verified
              // For testing: give tribute subscription for 1 year
              subscriptionPlan: 'tribute',
              subscriptionStatus: 'active',
              subscriptionEndsAt: oneYearFromNow,
              characterSlots: 3, // Tribute users get 3 character slots
            }
          });
          console.log('Generated username for new Google user:', user.email, '->', username);
          console.log('Set emailVerified and tribute subscription (1 year) for testing');
        } catch (error) {
          console.error('Error generating username for new user:', error);
        }
      }
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

/**
 * Custom email/password authentication function
 * This replaces the CredentialsProvider with a simpler approach
 */
export async function authenticateUser(identifier: string, password: string) {
  try {
    // Find user by email or username
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user || !user.password) {
      return null;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return null;
    }

    console.log('Authentication successful for user:', identifier);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
    };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return null;
  }
}