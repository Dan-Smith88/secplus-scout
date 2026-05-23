import type { NextConfig } from "next";

// Applied to every route.
const securityHeaders = [
  // Prevent MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block the page from being embedded in an iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Control how much referrer info is sent when clicking external links.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Enforce HTTPS for 2 years once the browser has seen the header once.
  // Remove this line if you ever need to test over plain HTTP locally.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disable browser APIs this app never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  // Explicitly disable the legacy XSS auditor — a proper CSP supersedes it
  // and the auditor itself has known bypass issues in older browsers.
  { key: "X-XSS-Protection", value: "0" },
  // Content Security Policy.
  // - script-src needs 'unsafe-inline' because Next.js injects inline
  //   hydration scripts; tighten this with nonce-based middleware if needed.
  // - style-src needs 'unsafe-inline' for Tailwind CSS utility injection.
  // - Everything else is locked to 'self' or 'none'.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
