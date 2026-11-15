import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { authControllerLogin } from "@/generated/api";
import { LoginDto } from "@/generated/api/model";
import { setAuthCookie } from "@/features/auth/actions";

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

  callbacks: {
    async signIn({ user, account }) {
      console.log("user:", user);
      console.log("account", account);

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
        const result = await authControllerLogin(data);
        await setAuthCookie(result.access_token, result.refresh_token);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
      return false;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
