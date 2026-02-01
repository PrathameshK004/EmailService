import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { signToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await usersCollection.insertOne({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    })

    // Generate JWT
    const token = await signToken({
      userId: result.insertedId.toString(),
      email: email.toLowerCase(),
      username,
    })

    return NextResponse.json({
      message: "User created successfully",
      token,
      user: {
        id: result.insertedId.toString(),
        username,
        email: email.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
