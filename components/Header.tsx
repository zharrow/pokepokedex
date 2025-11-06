'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-white rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-5 bg-red-600 rounded-t-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold font-pokemon">Pokédex Kanto</h1>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="opacity-90">En ligne</span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/encyclopedia"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/encyclopedia')
                  ? 'bg-white/20 font-semibold'
                  : 'hover:bg-white/10'
              }`}
            >
              Encyclopédie
            </Link>

            {/* Collection - Uniquement pour les TRAINER */}
            {session?.user.role === 'TRAINER' && (
              <Link
                href="/collection"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/collection')
                    ? 'bg-white/20 font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                Collection
              </Link>
            )}

            {/* Profil - Uniquement pour les TRAINER */}
            {session?.user.role === 'TRAINER' && (
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-white/20 font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                Profil
              </Link>
            )}

            {/* Suivi Médical - Uniquement pour les HEALER */}
            {session?.user.role === 'HEALER' && (
              <Link
                href="/medical"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/medical')
                    ? 'bg-white/20 font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                Suivi Médical
              </Link>
            )}
          </nav>

          {/* User info / Login */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                {/* Badges */}
                {session.user.role === 'TRAINER' && (
                  <div className="hidden sm:flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-yellow-300">🏆</span>
                    <span className="text-sm font-semibold">{session.user.badges}/8</span>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold border-2 border-white/40">
                    {session.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-sm font-semibold">{session.user.name}</div>
                    <div className="text-xs opacity-75">
                      {session.user.role === 'TRAINER' ? 'Dresseur' : 'Soigneur'}
                    </div>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex overflow-x-auto gap-2 pb-3 -mx-4 px-4">
          <Link
            href="/encyclopedia"
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
              isActive('/encyclopedia') ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
            }`}
          >
            📚 Encyclopédie
          </Link>

          {/* Collection - Uniquement pour les TRAINER */}
          {session?.user.role === 'TRAINER' && (
            <Link
              href="/collection"
              className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                isActive('/collection') ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}
            >
              🎒 Collection
            </Link>
          )}

          {/* Profil - Uniquement pour les TRAINER */}
          {session?.user.role === 'TRAINER' && (
            <Link
              href="/profile"
              className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                isActive('/profile') ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}
            >
              👤 Profil
            </Link>
          )}

          {/* Suivi Médical - Uniquement pour les HEALER */}
          {session?.user.role === 'HEALER' && (
            <Link
              href="/medical"
              className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                isActive('/medical') ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}
            >
              💊 Médical
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
