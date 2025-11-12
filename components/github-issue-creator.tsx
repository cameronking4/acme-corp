'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Github, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  owner: {
    login: string
  }
}

export function GitHubIssueCreator() {
  const [open, setOpen] = React.useState(false)
  const [selectedRepo, setSelectedRepo] = React.useState<Repository | null>(null)
  const [repos, setRepos] = React.useState<Repository[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [issueTitle, setIssueTitle] = React.useState('')
  const [issueBody, setIssueBody] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [success, setSuccess] = React.useState<{ url: string; number: number } | null>(null)

  React.useEffect(() => {
    async function fetchRepos() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/github/repos')
        if (!response.ok) {
          throw new Error('Failed to fetch repositories')
        }
        const data = await response.json()
        setRepos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repositories')
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRepo || !issueTitle.trim()) {
      return
    }

    setCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: selectedRepo.owner.login,
          repo: selectedRepo.name,
          title: issueTitle,
          body: issueBody,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create issue')
      }

      const issue = await response.json()
      setSuccess({ url: issue.html_url, number: issue.number })
      setIssueTitle('')
      setIssueBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Create GitHub Issue
        </CardTitle>
        <CardDescription>
          Select a repository and create a new issue with automated Claude assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertTitle>Issue Created Successfully!</AlertTitle>
            <AlertDescription>
              <a
                href={success.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                View Issue #{success.number}
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="repository">Repository</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="repository"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading repositories...
                  </>
                ) : selectedRepo ? (
                  selectedRepo.full_name
                ) : (
                  'Select repository...'
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search repositories..." />
                <CommandList>
                  <CommandEmpty>No repository found.</CommandEmpty>
                  <CommandGroup>
                    {repos.map((repo) => (
                      <CommandItem
                        key={repo.id}
                        value={repo.full_name}
                        onSelect={() => {
                          setSelectedRepo(repo)
                          setOpen(false)
                          setSuccess(null)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedRepo?.id === repo.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{repo.full_name}</span>
                          {repo.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {repo.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedRepo && (
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="Enter issue title..."
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue..."
                value={issueBody}
                onChange={(e) => setIssueBody(e.target.value)}
                rows={6}
              />
            </div>

            <Button type="submit" disabled={creating || !issueTitle.trim()}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Issue...
                </>
              ) : (
                'Create Issue'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
