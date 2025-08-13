"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function JWTDemo() {
  const [jwtToken, setJwtToken] = useState<string>("");
  const [jwksData, setJwksData] = useState<{
    keys: Array<{
      kty: string;
      use: string;
      kid: string;
      n: string;
      e: string;
      alg: string;
    }>;
  } | null>(null);
  const [protectedData, setProtectedData] = useState<{
    message: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
    tokenInfo: {
      issuer: string;
      audience: string;
      expiresAt: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getJWTToken = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Get the current session first
      const session = await authClient.getSession();
      
      if (!session.data?.session) {
        setError("You need to be logged in to get a JWT token");
        return;
      }

      // Get JWT token using fetch directly since authClient might not expose this
      const response = await fetch("/api/auth/token", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${session.data.session.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJwtToken(data.token);
      } else {
        setError("Failed to get JWT token");
      }
    } catch (err) {
      setError("Error getting JWT token: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getJWKS = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/jwks", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setJwksData(data);
      } else {
        setError("Failed to get JWKS data");
      }
    } catch (err) {
      setError("Error getting JWKS: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testProtectedRoute = async () => {
    if (!jwtToken) {
      setError("Get a JWT token first");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/protected", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setProtectedData(data);
      } else {
        setError("Failed to access protected route: " + data.error);
      }
    } catch (err) {
      setError("Error accessing protected route: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#44cc00]">JWT Demo</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Get JWT Token</h2>
            <p className="text-gray-300 mb-4">
              Click the button below to get a JWT token for the current session.
              You need to be logged in first.
            </p>
            <button
              onClick={getJWTToken}
              disabled={loading}
              className="bg-[#44cc00] text-black px-4 py-2 rounded hover:bg-[#44cc00]/80 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get JWT Token"}
            </button>
            
            {jwtToken && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">JWT Token:</h3>
                <div className="bg-gray-700 p-3 rounded text-sm break-all">
                  {jwtToken}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Get JWKS (JSON Web Key Set)</h2>
            <p className="text-gray-300 mb-4">
              Click the button below to get the public keys used to verify JWT tokens.
              This endpoint is public and does not require authentication.
            </p>
            <button
              onClick={getJWKS}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get JWKS"}
            </button>
            
            {jwksData && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">JWKS Data:</h3>
                <div className="bg-gray-700 p-3 rounded text-sm">
                  <pre>{JSON.stringify(jwksData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 p-4 rounded">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Protected Route</h2>
            <p className="text-gray-300 mb-4">
              Test accessing a protected API route using your JWT token.
              This demonstrates how to use JWT tokens in your own services.
            </p>
            <button
              onClick={testProtectedRoute}
              disabled={loading || !jwtToken}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Test Protected Route"}
            </button>
            
            {protectedData && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Protected Data:</h3>
                <div className="bg-gray-700 p-3 rounded text-sm">
                  <pre>{JSON.stringify(protectedData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong className="text-[#44cc00]">GET /api/auth/token</strong>
                <p className="text-gray-300">Get JWT token (requires authentication)</p>
              </div>
              <div>
                <strong className="text-[#44cc00]">GET /api/auth/jwks</strong>
                <p className="text-gray-300">Get JSON Web Key Set for token verification (public)</p>
              </div>
              <div>
                <strong className="text-[#44cc00]">GET /api/protected</strong>
                <p className="text-gray-300">Example protected route that requires JWT token</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Use JWT Tokens</h2>
            <div className="space-y-3 text-sm text-gray-300">
              <p>1. <strong>Get a token:</strong> Call the /api/auth/token endpoint with your session token</p>
              <p>2. <strong>Use the token:</strong> Include it in the Authorization header: <code className="bg-gray-700 px-2 py-1 rounded">Authorization: Bearer YOUR_JWT_TOKEN</code></p>
              <p>3. <strong>Verify the token:</strong> Use the JWKS endpoint to get public keys for verification</p>
              <p>4. <strong>Token expiration:</strong> JWT tokens expire after 15 minutes by default</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}