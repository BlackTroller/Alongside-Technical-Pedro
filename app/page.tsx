export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="h-full">
      <body className="h-full antialiased">
        {children} {/* SEM ISTO, NADA APARECE NO ECRÃ */}
      </body>
    </html>
  );
}
