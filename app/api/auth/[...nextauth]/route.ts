import { removeAuthCookies, setAuthCookie } from "@/features/auth/actions";
import { authControllerLogin, authControllerLogout } from "@/generated/api";
import { LoginDto } from "@/generated/api/model";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  events: {
    async signOut({ token }) {
      try {
        await authControllerLogout(
          {
            refreshToken: (token as typeof token & { refreshToken: string })
              .refreshToken,
          },
          {
            baseURL:
              process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
          },
        );
      } catch (error) {
        console.error("Failed logout:", error);
      }
      await removeAuthCookies();
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const data: LoginDto = {
        email: user.email,
        name: user.name,
        provider: "GITHUB",
        oAuthToken: "init",
      };

      if (account?.provider === "github" && account.access_token) {
        data.oAuthToken = account.access_token;
      }

      try {
        const result = await authControllerLogin(data, {
          baseURL:
            process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
        });
        await setAuthCookie(result.access_token, result.refresh_token);
        Object.assign(user, {
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          organizations: result.organizations,
        });
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async jwt({ user, token }) {
      if (user) {
        token = {
          accessToken: (
            user as typeof user & {
              accessToken?: string;
            }
          ).accessToken,
          refreshToken: (user as typeof user & { refreshToken?: string })
            .refreshToken,
        };
      }
      return token;
    },
    async session({ session, token }) {
      (session as typeof session & { accessToken?: string }).accessToken =
        token.accessToken as string | undefined;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
