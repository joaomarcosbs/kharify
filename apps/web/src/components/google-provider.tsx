"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  if (!clientId) {
    // Google Client ID not configured — render children without the provider.
    // The Google login button will be hidden in this case.
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
