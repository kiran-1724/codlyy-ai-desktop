# Desktop Authentication Guide for Next.js Web App

This guide outlines the steps required in your **Next.js Web Application** (`codlyy.vercel.app`) to handle authentication for the **Codlyy AI Desktop App**.

## 🔄 The Authentication Flow

1.  **Desktop App**: User clicks "Continue with Google".
2.  **Desktop App**: Opens your web URL: `https://codlyy.vercel.app/auth/desktop-login`.
3.  **Web App**: User signs in with Google (NextAuth.js / Supabase / Custom).
4.  **Web App**: Generates a Session Token / JWT.
5.  **Web App**: Redirects web browser to a custom protocol: 
    `codlyy://auth/callback?token=YOUR_ACCESS_TOKEN`
6.  **Desktop App**: Catches this protocol, extracts the token, and logs the user in.

---

## 🚀 Steps for Next.js App

### 1. Create a Dedicated Desktop Login Page

Create a new page/route (e.g., `app/auth/desktop-login/page.tsx`) specifically for desktop users.

**Requirements for this page:**
- Clean UI (minimal header/footer).
- "Login with Google" button.
- Logic to capture the `token` after login.

### 2. Implement the Redirect Logic (The Critical Part)

After the user successfully logs in, you need a "Callback" component or logic that runs immediately.

**Example `useEffect` logic in your Success/Callback page:**

```typescript
// app/auth/callback/page.tsx or inside your login component

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DesktopCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // 1. Get the token from URL or your Auth State (NextAuth/Supabase)
    // Note: If using NextAuth, you might need to fetch the session first
    const token = searchParams.get("token") || "your_generated_jwt_token";

    if (token) {
      // 2. Construct the Deep Link URL
      // Protocol: codlyy://
      // Action: auth/callback
      // Params: token
      const desktopDeepLink = `codlyy://auth/callback?token=${token}`;

      // 3. Redirect back to Desktop App
      window.location.href = desktopDeepLink;

      // 4. Optional: Show specific UI
      // "Opening Codlyy AI..."
      setTimeout(() => {
         // Fallback if desktop app doesn't open
         console.log("Deep link attempted");
      }, 1000);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-zinc-100">
        <h1 className="text-2xl font-bold mb-2">Authenticating...</h1>
        <p className="text-zinc-500">Please confirm the prompt to open Codlyy AI Desktop.</p>
        <a 
          href={`codlyy://auth/callback?token=...`}
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-medium"
        >
          Open App Manually
        </a>
      </div>
    </div>
  );
}
```

### 3. Google OAuth Configuration

In your Google Cloud Console (for the Web App):
- Ensure your `Authorized redirect URIs` includes your vercel link:
  - `https://codlyy.vercel.app/api/auth/callback/google` (if using NextAuth)

---

## 🖥️ What We Need to update in Desktop (Next Steps)

To make the above work, we need to add **Deep Linking** support to our Electron app (I will handle this next).

**We need to:**
1.  Register `codlyy://` protocol in `package.json`.
2.  Handle `app.on('open-url')` in `src/main/main.js`.
3.  Parse the incoming URL to extract the `token`.
4.  Send the token to the renderer to store in `localStorage`.

---

## ✅ Summary for Web Developer

1.  **Endpoint**: Build `https://codlyy.vercel.app/auth/desktop-login`
2.  **Action**: User Logs in -> Get JWT.
3.  **Redirect**: `window.location.href = "codlyy://auth/callback?token=" + jwt;`

That's it! The Desktop app will wake up and take it from there.
