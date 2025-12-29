export const metadata = {
  title: 'AI ADHD Website',
  description: 'AI-powered ADHD Productivity Tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}