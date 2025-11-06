'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
  gender: string;
  isShiny: boolean;
  nature: string;
  pokeball: string;
  captureDate: string;
  isFavorite: boolean;
  pokemon: Pokemon;
}

const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

const POKEBALLS = [
  { value: 'pokeball', label: 'Poké Ball' },
  { value: 'superball', label: 'Super Ball' },
  { value: 'hyperball', label: 'Hyper Ball' },
  { value: 'masterball', label: 'Master Ball' },
  { value: 'safariball', label: 'Safari Ball' },
  { value: 'honorball', label: 'Honor Ball' },
  { value: 'rapideball', label: 'Rapide Ball' },
  { value: 'luxeball', label: 'Luxe Ball' },
  { value: 'bizareball', label: 'Bizarre Ball' },
  { value: 'soinball', label: 'Soin Ball' },
  { value: 'chronoball', label: 'Chrono Ball' },
  { value: 'filetball', label: 'Filet Ball' },
];

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pokemon');
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Pokémon list for adding
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [newPokemon, setNewPokemon] = useState({
    pokemonId: '',
    nickname: '',
    level: 5,
    gender: 'UNKNOWN',
    isShiny: false,
    nature: 'Hardy',
    pokeball: 'pokeball',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCollection();
    fetchAllPokemon();
  }, [session, status]);

  const fetchCollection = async () => {
    try {
      const response = await fetch('/api/collection');
      const data = await response.json();
      setCollection(data.entries || []);
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPokemon = async () => {
    try {
      const response = await fetch('/api/pokemon?limit=151');
      const data = await response.json();
      setAllPokemon(data.pokemon || []);
    } catch (error) {
      console.error('Error fetching pokemon:', error);
    }
  };

  const handleAddPokemon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPokemon),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewPokemon({
          pokemonId: '',
          nickname: '',
          level: 5,
          gender: 'UNKNOWN',
          isShiny: false,
          nature: 'Hardy',
          pokeball: 'pokeball',
        });
        fetchCollection();
      }
    } catch (error) {
      console.error('Error adding pokemon:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment retirer ce Pokémon de votre collection?')) return;

    try {
      await fetch(`/api/collection/${id}`, { method: 'DELETE' });
      fetchCollection();
    } catch (error) {
      console.error('Error deleting pokemon:', error);
    }
  };

  const toggleFavorite = async (entry: CollectionEntry) => {
    try {
      await fetch(`/api/collection/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !entry.isFavorite }),
      });
      fetchCollection();
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
  const favoritesCount = collection.filter(e => e.isFavorite).length;
  const shinyCount = collection.filter(e => e.isShiny).length;

  // Type distribution
  const typeStats: Record<string, number> = {};
  collection.forEach(entry => {
    entry.pokemon.types.forEach(type => {
      typeStats[type.nameFr] = (typeStats[type.nameFr] || 0) + 1;
    });
  });
  const topTypes = Object.entries(typeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Gender distribution
  const genderStats = {
    MALE: collection.filter(e => e.gender === 'MALE').length,
    FEMALE: collection.filter(e => e.gender === 'FEMALE').length,
    UNKNOWN: collection.filter(e => e.gender === 'UNKNOWN').length,
  };

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">
        Ma Collection
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Gérez vos Pokémon capturés et créez vos équipes
      </p>

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-gray-600 text-sm mb-1">Total Pokémon</div>
          <div className="text-3xl font-bold text-red-600">{totalPokemon}</div>
          <div className="text-xs text-gray-500 mt-1">{Math.round((totalPokemon / 151) * 100)}% du Pokédex</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-gray-600 text-sm mb-1">Niveau Moyen</div>
          <div className="text-3xl font-bold text-blue-600">{averageLevel}</div>
          <div className="text-xs text-gray-500 mt-1">Sur tous vos Pokémon</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-gray-600 text-sm mb-1">Favoris</div>
          <div className="text-3xl font-bold text-yellow-600">{favoritesCount}</div>
          <div className="text-xs text-gray-500 mt-1">❤️ Marqués comme favoris</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-gray-600 text-sm mb-1">Shiny</div>
          <div className="text-3xl font-bold text-purple-600">{shinyCount}</div>
          <div className="text-xs text-gray-500 mt-1">✨ Pokémon chromatiques</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-8">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pokemon')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'pokemon'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎒 Mes Pokémon
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Statistiques
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'pokemon' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Mes Pokémon</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  + Ajouter un Pokémon
                </button>
              </div>

              {collection.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎒</div>
                  <p className="text-xl text-gray-600 mb-2">Votre collection est vide</p>
                  <p className="text-gray-500 mb-6">Commencez à capturer des Pokémon!</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Ajouter votre premier Pokémon
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {collection.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-shadow relative"
                    >
                      <button
                        onClick={() => toggleFavorite(entry)}
                        className="absolute top-2 right-2 text-2xl hover:scale-110 transition-transform"
                      >
                        {entry.isFavorite ? '❤️' : '🤍'}
                      </button>

                      <Link href={`/encyclopedia/${entry.pokemon.id}`}>
                        <div className="text-center cursor-pointer">
                          <div className="relative w-32 h-32 mx-auto mb-2">
                            <Image
                              src={entry.isShiny ? entry.pokemon.spriteShinyUrl : entry.pokemon.spriteUrl}
                              alt={entry.pokemon.nameFr}
                              width={128}
                              height={128}
                              className="pixelated"
                            />
                            {entry.isShiny && (
                              <div className="absolute top-0 right-0 text-2xl">✨</div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 mb-1">
                            #{entry.pokemon.pokedexNumber.toString().padStart(3, '0')}
                          </div>

                          <h3 className="font-bold text-lg mb-1">
                            {entry.nickname || entry.pokemon.nameFr}
                          </h3>
                          {entry.nickname && (
                            <div className="text-xs text-gray-500 mb-2">({entry.pokemon.nameFr})</div>
                          )}

                          <div className="flex gap-1 justify-center mb-2 flex-wrap">
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

                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>Niv. {entry.level}</span>
                            <span>{entry.gender === 'MALE' ? '♂' : entry.gender === 'FEMALE' ? '♀' : '⚲'}</span>
                            <span>{entry.nature}</span>
                          </div>

                          <div className="text-xs text-gray-500">
                            {entry.pokeball} • {new Date(entry.captureDate).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="w-full mt-3 bg-red-100 text-red-600 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Statistiques de la Collection</h2>

              {collection.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Capturez des Pokémon pour voir vos statistiques
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Type distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Répartition par Type</h3>
                    <div className="space-y-3">
                      {topTypes.map(([type, count]) => (
                        <div key={type} className="flex items-center gap-3">
                          <div className="w-32 font-medium">{type}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                            <div
                              className="h-full bg-red-500 flex items-center justify-end pr-3 text-white text-sm font-semibold"
                              style={{ width: `${(count / totalPokemon) * 100}%` }}
                            >
                              {count}
                            </div>
                          </div>
                          <div className="w-16 text-sm text-gray-600 text-right">
                            {Math.round((count / totalPokemon) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Répartition par Sexe</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-32 font-medium">♂ Mâle</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 flex items-center justify-end pr-3 text-white text-sm font-semibold"
                            style={{ width: `${(genderStats.MALE / totalPokemon) * 100}%` }}
                          >
                            {genderStats.MALE}
                          </div>
                        </div>
                        <div className="w-16 text-sm text-gray-600 text-right">
                          {Math.round((genderStats.MALE / totalPokemon) * 100)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-32 font-medium">♀ Femelle</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="h-full bg-pink-500 flex items-center justify-end pr-3 text-white text-sm font-semibold"
                            style={{ width: `${(genderStats.FEMALE / totalPokemon) * 100}%` }}
                          >
                            {genderStats.FEMALE}
                          </div>
                        </div>
                        <div className="w-16 text-sm text-gray-600 text-right">
                          {Math.round((genderStats.FEMALE / totalPokemon) * 100)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-32 font-medium">⚲ Inconnu</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="h-full bg-gray-500 flex items-center justify-end pr-3 text-white text-sm font-semibold"
                            style={{ width: `${(genderStats.UNKNOWN / totalPokemon) * 100}%` }}
                          >
                            {genderStats.UNKNOWN}
                          </div>
                        </div>
                        <div className="w-16 text-sm text-gray-600 text-right">
                          {Math.round((genderStats.UNKNOWN / totalPokemon) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Pokemon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Ajouter un Pokémon</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddPokemon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pokémon *</label>
                  <select
                    value={newPokemon.pokemonId}
                    onChange={(e) => setNewPokemon({ ...newPokemon, pokemonId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner un Pokémon</option>
                    {allPokemon.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.pokedexNumber.toString().padStart(3, '0')} - {p.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Surnom (optionnel)</label>
                  <input
                    type="text"
                    value={newPokemon.nickname}
                    onChange={(e) => setNewPokemon({ ...newPokemon, nickname: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Pikachu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Niveau *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPokemon.level}
                      onChange={(e) => setNewPokemon({ ...newPokemon, level: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sexe</label>
                    <select
                      value={newPokemon.gender}
                      onChange={(e) => setNewPokemon({ ...newPokemon, gender: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="MALE">♂ Mâle</option>
                      <option value="FEMALE">♀ Femelle</option>
                      <option value="UNKNOWN">⚲ Inconnu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nature</label>
                    <select
                      value={newPokemon.nature}
                      onChange={(e) => setNewPokemon({ ...newPokemon, nature: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {NATURES.map((nature) => (
                        <option key={nature} value={nature}>{nature}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Poké Ball</label>
                    <select
                      value={newPokemon.pokeball}
                      onChange={(e) => setNewPokemon({ ...newPokemon, pokeball: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {POKEBALLS.map((ball) => (
                        <option key={ball.value} value={ball.value}>{ball.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newPokemon.isShiny}
                      onChange={(e) => setNewPokemon({ ...newPokemon, isShiny: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">✨ Version Shiny</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
