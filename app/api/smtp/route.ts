import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken, getTokenFromHeader } from "@/lib/jwt"
import { encrypt, decrypt } from "@/lib/encryption"

// GET - Fetch user's SMTP credentials
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const smtpCollection = db.collection("smtp_credentials")

    const credentials = await smtpCollection.findOne({ userId: payload.userId })

    if (!credentials) {
      return NextResponse.json({
        message: "No SMTP credentials found",
        credentials: null,
      })
    }

    // Decrypt sensitive data
    return NextResponse.json({
      credentials: {
        host: credentials.host,
        port: credentials.port,
        user: decrypt(credentials.user),
        pass: "********", // Don't send actual password
        secure: credentials.secure,
      },
    })
  } catch (error) {
    console.error("Get SMTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Save user's SMTP credentials
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const { host, port, user, pass, secure } = await request.json()

    if (!host || !port || !user || !pass) {
      return NextResponse.json(
        { error: "Host, port, user, and password are required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const smtpCollection = db.collection("smtp_credentials")

    // Encrypt sensitive data
    const encryptedUser = encrypt(user)
    const encryptedPass = encrypt(pass)

    await smtpCollection.updateOne(
      { userId: payload.userId },
      {
        $set: {
          userId: payload.userId,
          host,
          port: Number(port),
          user: encryptedUser,
          pass: encryptedPass,
          secure: secure ?? true,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({
      message: "SMTP credentials saved successfully",
    })
  } catch (error) {
    console.error("Save SMTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
