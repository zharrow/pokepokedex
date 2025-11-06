'use client';

import { useEffect, useState } from 'react';
import PokemonCard from '@/components/PokemonCard';

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
  types: PokemonType[];
  abilities: Ability[];
}

export default function EncyclopediaPage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showShiny, setShowShiny] = useState(false);

  useEffect(() => {
    fetchPokemon();
  }, [filter, searchTerm]);

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append('type', filter);
      if (searchTerm) params.append('search', searchTerm);

      const queryString = params.toString();
      const response = await fetch('/api/pokemon?' + queryString);
      const data = await response.json();
      setPokemon(data.pokemon);
    } catch (error) {
      console.error('Error fetching pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const types = [
    'Normal', 'Feu', 'Eau', 'Électrik', 'Plante', 'Glace',
    'Combat', 'Poison', 'Sol', 'Vol', 'Psy', 'Insecte',
    'Roche', 'Spectre', 'Dragon', 'Ténèbres', 'Acier', 'Fée'
  ];

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">
        Encyclopédie Pokémon
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Découvrez les 151 Pokémon de la région de Kanto
      </p>

      {/* Filters and Search */}
      <div className="mb-8 bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Tous les types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowShiny(!showShiny)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showShiny
                ? 'bg-yellow-400 text-yellow-900 shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showShiny ? '✨ Mode Shiny' : '✨ Voir Shiny'}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <span className="font-semibold text-red-600">{pokemon.length}</span> Pokémon trouvés
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des Pokémon...</p>
        </div>
      ) : pokemon.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Aucun Pokémon trouvé</p>
          <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pokemon.map((poke) => (
            <PokemonCard key={poke.id} pokemon={poke} showShiny={showShiny} />
          ))}
        </div>
      )}
    </div>
  );
}
