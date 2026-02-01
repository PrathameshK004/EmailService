"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Mail, Server, Send, Key, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"

interface SmtpCredential {
  _id: string
  name: string
  host: string
  port: number
  isDefault: boolean
}

interface ApiKey {
  _id: string
  name: string
  keyPreview: string
  lastUsedAt: string | null
}

function DashboardContent() {
  const { user, token } = useAuth()
  const [smtpConfigs, setSmtpConfigs] = useState<SmtpCredential[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(true)
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)

  const fetchSmtpConfigs = useCallback(async () => {
  try {
    const response = await fetch("/api/smtp", {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await response.json()

      if (response.ok) {
        const normalized = Array.isArray(data)
          ? data
          : data
          ? [data]
          : []

        setSmtpConfigs(normalized)
      }
    } catch (error) {
      console.error("Error fetching SMTP configs:", error)
    } finally {
      setIsLoadingSmtp(false)
    }
  }, [token])


  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch("/api/api-keys", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
    } finally {
      setIsLoadingKeys(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchSmtpConfigs()
      fetchApiKeys()
    }
  }, [token, fetchSmtpConfigs, fetchApiKeys])

  const quickActions = [
    {
      title: "Send Email",
      description: "Compose and send a new email",
      icon: Send,
      href: "/dashboard/send",
      color: "bg-blue-500",
    },
    {
      title: "SMTP Settings",
      description: "Configure your SMTP credentials",
      icon: Server,
      href: "/dashboard/smtp",
      color: "bg-green-500",
    },
    {
      title: "API Keys",
      description: "Manage API keys for external apps",
      icon: Key,
      href: "/dashboard/api-keys",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your email delivery service from this dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Your account is in good standing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Address</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">{user?.email}</div>
            <p className="text-xs text-muted-foreground">
              Registered email address
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMTP Configs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSmtp ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{smtpConfigs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {smtpConfigs.length === 0 ? "No SMTP configured" : "Active configurations"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingKeys ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{apiKeys.length}</div>
                <p className="text-xs text-muted-foreground">
                  {apiKeys.length === 0 ? "No API keys created" : "Active API keys"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SMTP Connections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              SMTP Connections
            </CardTitle>
            <CardDescription>Your configured email servers</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/smtp">
              Manage
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingSmtp ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : smtpConfigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <XCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No SMTP connections configured</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/dashboard/smtp">Configure SMTP Settings</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {smtpConfigs.map((config) => (
                <div
                  key={config._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{config.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {config.host}:{config.port}
                      </p>
                    </div>
                  </div>
                  {config.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>Keys for external integrations</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/api-keys">
              Manage
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingKeys ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Key className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No API keys created</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/dashboard/api-keys">Create API Key</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.slice(0, 3).map((key) => (
                <div
                  key={key._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                      <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <code className="text-xs text-muted-foreground">
                        {key.keyPreview}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
              {apiKeys.length > 3 && (
                <p className="text-center text-sm text-muted-foreground">
                  +{apiKeys.length - 3} more keys
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${action.color}`}>
                      <action.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with External Integration</CardTitle>
          <CardDescription>
            Follow these steps to send emails from your other projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-3 text-sm">
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Configure SMTP Settings</span>
              {" - "}Add your email provider&apos;s SMTP credentials (Gmail, SendGrid, etc.)
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Create an API Key</span>
              {" - "}Go to API Keys and generate a new key for your project
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Deploy This Service</span>
              {" - "}Click &quot;Publish&quot; to deploy to Vercel and get your production URL
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Integrate in Your Project</span>
              {" - "}Use the API endpoint with your key to send emails
            </li>
          </ol>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/dashboard/smtp">
                <Server className="mr-2 h-4 w-4" />
                Configure SMTP
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/api-keys">
                <Key className="mr-2 h-4 w-4" />
                Create API Key
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
