import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { owner, repo, title, body: issueBody } = body

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
        body: JSON.stringify({
          title,
          body: issueBody || '',
        }),
      }
    )

    if (!issueResponse.ok) {
      const errorData = await issueResponse.json()
      throw new Error(errorData.message || 'Failed to create issue')
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
      console.error('Failed to add comment to issue')
    }

    return NextResponse.json({
      issue: {
        number: issue.number,
        html_url: issue.html_url,
        title: issue.title,
      },
    })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create issue' },
      { status: 500 }
    )
  }
}
