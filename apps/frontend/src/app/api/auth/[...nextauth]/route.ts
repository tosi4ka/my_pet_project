import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const backend =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.BACKEND_URL ??
  'http://localhost:3001';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const backendUrl = backend;
        const resp = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!resp.ok) return null;
        const data = await resp.json();

        return {
          id: data.sessionId ?? data.user?.id ?? null,
          userId: data.user?.id ?? null,
          phone: data.user?.phone ?? null,
        };
      },
    }),

    CredentialsProvider({
      id: 'telegram-otp',
      name: 'Telegram OTP',
      credentials: {
        sessionId: { label: 'SessionId', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.sessionId || !credentials?.otp) return null;

        const res = await fetch(`${backend}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sessionId: credentials.sessionId,
            otp: credentials.otp,
          }),
        });

        if (!res.ok) return null;
        const data = await res.json();

        return {
          id: data.sessionId ?? data.user?.id ?? credentials.sessionId,
          userId: data.user?.id ?? null,
          phone: data.user?.phone ?? null,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sessionId = (user as any).id ?? null;
        token.userId = (user as any).userId ?? null;
        token.phone = (user as any).phone ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = (token as any).sessionId ?? null;
      (session.user as any).userId = (token as any).userId ?? null;
      (session.user as any).phone = (token as any).phone ?? null;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
