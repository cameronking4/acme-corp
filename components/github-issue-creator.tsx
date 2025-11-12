'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GitBranch, Plus, Search, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface Repository {
  id: number
  name: string
  full_name: string
  owner: string
  description: string | null
  private: boolean
  html_url: string
}

interface CreatedIssue {
  number: number
  html_url: string
  title: string
}

export default function GitHubIssueCreator() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [isCreatingIssue, setIsCreatingIssue] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<CreatedIssue | null>(null)

  // Issue form fields
  const [issueTitle, setIssueTitle] = useState('')
  const [issueBody, setIssueBody] = useState('')

  useEffect(() => {
    fetchRepositories()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredRepos(filtered)
    } else {
      setFilteredRepos(repos)
    }
  }, [searchQuery, repos])

  const fetchRepositories = async () => {
    setIsLoadingRepos(true)
    setError(null)
    try {
      const response = await fetch('/api/github/repos')
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      setRepos(data)
      setFilteredRepos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo)
    setSearchQuery(repo.full_name)
    setShowDropdown(false)
    setSuccess(null)
    setError(null)
  }

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRepo || !issueTitle) return

    setIsCreatingIssue(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          title: issueTitle,
          body: issueBody,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create issue')
      }

      const data = await response.json()
      setSuccess(data.issue)
      setIssueTitle('')
      setIssueBody('')
      setSelectedRepo(null)
      setSearchQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue')
    } finally {
      setIsCreatingIssue(false)
    }
  }

  const handleReset = () => {
    setSelectedRepo(null)
    setSearchQuery('')
    setIssueTitle('')
    setIssueBody('')
    setSuccess(null)
    setError(null)
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Create GitHub Issue
        </CardTitle>
        <CardDescription>
          Search for a repository and create an issue with automated Claude integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Repository Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Select Repository
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={isLoadingRepos}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50"
                />
              </div>

              {/* Dropdown */}
              {showDropdown && !isLoadingRepos && filteredRepos.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredRepos.slice(0, 50).map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {repo.full_name}
                      </div>
                      {repo.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {repo.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {isLoadingRepos && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading repositories...
                </div>
              )}
            </div>
          </div>

          {/* Issue Creation Form */}
          {selectedRepo && (
            <form onSubmit={handleCreateIssue} className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Issue Title *
                </label>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  required
                  disabled={isCreatingIssue}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Issue Description
                </label>
                <textarea
                  placeholder="Detailed description of the issue (optional)"
                  value={issueBody}
                  onChange={(e) => setIssueBody(e.target.value)}
                  disabled={isCreatingIssue}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isCreatingIssue || !issueTitle}
                  className="flex items-center gap-2"
                >
                  {isCreatingIssue ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Issue
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isCreatingIssue}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-600 dark:text-green-400">
                Issue{' '}
                <a
                  href={success.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:no-underline"
                >
                  #{success.number}
                </a>{' '}
                created successfully! Claude has been automatically tagged to implement it.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
