import type { NextConfig } from "next";

const producao = process.env.NODE_ENV === "production";

// Política de segurança de conteúdo: o site só carrega recursos do próprio domínio.
// Se um dia adicionar uma ferramenta de medição, inclua o domínio dela aqui.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR permite ter duas compilações lado a lado nos testes (veja scripts/preparar-e2e.mjs).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  async headers() {
    const cabecalhos = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    if (producao) {
      cabecalhos.push(
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      );
    }
    return [{ source: "/(.*)", headers: cabecalhos }];
  },
};

export default nextConfig;
