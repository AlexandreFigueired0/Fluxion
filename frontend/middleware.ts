import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // custom login page
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};