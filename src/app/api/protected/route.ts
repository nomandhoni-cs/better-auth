import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

// Create a JWKS instance for verifying tokens
const JWKS = createRemoteJWKSet(new URL(`${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/jwks`));

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);

    try {
      // Verify the JWT token using the remote JWKS
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
        audience: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      });

      // Token is valid, return protected data
      return NextResponse.json({
        message: "Access granted to protected resource",
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
        },
        tokenInfo: {
          issuer: payload.iss,
          audience: payload.aud,
          expiresAt: new Date((payload.exp as number) * 1000).toISOString(),
        },
      });
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error in protected route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}