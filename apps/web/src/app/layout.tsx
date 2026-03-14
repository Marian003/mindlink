import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MindLink",
    template: "%s | MindLink",
  },
  description:
    "MindLink — AI-powered collaborative thinking rooms where multiple agents help you think deeper.",
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
