import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    console.log("Registration attempt:", { name, email, passwordLength: password?.length });

    // Validate input
    if (!email || !password || !name) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields", details: "Please provide name, email and password" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      console.log("Password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters long", details: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      console.log("Existing user check:", { exists: !!existingUser });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use", details: "Email already in use" },
          { status: 409 }
        );
      }
    } catch (dbError) {
      console.error("Database error during user check:", dbError);
      return NextResponse.json(
        { 
          error: "Database error during user check",
          details: (dbError as Error).message
        },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Create user
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          accounts: {
            create: {
              type: "credentials",
              provider: "credentials",
              providerAccountId: email,
              token_type: "password",
              id_token: hashedPassword,
            }
          }
        },
      });

      console.log("User created successfully:", { id: user.id });

      // Return success but don't include password
      return NextResponse.json(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        { status: 201 }
      );
    } catch (createError) {
      console.error("User creation error:", createError);
      return NextResponse.json(
        { 
          error: "Failed to create user account",
          details: (createError as Error).message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        error: "An error occurred during registration",
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
