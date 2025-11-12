import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuth()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch repositories')
    }

    const repos = await response.json()

    // Return simplified repo data
    const simplifiedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
    }))

    return NextResponse.json(simplifiedRepos)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}
