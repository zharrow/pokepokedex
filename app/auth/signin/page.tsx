'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        router.push('/encyclopedia');
        router.refresh();
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userEmail: string, userPassword: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: userEmail,
        password: userPassword,
      });

      if (result?.error) {
        setError('Erreur de connexion');
      } else {
        router.push('/encyclopedia');
        router.refresh();
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-block relative w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-red-500 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full border-4 border-red-500"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pokédex Kanto</h1>
          <p className="text-gray-600">Connectez-vous pour continuer</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Comptes de test</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => quickLogin('sacha@pokemon.com', 'pikachu')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>Sacha (Dresseur - 4 badges)</span>
          </button>

          <button
            onClick={() => quickLogin('joelle@pokemon.com', 'soin')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-400 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-pink-500 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>💊</span>
            <span>Joëlle (Soigneur)</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Mot de passe Sacha: <code className="bg-gray-100 px-2 py-1 rounded">pikachu</code></p>
          <p>Mot de passe Joëlle: <code className="bg-gray-100 px-2 py-1 rounded">soin</code></p>
        </div>
      </div>
    </div>
  );
}
