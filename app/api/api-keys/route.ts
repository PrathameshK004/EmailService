import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken, getTokenFromHeader } from "@/lib/jwt"
import crypto from "crypto"

function generateApiKey(): string {
  const prefix = "ms"
  const randomPart = crypto.randomBytes(24).toString("hex")
  return `${prefix}_${randomPart}`
}

function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

// GET - List all API keys for user
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
    const apiKeysCollection = db.collection("api_keys")

    const apiKeys = await apiKeysCollection
      .find({ userId: payload.userId })
      .project({ keyHash: 0 }) // Don't return the hash
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error("Get API keys error:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}

// POST - Create new API key
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

    const { name } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const apiKeysCollection = db.collection("api_keys")

    // Check if user has too many API keys (limit to 10)
    const existingCount = await apiKeysCollection.countDocuments({ userId: payload.userId })
    if (existingCount >= 10) {
      return NextResponse.json(
        { error: "Maximum of 10 API keys allowed per user" },
        { status: 400 }
      )
    }

    // Generate new API key
    const apiKey = generateApiKey()
    const keyHash = hashApiKey(apiKey)
    const keyPreview = `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`

    const newApiKey = {
      userId: payload.userId,
      name: name.trim(),
      keyHash,
      keyPreview,
      createdAt: new Date(),
      lastUsedAt: null,
    }

    await apiKeysCollection.insertOne(newApiKey)

    // Return the full API key only once (on creation)
    return NextResponse.json({
      message: "API key created successfully",
      apiKey: {
        name: newApiKey.name,
        key: apiKey, // Full key - only shown once
        keyPreview,
        createdAt: newApiKey.createdAt,
      },
    })
  } catch (error) {
    console.error("Create API key error:", error)
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    )
  }
}

// DELETE - Delete an API key
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const keyPreview = searchParams.get("keyPreview")

    if (!keyPreview) {
      return NextResponse.json(
        { error: "API key preview is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const apiKeysCollection = db.collection("api_keys")

    const result = await apiKeysCollection.deleteOne({
      userId: payload.userId,
      keyPreview,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    console.error("Delete API key error:", error)
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    )
  }
}
