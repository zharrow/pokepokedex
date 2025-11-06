'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PokemonType {
  id: number;
  nameFr: string;
  color: string;
}

interface Pokemon {
  id: number;
  pokedexNumber: number;
  nameFr: string;
  spriteUrl: string;
  spriteShinyUrl: string;
  types: PokemonType[];
}

interface CollectionEntry {
  id: string;
  nickname: string | null;
  level: number;
  isShiny: boolean;
  isFavorite: boolean;
  captureDate: string;
  pokemon: Pokemon;
}

interface Team {
  id: string;
  name: string;
  members: any[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('types');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (session.user.role !== 'TRAINER') {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    try {
      const [collectionRes, teamsRes] = await Promise.all([
        fetch('/api/collection'),
        fetch('/api/teams'),
      ]);

      const collectionData = await collectionRes.json();
      const teamsData = await teamsRes.json();

      setCollection(collectionData.entries || []);
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  // Calculate statistics
  const totalPokemon = collection.length;
  const averageLevel = totalPokemon > 0
    ? Math.round(collection.reduce((sum, e) => sum + e.level, 0) / totalPokemon)
    : 0;
  const maxLevel = totalPokemon > 0
    ? Math.max(...collection.map(e => e.level))
    : 0;
  const pokedexPercent = Math.round((totalPokemon / 151) * 100);
  const shinyCount = collection.filter(e => e.isShiny).length;
  const favoritesCount = collection.filter(e => e.isFavorite).length;

  // Type distribution
  const typeStats: Record<string, { count: number; color: string }> = {};
  collection.forEach(entry => {
    entry.pokemon.types.forEach(type => {
      if (!typeStats[type.nameFr]) {
        typeStats[type.nameFr] = { count: 0, color: type.color };
      }
      typeStats[type.nameFr].count++;
    });
  });
  const topTypes = Object.entries(typeStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Recent captures
  const recentCaptures = [...collection]
    .sort((a, b) => new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime())
    .slice(0, 5);

  // Top Pokemon by level
  const topPokemon = [...collection]
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

  return (
    <div className="py-8">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/40">
            {session.user.name?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">{session.user.name}</h1>
            <div className="flex items-center gap-4 justify-center md:justify-start mb-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                Dresseur Pokémon
              </span>
              <span className="flex items-center gap-2">
                <span className="text-yellow-300">🏆</span>
                <span className="font-semibold">{session.user.badges}/8 Badges</span>
              </span>
            </div>
            <div className="text-white/80 text-sm">
              Membre depuis {new Date(session.user.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{averageLevel}</div>
              <div className="text-white/80 text-sm">Niveau Moyen</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{pokedexPercent}%</div>
              <div className="text-white/80 text-sm">Pokédex</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{shinyCount}</div>
              <div className="text-white/80 text-sm">Shiny</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🎒</div>
            <div>
              <div className="text-gray-600 text-sm">Total Pokémon</div>
              <div className="text-2xl font-bold text-red-600">{totalPokemon}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {teams.length} {teams.length > 1 ? 'équipes' : 'équipe'} créées
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📈</div>
            <div>
              <div className="text-gray-600 text-sm">Niveau Moyen</div>
              <div className="text-2xl font-bold text-blue-600">{averageLevel}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Niveau max: {maxLevel}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📕</div>
            <div>
              <div className="text-gray-600 text-sm">Pokédex Kanto</div>
              <div className="text-2xl font-bold text-green-600">{pokedexPercent}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${pokedexPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">✨</div>
            <div>
              <div className="text-gray-600 text-sm">Collection Spéciale</div>
              <div className="text-2xl font-bold text-purple-600">{shinyCount}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            ❤️ {favoritesCount} favoris
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('types')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'types'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Distribution par Type
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'recent'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🆕 Captures Récentes
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'top'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👑 Top Pokémon
            </button>
          </div>
        </div>

        <div className="p-6">
          {totalPokemon === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎒</div>
              <p className="text-xl text-gray-600 mb-2">Votre collection est vide</p>
              <p className="text-gray-500 mb-6">Capturez vos premiers Pokémon pour voir vos statistiques</p>
              <a
                href="/collection"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Aller à la collection
              </a>
            </div>
          ) : (
            <>
              {activeTab === 'types' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Top 5 Types les plus représentés</h3>
                  <div className="space-y-4">
                    {topTypes.map(([type, data]) => (
                      <div key={type} className="flex items-center gap-4">
                        <div className="w-32 font-medium">{type}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-10 overflow-hidden">
                          <div
                            className="h-full flex items-center justify-between px-4 text-white font-semibold transition-all"
                            style={{
                              width: `${(data.count / totalPokemon) * 100}%`,
                              backgroundColor: data.color,
                            }}
                          >
                            <span>{data.count} Pokémon</span>
                            <span>{Math.round((data.count / totalPokemon) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'recent' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">5 Dernières Captures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {recentCaptures.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center"
                      >
                        <div className="relative w-24 h-24 mx-auto mb-2">
                          <Image
                            src={entry.isShiny ? entry.pokemon.spriteShinyUrl : entry.pokemon.spriteUrl}
                            alt={entry.pokemon.nameFr}
                            width={96}
                            height={96}
                            className="pixelated"
                          />
                          {entry.isShiny && (
                            <div className="absolute top-0 right-0 text-xl">✨</div>
                          )}
                          {entry.isFavorite && (
                            <div className="absolute top-0 left-0 text-xl">❤️</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          #{entry.pokemon.pokedexNumber.toString().padStart(3, '0')}
                        </div>
                        <div className="font-semibold mb-1">
                          {entry.nickname || entry.pokemon.nameFr}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">Niv. {entry.level}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.captureDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'top' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Top 5 Pokémon (par niveau)</h3>
                  <div className="space-y-4">
                    {topPokemon.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4"
                      >
                        <div className="text-3xl font-bold text-gray-300 w-12">
                          #{index + 1}
                        </div>

                        <div className="relative w-20 h-20">
                          <Image
                            src={entry.isShiny ? entry.pokemon.spriteShinyUrl : entry.pokemon.spriteUrl}
                            alt={entry.pokemon.nameFr}
                            width={80}
                            height={80}
                            className="pixelated"
                          />
                          {entry.isShiny && (
                            <div className="absolute top-0 right-0 text-xl">✨</div>
                          )}
                          {entry.isFavorite && (
                            <div className="absolute top-0 left-0 text-xl">❤️</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            #{entry.pokemon.pokedexNumber.toString().padStart(3, '0')}
                          </div>
                          <div className="font-bold text-lg mb-1">
                            {entry.nickname || entry.pokemon.nameFr}
                          </div>
                          <div className="flex gap-2">
                            {entry.pokemon.types.map((type) => (
                              <span
                                key={type.id}
                                className="px-2 py-1 rounded-full text-white text-xs"
                                style={{ backgroundColor: type.color }}
                              >
                                {type.nameFr}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-4xl font-bold text-red-600">
                            {entry.level}
                          </div>
                          <div className="text-xs text-gray-500">Niveau</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
