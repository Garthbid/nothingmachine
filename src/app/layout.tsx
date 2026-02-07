import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nothing Machine",
  description: "The answer to AGI is not more intelligence. It's love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
