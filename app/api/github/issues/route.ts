import { NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'

export async function POST(request: Request) {
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

    const { owner, repo, title, body } = await request.json()

    if (!owner || !repo || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: owner, repo, title' },
        { status: 400 }
      )
    }

    // Create the issue
    const issueResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      }
    )

    if (!issueResponse.ok) {
      const errorData = await issueResponse.json()
      console.error('Failed to create issue:', {
        status: issueResponse.status,
        statusText: issueResponse.statusText,
        error: errorData,
      })

      if (issueResponse.status === 401) {
        return NextResponse.json(
          { error: 'GitHub authentication failed. Your token may have expired. Please sign out and sign in again.' },
          { status: 401 }
        )
      }

      if (issueResponse.status === 403) {
        return NextResponse.json(
          { error: 'Access forbidden. Please check that the GitHub App has the required "repo" permissions.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: errorData.message || `Failed to create issue: ${issueResponse.statusText}` },
        { status: issueResponse.status }
      )
    }

    const issue = await issueResponse.json()

    // Add the automated comment
    const commentResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: '@claude please implement end to end and create PR',
        }),
      }
    )

    if (!commentResponse.ok) {
      console.error('Failed to add comment to issue:', {
        status: commentResponse.status,
        statusText: commentResponse.statusText,
      })
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create issue' },
      { status: 500 }
    )
  }
}
