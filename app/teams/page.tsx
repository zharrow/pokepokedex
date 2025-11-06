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
  pokemon: Pokemon;
}

interface TeamMember {
  id: string;
  position: number;
  collectionEntry: CollectionEntry;
}

interface Team {
  id: string;
  name: string;
  isActive: boolean;
  members: TeamMember[];
  createdAt: string;
}

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddPokemonModal, setShowAddPokemonModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchTeams();
    fetchCollection();
  }, [session, status]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollection = async () => {
    try {
      const response = await fetch('/api/collection');
      const data = await response.json();
      setCollection(data.entries || []);
    } catch (error) {
      console.error('Error fetching collection:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName || 'Nouvelle Équipe' }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewTeamName('');
        fetchTeams();
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette équipe?')) return;

    try {
      await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
      }
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleSetActive = async (teamId: string) => {
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      fetchTeams();
    } catch (error) {
      console.error('Error setting active team:', error);
    }
  };

  const handleAddPokemon = async (entryId: string) => {
    if (!selectedTeam) return;
    if (selectedTeam.members.length >= 6) {
      alert('L\'équipe est complète (6 Pokémon maximum)');
      return;
    }

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });

      if (response.ok) {
        setShowAddPokemonModal(false);
        fetchTeams();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Error adding pokemon to team:', error);
    }
  };

  const handleRemovePokemon = async (memberId: string) => {
    if (!selectedTeam) return;

    try {
      await fetch(`/api/teams/${selectedTeam.id}/members?memberId=${memberId}`, {
        method: 'DELETE',
      });
      fetchTeams();
    } catch (error) {
      console.error('Error removing pokemon from team:', error);
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

  // Filter available pokemon (not already in team)
  const availablePokemon = collection.filter(
    entry => !selectedTeam?.members.some(m => m.collectionEntry.id === entry.id)
  );

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">
        Mes Équipes
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Gérez vos équipes de 6 Pokémon maximum
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des équipes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Équipes</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                + Créer
              </button>
            </div>

            {teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">Aucune équipe</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-red-600 hover:underline"
                >
                  Créer votre première équipe
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTeam?.id === team.id
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{team.name}</h3>
                      {team.isActive && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {team.members.length}/6 Pokémon
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Détails de l'équipe */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedTeam.name}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedTeam.members.length}/6 Pokémon
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedTeam.isActive && (
                    <button
                      onClick={() => handleSetActive(selectedTeam.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Définir active
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTeam(selectedTeam.id)}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Grille 2x3 pour les 6 emplacements */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6].map((position) => {
                  const member = selectedTeam.members.find(m => m.position === position);

                  return (
                    <div
                      key={position}
                      className={`relative aspect-square rounded-xl border-2 ${
                        member
                          ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
                          : 'border-dashed border-gray-300 bg-gray-50'
                      }`}
                    >
                      {member ? (
                        <div className="p-4 h-full flex flex-col items-center justify-center">
                          <button
                            onClick={() => handleRemovePokemon(member.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm flex items-center justify-center"
                          >
                            ×
                          </button>

                          <div className="relative w-20 h-20 mb-2">
                            <Image
                              src={
                                member.collectionEntry.isShiny
                                  ? member.collectionEntry.pokemon.spriteShinyUrl
                                  : member.collectionEntry.pokemon.spriteUrl
                              }
                              alt={member.collectionEntry.pokemon.nameFr}
                              width={80}
                              height={80}
                              className="pixelated"
                            />
                            {member.collectionEntry.isShiny && (
                              <div className="absolute top-0 right-0 text-lg">✨</div>
                            )}
                          </div>

                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              #{member.collectionEntry.pokemon.pokedexNumber.toString().padStart(3, '0')}
                            </div>
                            <div className="font-semibold text-sm">
                              {member.collectionEntry.nickname ||
                                member.collectionEntry.pokemon.nameFr}
                            </div>
                            <div className="text-xs text-gray-600">
                              Niv. {member.collectionEntry.level}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddPokemonModal(true)}
                          className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <div className="text-4xl mb-2">+</div>
                          <div className="text-sm">Ajouter</div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedTeam.members.length < 6 && (
                <button
                  onClick={() => setShowAddPokemonModal(true)}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  + Ajouter un Pokémon
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <p className="text-xl text-gray-600 mb-2">Aucune équipe sélectionnée</p>
              <p className="text-gray-500">Sélectionnez une équipe ou créez-en une nouvelle</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Créer Équipe */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Créer une équipe</h2>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de l'équipe</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Équipe Champion"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTeamName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajouter Pokémon */}
      {showAddPokemonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Ajouter un Pokémon</h2>
              <button
                onClick={() => setShowAddPokemonModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {availablePokemon.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Tous vos Pokémon sont déjà dans cette équipe</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availablePokemon.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleAddPokemon(entry.id)}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors text-center"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <Image
                        src={entry.isShiny ? entry.pokemon.spriteShinyUrl : entry.pokemon.spriteUrl}
                        alt={entry.pokemon.nameFr}
                        width={80}
                        height={80}
                        className="pixelated"
                      />
                      {entry.isShiny && (
                        <div className="absolute top-0 right-0">✨</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      #{entry.pokemon.pokedexNumber.toString().padStart(3, '0')}
                    </div>
                    <div className="font-semibold text-sm">
                      {entry.nickname || entry.pokemon.nameFr}
                    </div>
                    <div className="text-xs text-gray-600">Niv. {entry.level}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
