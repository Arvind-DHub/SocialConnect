export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">SocialConnect</h1>
          <p className="text-base-content/60 mt-1">Share, connect, discover</p>
        </div>
        {children}
      </div>
    </div>
  );
}
