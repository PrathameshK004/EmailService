import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser && !existingUser.isEmailVerified) {
      return NextResponse.json(
        {
          redirectToVerify: true,
          email: existingUser.email,
        },
        { status: 200 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create pending user with isEmailVerified set to false
    const result = await usersCollection.insertOne({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isEmailVerified: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "User created successfully. Please verify your email.",
      user: {
        id: result.insertedId.toString(),
        username,
        email: email.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
