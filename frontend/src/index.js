import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { shadcn } from "@clerk/ui/themes";
import "@/index.css";
import App from "@/App";

const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(document.getElementById("root"));

if (!publishableKey) {
  root.render(
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#0c0a09",
        color: "#f5f0e8",
        fontFamily: "'DM Sans', sans-serif",
        textAlign: "center",
        lineHeight: 1.5,
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", marginBottom: "0.75rem" }}>
          Boris
        </h1>
        <p style={{ color: "#c4b8a8", marginBottom: "1rem" }}>
          Missing <code>REACT_APP_CLERK_PUBLISHABLE_KEY</code>. Add your Clerk publishable key to{" "}
          <code>frontend/.env</code>, then restart the server.
        </p>
        <p style={{ color: "#c4b8a8" }}>
          See <code>frontend/CLERK_LOCAL.md</code> for localhost setup steps.
        </p>
      </div>
    </div>,
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={publishableKey}
        appearance={{
          theme: shadcn,
          variables: {
            colorBackground: "#ffffff",
            colorInputBackground: "#ffffff",
            colorNeutral: "#0c0a09",
            colorText: "#0c0a09",
            colorTextSecondary: "#57534e",
          },
          elements: {
            modalContent: { backgroundColor: "#ffffff" },
            cardBox: { backgroundColor: "#ffffff" },
            card: {
              backgroundColor: "#ffffff",
              boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
            },
            rootBox: { backgroundColor: "#ffffff" },
          },
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );
}
