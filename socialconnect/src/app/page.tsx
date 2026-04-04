import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-80 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-3xl text-primary">SocialConnect</h1>
          <p className="text-base-content/60 mt-1">Share, connect, discover</p>
          <div className="card-actions flex-col w-full mt-4 gap-2">
            <Link href="/login" className="btn btn-primary w-full">
              Login
            </Link>
            <Link href="/register" className="btn btn-outline w-full">
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
