"use client"

import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white dark:text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ACME Corp</h1>
        </div>

        <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="w-full h-12 text-base bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Powered by{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
          >
            Vercel
          </a>
        </p>
      </div>
    </div>
  )
}
