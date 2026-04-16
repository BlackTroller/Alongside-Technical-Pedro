export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Logotipo</h1>
      </div>
      {children}
    </div>
  );
}
