import { getAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User, Mail, Calendar } from "lucide-react"
import SignOutButton from "@/components/sign-out-button"

export default async function DashboardPage() {
  const session = await getAuth()

  if (!session) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white dark:text-black"
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
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                ACME Corp
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || 'User'}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                {user?.image && (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'Anonymous User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email || 'No email provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
              <CardDescription>Your contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">
                {user?.email || 'No email available'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session
              </CardTitle>
              <CardDescription>Your current session</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Logged in via GitHub
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Session active
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Explore the features of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                  <span className="text-white dark:text-black font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Your Profile is Set Up
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your GitHub account is successfully connected and authenticated.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Explore the Dashboard
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Take a look around and familiarize yourself with the interface.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Customize Your Experience
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add more features and personalize your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
