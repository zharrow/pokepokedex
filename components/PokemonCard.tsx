'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  abilities?: Ability[];
}

interface PokemonCardProps {
  pokemon: Pokemon;
  showShiny: boolean;
}

export default function PokemonCard({ pokemon, showShiny }: PokemonCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const spriteUrl = showShiny ? pokemon.spriteShinyUrl : pokemon.spriteUrl;

  return (
    <div className="perspective-1000">
      <div
        className={`relative w-full h-[320px] transition-transform duration-500 transform-style-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow h-full p-4 flex flex-col">
            <div className="text-sm text-gray-500 mb-2 flex justify-between items-center">
              <span>#{pokemon.pokedexNumber.toString().padStart(3, '0')}</span>
              {showShiny && <span className="text-yellow-500">✨</span>}
            </div>

            <div className="relative w-full h-32 mb-4 flex items-center justify-center">
              <Image
                src={spriteUrl}
                alt={pokemon.nameFr}
                width={128}
                height={128}
                className="object-contain pixelated"
              />
            </div>

            <h3 className="font-bold text-lg mb-2 text-center">{pokemon.nameFr}</h3>

            <div className="flex gap-2 justify-center flex-wrap mb-4">
              {pokemon.types.map((type) => (
                <span
                  key={type.id}
                  className="px-3 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: type.color }}
                >
                  {type.nameFr}
                </span>
              ))}
            </div>

            <div className="mt-auto text-center text-xs text-gray-500">
              Cliquez pour plus d'infos
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg h-full p-4 flex flex-col">
            <div className="text-sm text-gray-500 mb-2">
              #{pokemon.pokedexNumber.toString().padStart(3, '0')}
            </div>

            <h3 className="font-bold text-lg mb-3 text-center">{pokemon.nameFr}</h3>

            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
              {pokemon.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-white rounded p-2">
                <span className="text-gray-500">Taille:</span>
                <span className="font-semibold ml-1">{pokemon.height}m</span>
              </div>
              <div className="bg-white rounded p-2">
                <span className="text-gray-500">Poids:</span>
                <span className="font-semibold ml-1">{pokemon.weight}kg</span>
              </div>
            </div>

            {pokemon.abilities && pokemon.abilities.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">Talents:</div>
                <div className="space-y-1">
                  {pokemon.abilities.slice(0, 3).map((ability) => (
                    <div key={ability.id} className="text-xs bg-white rounded px-2 py-1">
                      {ability.nameFr}
                      {ability.isHidden && <span className="text-purple-600 ml-1">⭐</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/encyclopedia/${pokemon.id}`}
              className="mt-auto bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Voir plus →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
