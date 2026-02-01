"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Mail, Shield, Zap, Server, ArrowRight, Lock, Cloud, Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return null
  }

  const features = [
    {
      icon: Server,
      title: "Your SMTP Credentials",
      description: "Use your own SMTP server credentials for complete control over email delivery",
    },
    {
      icon: Shield,
      title: "Secure & Encrypted",
      description: "All credentials are encrypted with AES-256 and protected with JWT authentication",
    },
    {
      icon: Zap,
      title: "Serverless Architecture",
      description: "Built on Vercel for instant scaling and zero server maintenance",
    },
    {
      icon: Lock,
      title: "JWT Authentication",
      description: "Secure API access with industry-standard JWT tokens",
    },
    {
      icon: Mail,
      title: "Rich Email Support",
      description: "Send HTML emails with attachments using the intuitive interface",
    },
    {
      icon: Cloud,
      title: "API Ready",
      description: "RESTful API endpoints for seamless integration with your applications",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Mail className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">MailSend</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            Serverless Email Delivery
            <span className="block text-primary">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Send emails securely using your own SMTP credentials. Built with JWT authentication,
            encrypted storage, and a clean API for seamless integration.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Sending Emails
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete email delivery platform with enterprise-grade security
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-background shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create an account and start sending emails in minutes
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>Built with Next.js, MongoDB, and Nodemailer. Deployed on Vercel.</p>
        </div>
      </footer>
    </div>
  )
}
