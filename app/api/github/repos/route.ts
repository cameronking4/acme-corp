import { NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getAuth()

    if (!session) {
      console.error('No session found - user needs to sign in')
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in to continue.' },
        { status: 401 }
      )
    }

    if (!session.accessToken) {
      console.error('No access token in session - OAuth may not be configured correctly')
      return NextResponse.json(
        { error: 'Authentication token not found. Please sign out and sign in again.' },
        { status: 401 }
      )
    }

    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('GitHub API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      })

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'GitHub authentication failed. Your token may have expired. Please sign out and sign in again.' },
          { status: 401 }
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Access forbidden. Please check that the GitHub App has the required "repo" permissions.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const repos = await response.json()

    return NextResponse.json(repos)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to fetch repositories: ${errorMessage}` },
      { status: 500 }
    )
  }
}
