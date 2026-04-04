"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50">
        <div className="navbar-start">
          <Link href="/feed" className="text-xl font-bold text-primary">
            SocialConnect
          </Link>
        </div>

        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal gap-1">
            <li>
              <Link
                href="/feed"
                className={pathname === "/feed" ? "active" : ""}
              >
                Feed
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className={pathname === "/search" ? "active" : ""}
              >
                Search
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  href={`/profile/${user.id}`}
                  className={pathname.startsWith("/profile") ? "active" : ""}
                >
                  Profile
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="navbar-end gap-2">
          <Link
            href="/posts/new"
            className="btn btn-primary btn-sm hidden md:flex"
          >
            New Post
          </Link>

          {user && (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
              >
                {user.avatar_url ? (
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.avatar_url} alt={user.username} />
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </div>
                )}
              </div>

              <ul
                tabIndex={0}
                className="menu dropdown-content bg-base-100 rounded-box shadow-xl w-52 mt-3 p-2 z-[1] border border-base-300"
              >
                <li className="menu-title">
                  <span>@{user.username}</span>
                </li>
                <li>
                  <Link href={`/profile/${user.id}`}>My Profile</Link>
                </li>
                <div className="divider my-1" />
                <li>
                  <button onClick={logout} className="text-error">
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
