'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PokemonType {
  id: number;
  name: string;
  nameFr: string;
  color: string;
}

interface Pokemon {
  id: number;
  pokedexNumber: number;
  name: string;
  nameFr: string;
  spriteUrl: string;
  types: PokemonType[];
}

export default function EncyclopediaPage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    'Roche', 'Spectre', 'Dragon'
  ];

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-pokemon-blue">
        Encyclopédie Pokémon
      </h1>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <input
          type="text"
          placeholder="Rechercher un Pokémon..."
          className="px-4 py-2 border rounded-lg w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="px-4 py-2 border rounded-lg"
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
      </div>

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pokemon.map((poke) => (
            <Link
              key={poke.id}
              href={'/encyclopedia/' + poke.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 p-4"
            >
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">
                  #{poke.pokedexNumber.toString().padStart(3, '0')}
                </div>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={poke.spriteUrl}
                    alt={poke.nameFr}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">{poke.nameFr}</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                  {poke.types.map((type) => (
                    <span
                      key={type.id}
                      className="px-3 py-1 rounded-full text-white text-sm"
                      style={{ backgroundColor: type.color }}
                    >
                      {type.nameFr}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
