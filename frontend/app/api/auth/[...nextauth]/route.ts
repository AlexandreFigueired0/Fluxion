import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Call your backend API to verify credentials
        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        })

        const user = await res.json()

        if (!res.ok || !user) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers (Google/GitHub), create user in your backend
      if (account?.provider === "google" || account?.provider === "github") {
        console.log("Provider account:", account)
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/api/auth/oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: account.provider,
              providerId: account.providerAccountId
            })
          })
          const dbUser = await res.json()
          if (!res.ok || !dbUser?.id) {
            console.error("OAuth user creation failed:", dbUser)
            return false
          }
          user.id = dbUser.id
        } catch (error) {
          console.error("Error creating OAuth user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt"
  }
})

export { handler as GET, handler as POST }