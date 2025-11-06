'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface PokemonType {
  id: number;
  name: string;
  nameFr: string;
  color: string;
}

interface Ability {
  id: number;
  name: string;
  nameFr: string;
  description: string;
  isHidden: boolean;
}

interface Move {
  id: number;
  name: string;
  nameFr: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  description: string;
}

interface PokemonMove {
  id: number;
  learnMethod: string;
  levelLearned: number | null;
  move: Move;
}

interface Pokemon {
  id: number;
  pokedexNumber: number;
  name: string;
  nameFr: string;
  height: number;
  weight: number;
  description: string;
  spriteUrl: string;
  spriteShinyUrl: string;
  spriteFemaleUrl: string | null;
  spriteShinyFemaleUrl: string | null;
  hasGenderDifference: boolean;
  genderDifferenceDesc: string | null;
  evolutionCondition: string | null;
  evolvesFromId: number | null;
  eggType: string;
  eggCycles: number;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  types: PokemonType[];
  abilities: Ability[];
  moves: PokemonMove[];
  evolvesTo: Pokemon[];
  evolvesFrom: Pokemon | null;
}

export default function PokemonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showShiny, setShowShiny] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [showFemale, setShowFemale] = useState(false);
  const [moveFilter, setMoveFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchPokemon();
  }, [id]);

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pokemon/${id}`);
      const data = await response.json();
      setPokemon(data);
    } catch (error) {
      console.error('Error fetching pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Pokémon introuvable</p>
        <Link href="/encyclopedia" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour à l'encyclopédie
        </Link>
      </div>
    );
  }

  const getCurrentSprite = () => {
    if (showFemale && pokemon.hasGenderDifference) {
      if (showShiny) {
        return pokemon.spriteShinyFemaleUrl || pokemon.spriteShinyUrl;
      }
      return pokemon.spriteFemaleUrl || pokemon.spriteUrl;
    }
    if (showShiny) {
      return showBack
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${pokemon.pokedexNumber}.png`
        : pokemon.spriteShinyUrl;
    }
    return showBack
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemon.pokedexNumber}.png`
      : pokemon.spriteUrl;
  };

  const totalStats = pokemon.hp + pokemon.attack + pokemon.defense +
                      pokemon.specialAttack + pokemon.specialDefense + pokemon.speed;

  const primaryColor = pokemon.types[0]?.color || '#777';

  const filteredMoves = pokemon.moves.filter(pm => {
    if (moveFilter === 'all') return true;
    return pm.learnMethod === moveFilter;
  });

  const tabs = [
    { id: 'stats', label: 'Statistiques', icon: '📊' },
    { id: 'info', label: 'Informations', icon: 'ℹ️' },
    { id: 'evolution', label: 'Évolution', icon: '🔄' },
    { id: 'moves', label: 'Capacités', icon: '⚔️' },
  ];

  return (
    <div className="py-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>←</span>
        <span>Retour</span>
      </button>

      {/* Header with primary type color */}
      <div
        className="rounded-t-2xl p-6 text-white mb-0"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 font-semibold">
            #{pokemon.pokedexNumber.toString().padStart(3, '0')}
          </span>
          <div className="flex gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type.id}
                className="px-3 py-1 rounded-full text-white text-sm font-medium bg-white/20"
              >
                {type.nameFr}
              </span>
            ))}
          </div>
        </div>
        <h1 className="text-4xl font-bold">{pokemon.nameFr}</h1>
        <p className="text-white/80 text-sm mt-1">{pokemon.name}</p>
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-b-2xl shadow-xl">
        {/* Hero section with sprite */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Sprite display */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                <Image
                  src={getCurrentSprite()}
                  alt={pokemon.nameFr}
                  width={192}
                  height={192}
                  className="object-contain pixelated"
                />
                {showShiny && (
                  <div className="absolute top-2 right-2 text-2xl">✨</div>
                )}
              </div>

              {/* Sprite controls */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setShowBack(!showBack)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showBack ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showBack ? 'Face' : 'Dos'}
                </button>
                <button
                  onClick={() => setShowShiny(!showShiny)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showShiny ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✨ Shiny
                </button>
                {pokemon.hasGenderDifference && (
                  <button
                    onClick={() => setShowFemale(!showFemale)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      showFemale ? 'bg-pink-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showFemale ? '♀' : '♂'}
                  </button>
                )}
              </div>
            </div>

            {/* Basic info */}
            <div className="flex-1">
              <p className="text-gray-700 mb-6">{pokemon.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Taille</div>
                  <div className="text-2xl font-bold">{pokemon.height}m</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Poids</div>
                  <div className="text-2xl font-bold">{pokemon.weight}kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === tab.id ? { borderColor: primaryColor } : {}}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Statistiques de base</h2>
              <div className="space-y-3 mb-6">
                <StatBar label="PV" value={pokemon.hp} color="#FF5959" />
                <StatBar label="Attaque" value={pokemon.attack} color="#F5AC78" />
                <StatBar label="Défense" value={pokemon.defense} color="#FAE078" />
                <StatBar label="Att. Spé" value={pokemon.specialAttack} color="#9DB7F5" />
                <StatBar label="Déf. Spé" value={pokemon.specialDefense} color="#A7DB8D" />
                <StatBar label="Vitesse" value={pokemon.speed} color="#FA92B2" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {totalStats}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Informations détaillées</h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Talents</h3>
                <div className="space-y-2">
                  {pokemon.abilities.map((ability) => (
                    <div key={ability.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{ability.nameFr}</span>
                        {ability.isHidden && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Talent Caché
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{ability.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Reproduction</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Groupe d'œuf</div>
                    <div className="font-semibold">{pokemon.eggType}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Cycles d'éclosion</div>
                    <div className="font-semibold">{pokemon.eggCycles}</div>
                  </div>
                </div>
              </div>

              {pokemon.hasGenderDifference && (
                <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="font-semibold text-pink-900 mb-1">
                    Différences entre sexes
                  </div>
                  <p className="text-sm text-pink-800">
                    {pokemon.genderDifferenceDesc}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evolution' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Chaîne d'évolution</h2>
              {pokemon.evolvesFrom || pokemon.evolvesTo.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {pokemon.evolvesFrom && (
                    <>
                      <EvolutionCard
                        pokemon={pokemon.evolvesFrom}
                        isCurrent={false}
                        onClick={() => router.push(`/encyclopedia/${pokemon.evolvesFrom!.id}`)}
                      />
                      <div className="text-2xl text-gray-400">→</div>
                    </>
                  )}

                  <EvolutionCard pokemon={pokemon} isCurrent={true} />

                  {pokemon.evolvesTo.length > 0 && (
                    <>
                      <div className="text-2xl text-gray-400">→</div>
                      <div className="flex flex-col gap-4">
                        {pokemon.evolvesTo.map((evo) => (
                          <EvolutionCard
                            key={evo.id}
                            pokemon={evo}
                            isCurrent={false}
                            onClick={() => router.push(`/encyclopedia/${evo.id}`)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Ce Pokémon n'a pas d'évolution
                </div>
              )}

              {pokemon.evolutionCondition && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-semibold text-blue-900 mb-1">
                    Condition d'évolution
                  </div>
                  <p className="text-sm text-blue-800">
                    {pokemon.evolutionCondition}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'moves' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Capacités</h2>

              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => setMoveFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    moveFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Toutes ({pokemon.moves.length})
                </button>
                <button
                  onClick={() => setMoveFilter('LEVEL_UP')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    moveFilter === 'LEVEL_UP' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Montée de niveau
                </button>
                <button
                  onClick={() => setMoveFilter('TM')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    moveFilter === 'TM' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  CT
                </button>
                <button
                  onClick={() => setMoveFilter('EGG')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    moveFilter === 'EGG' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Reproduction
                </button>
              </div>

              {filteredMoves.length > 0 ? (
                <div className="space-y-2">
                  {filteredMoves.map((pm) => (
                    <div key={pm.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="font-semibold">{pm.move.nameFr}</div>
                        <div className="text-sm text-gray-600">{pm.move.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {pm.learnMethod === 'LEVEL_UP' && pm.levelLearned && `Niv. ${pm.levelLearned}`}
                          {pm.learnMethod === 'TM' && 'CT/CS'}
                          {pm.learnMethod === 'EGG' && 'Œuf'}
                          {pm.learnMethod === 'TUTOR' && 'Tuteur'}
                        </div>
                        {pm.move.power && (
                          <div className="text-sm font-semibold">⚡ {pm.move.power}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune capacité trouvée pour ce filtre
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const maxStat = 255;
  const percentage = (value / maxStat) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-sm font-medium text-gray-700">{label}</div>
      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-12 text-sm font-bold text-right">{value}</div>
    </div>
  );
}

function EvolutionCard({
  pokemon,
  isCurrent,
  onClick
}: {
  pokemon: any;
  isCurrent: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border-2 transition-all ${
        isCurrent
          ? 'border-red-500 shadow-lg'
          : 'border-gray-200 hover:border-gray-400 cursor-pointer hover:shadow-md'
      }`}
    >
      <div className="text-center">
        <Image
          src={pokemon.spriteUrl}
          alt={pokemon.nameFr}
          width={96}
          height={96}
          className="mx-auto pixelated"
        />
        <div className="text-xs text-gray-500 mt-2">
          #{pokemon.pokedexNumber.toString().padStart(3, '0')}
        </div>
        <div className="font-semibold">{pokemon.nameFr}</div>
        {isCurrent && (
          <div className="text-xs text-red-600 font-medium mt-1">Actuel</div>
        )}
      </div>
    </div>
  );
}
