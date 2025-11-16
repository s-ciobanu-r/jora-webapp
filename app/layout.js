import "../styles/globals.css";

export const metadata = {
  title: "Jora Assistant",
  description: "Ultra-premium AI assistant"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}