import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex w-screen bg-white p-24">{children}</div>
      </body>
    </html>
  );
}
