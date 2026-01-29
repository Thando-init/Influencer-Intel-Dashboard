import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Temporary in-memory user store for MVP
const users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}> = [];

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find((u) => u.email === credentials.email);

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.subscriptionTier = (user as any).subscriptionTier;
        token.subscriptionStatus = (user as any).subscriptionStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).subscriptionTier = token.subscriptionTier;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret:
    process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
};

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const GET = handlers.GET;
export const POST = handlers.POST;

// Export the user store for signup route
export { users };

// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";

// // This is a temporary in-memory user store for MVP
// // In production, this should be replaced with a database
// const users: Array<{
//   id: string;
//   email: string;
//   password: string;
//   name: string;
//   subscriptionTier: string;
//   subscriptionStatus: string;
// }> = [];

// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         // Find user
//         const user = users.find((u) => u.email === credentials.email);

//         if (!user) {
//           return null;
//         }

//         // Verify password
//         const isValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!isValid) {
//           return null;
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           subscriptionTier: user.subscriptionTier,
//           subscriptionStatus: user.subscriptionStatus,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.subscriptionTier = (user as any).subscriptionTier;
//         token.subscriptionStatus = (user as any).subscriptionStatus;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         (session.user as any).id = token.id;
//         (session.user as any).subscriptionTier = token.subscriptionTier;
//         (session.user as any).subscriptionStatus = token.subscriptionStatus;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//     signOut: "/",
//     error: "/login",
//   },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
// });

// export { handler as GET, handler as POST };

// // Helper function to register a new user (for signup)
// export async function registerUser(
//   email: string,
//   password: string,
//   name: string
// ) {
//   // Check if user already exists
//   const existingUser = users.find((u) => u.email === email);
//   if (existingUser) {
//     throw new Error("User already exists");
//   }

//   // Hash password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Create user
//   const newUser = {
//     id: `user_${Date.now()}`,
//     email,
//     password: hashedPassword,
//     name,
//     subscriptionTier: "free",
//     subscriptionStatus: "inactive",
//   };

//   users.push(newUser);

//   return {
//     id: newUser.id,
//     email: newUser.email,
//     name: newUser.name,
//   };
// }
