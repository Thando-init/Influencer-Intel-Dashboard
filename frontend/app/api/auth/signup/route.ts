import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Import the shared user store
let users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}> = [];

// Try to import from auth route, fallback to local array
try {
  const authModule = require("../[...nextauth]/route");
  if (authModule.users) {
    users = authModule.users;
  }
} catch (e) {
  console.log("Using local user store");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      subscriptionTier: "free",
      subscriptionStatus: "inactive",
    };

    users.push(newUser);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";

// // Temporary in-memory user store (same as in [...nextauth]/route.ts)
// // In production, use a shared database
// const users: Array<{
//   id: string;
//   email: string;
//   password: string;
//   name: string;
//   subscriptionTier: string;
//   subscriptionStatus: string;
// }> = [];

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { email, password, name } = body;

//     // Validation
//     if (!email || !password || !name) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (password.length < 6) {
//       return NextResponse.json(
//         { error: "Password must be at least 6 characters" },
//         { status: 400 }
//       );
//     }

//     // Check if user already exists
//     const existingUser = users.find((u) => u.email === email);
//     if (existingUser) {
//       return NextResponse.json(
//         { error: "User already exists" },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const newUser = {
//       id: `user_${Date.now()}`,
//       email,
//       password: hashedPassword,
//       name,
//       subscriptionTier: "free",
//       subscriptionStatus: "inactive",
//     };

//     users.push(newUser);

//     return NextResponse.json(
//       {
//         success: true,
//         user: {
//           id: newUser.id,
//           email: newUser.email,
//           name: newUser.name,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Signup error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
