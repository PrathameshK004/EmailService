import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken, getTokenFromHeader } from "@/lib/jwt"
import { decrypt } from "@/lib/encryption"
import nodemailer from "nodemailer"
import crypto from "crypto"

interface Attachment {
  filename: string
  content: string // Base64 encoded
  contentType?: string
}

function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

async function verifyApiKey(apiKey: string): Promise<{ userId: string } | null> {
  try {
    const { db } = await connectToDatabase()
    const apiKeysCollection = db.collection("api_keys")

    const keyHash = hashApiKey(apiKey)
    const apiKeyDoc = await apiKeysCollection.findOne({ keyHash })

    if (!apiKeyDoc) {
      return null
    }

    // Update last used timestamp
    await apiKeysCollection.updateOne(
      { keyHash },
      { $set: { lastUsedAt: new Date() } }
    )

    return { userId: apiKeyDoc.userId }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required. Use 'Bearer <API_KEY>' or 'Bearer <JWT_TOKEN>'" },
        { status: 401 }
      )
    }

    let userId: string | null = null
    let payload: any | null = null

    // Check if it's an API key (starts with "ms_")
    if (authHeader.startsWith("Bearer ms_")) {
      const apiKey = authHeader.replace("Bearer ", "")
      const result = await verifyApiKey(apiKey)
      if (result) {
        userId = result.userId
      }
    } else {
      // Try JWT token
      const token = getTokenFromHeader(authHeader)
      if (token) {
        payload = await verifyToken(token)
        if (payload) {
          userId = payload.userId
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired credentials" },
        { status: 401 }
      )
    }

    const { from, to, subject, text, html, attachments } = await request.json()

    if (!from || !to || !subject) {
      return NextResponse.json(
        { error: "From, to, and subject are required" },
        { status: 400 }
      )
    }

    if (!text && !html) {
      return NextResponse.json(
        { error: "Either text or html content is required" },
        { status: 400 }
      )
    }

    // Get user's SMTP credentials
    const { db } = await connectToDatabase()
    const smtpCollection = db.collection("smtp_credentials")
    const credentials = await smtpCollection.findOne({ userId: userId })

    if (!credentials) {
      return NextResponse.json(
        { error: "SMTP credentials not configured. Please set up your SMTP settings first." },
        { status: 400 }
      )
    }

    // Decrypt SMTP credentials
    const smtpConfig = {
      host: credentials.host,
      port: credentials.port,
      secure: credentials.secure,
      auth: {
        user: decrypt(credentials.user),
        pass: decrypt(credentials.pass),
      },
    }

    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig)

    // Prepare attachments
    const emailAttachments = attachments?.map((att: Attachment) => ({
      filename: att.filename,
      content: Buffer.from(att.content, "base64"),
      contentType: att.contentType,
    }))

    // Send email
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments: emailAttachments,
    })

    // Log email to database
    const emailLogsCollection = db.collection("email_logs")
    await emailLogsCollection.insertOne({
      userId: userId,
      from,
      to,
      subject,
      hasAttachments: attachments?.length > 0,
      messageId: info.messageId,
      sentAt: new Date(),
    })

    return NextResponse.json({
      message: "Email sent successfully",
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("Send email error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to send email"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
