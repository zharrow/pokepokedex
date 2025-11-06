'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CONDITIONS = [
  'Empoisonnement',
  'Brûlure',
  'Paralysie',
  'Gel',
  'Sommeil anormal',
  'Confusion',
  'Épuisement / Fatigue extrême',
  'Blessures de combat',
  'Fracture',
  'Malnutrition',
  'Déshydratation',
  'Choc traumatique',
  'Réaction allergique',
  'Maladie rare',
  'Surmenage psychique',
  'Autre condition',
];

export default function MedicalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [records, setRecords] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [pokeCenters, setPokeCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newRecord, setNewRecord] = useState({
    trainerId: '',
    pokemonId: '',
    pokeCenterId: '',
    condition: '',
    status: 'IN_TREATMENT',
    healthPercent: 50,
    diagnosis: '',
    treatment: '',
    notes: '',
    height: '',
    weight: '',
    gender: 'UNKNOWN',
  });

  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (session.user.role !== 'HEALER') {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, status, activeTab]);

  const fetchData = async () => {
    try {
      const [recordsRes, trainersRes, centersRes] = await Promise.all([
        fetch(`/api/medical?status=${activeTab}`),
        fetch('/api/medical/trainers'),
        fetch('/api/medical/pokecenters'),
      ]);

      const recordsData = await recordsRes.json();
      const trainersData = await trainersRes.json();
      const centersData = await centersRes.json();

      setRecords(recordsData);
      setTrainers(trainersData);
      setPokeCenters(centersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewRecord({
          trainerId: '',
          pokemonId: '',
          pokeCenterId: '',
          condition: '',
          status: 'IN_TREATMENT',
          healthPercent: 50,
          diagnosis: '',
          treatment: '',
          notes: '',
          height: '',
          weight: '',
          gender: 'UNKNOWN',
        });
        setSelectedTrainer(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleUpdateStatus = async (recordId: string, newStatus: string) => {
    try {
      await fetch(`/api/medical/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
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
  const totalActive = records.filter(r =>
    r.status === 'IN_TREATMENT' || r.status === 'UNDER_OBSERVATION'
  ).length;
  const totalRecovered = records.filter(r => r.status === 'RECOVERED').length;
  const recoveryRate = totalRecovered > 0
    ? Math.round((totalRecovered / (totalActive + totalRecovered)) * 100)
    : 0;
  const inTreatment = records.filter(r => r.status === 'IN_TREATMENT').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_TREATMENT':
        return '🔴';
      case 'UNDER_OBSERVATION':
        return '🟡';
      case 'RECOVERED':
        return '🟢';
      case 'CRITICAL':
        return '🚨';
      default:
        return '⚪';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_TREATMENT':
        return 'En traitement';
      case 'UNDER_OBSERVATION':
        return 'En observation';
      case 'RECOVERED':
        return 'Rétabli';
      case 'CRITICAL':
        return 'Critique';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TREATMENT':
        return 'bg-red-100 text-red-800';
      case 'UNDER_OBSERVATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'RECOVERED':
        return 'bg-green-100 text-green-800';
      case 'CRITICAL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">
        Centre Pokémon - Suivi Médical
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Gérez les soins et le suivi médical des Pokémon
      </p>

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🏥</div>
            <div>
              <div className="text-gray-600 text-sm">Dossiers Actifs</div>
              <div className="text-3xl font-bold text-red-600">{totalActive}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Patients en cours de traitement
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📈</div>
            <div>
              <div className="text-gray-600 text-sm">Taux de Rétablissement</div>
              <div className="text-3xl font-bold text-green-600">{recoveryRate}%</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {totalRecovered} Pokémon rétablis
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">💊</div>
            <div>
              <div className="text-gray-600 text-sm">En Traitement</div>
              <div className="text-3xl font-bold text-blue-600">{inTreatment}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Nécessitent une attention immédiate
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🏥 Dossiers Actifs ({totalActive})
              </button>
              <button
                onClick={() => setActiveTab('recovered')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'recovered'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Historique ({totalRecovered})
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              + Nouveau Dossier
            </button>
          </div>
        </div>

        <div className="p-6">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-xl text-gray-600 mb-2">
                {activeTab === 'active' ? 'Aucun dossier actif' : 'Aucun dossier dans l\'historique'}
              </p>
              <p className="text-gray-500 mb-6">
                {activeTab === 'active'
                  ? 'Créez un nouveau dossier pour commencer'
                  : 'Les dossiers rétablis apparaîtront ici'
                }
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Créer un dossier
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={record.pokemon.spriteUrl}
                        alt={record.pokemon.nameFr}
                        width={80}
                        height={80}
                        className="pixelated"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">
                        #{record.pokemon.pokedexNumber.toString().padStart(3, '0')}
                      </div>
                      <h3 className="font-bold text-lg mb-1 truncate">
                        {record.pokemon.nameFr}
                      </h3>
                      <div className="flex gap-1 flex-wrap">
                        {record.pokemon.types.map((type: any) => (
                          <span
                            key={type.id}
                            className="px-2 py-0.5 rounded-full text-white text-xs"
                            style={{ backgroundColor: type.color }}
                          >
                            {type.nameFr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Dresseur:</span>
                      <span className="font-semibold">{record.trainer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Centre:</span>
                      <span className="font-medium text-xs truncate">{record.pokeCenter.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-medium">{record.condition}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Santé</span>
                      <span className="font-semibold">{record.healthPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          record.healthPercent > 75
                            ? 'bg-green-500'
                            : record.healthPercent > 50
                            ? 'bg-yellow-500'
                            : record.healthPercent > 25
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${record.healthPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(record.status)}`}>
                      <span>{getStatusIcon(record.status)}</span>
                      <span>{getStatusLabel(record.status)}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.admissionDate).toLocaleDateString()}
                    </span>
                  </div>

                  {record.notes && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {record.notes}
                    </p>
                  )}

                  {record.status !== 'RECOVERED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(record.id, 'UNDER_OBSERVATION')}
                        className="flex-1 bg-yellow-100 text-yellow-700 py-1.5 rounded text-xs hover:bg-yellow-200 transition-colors"
                      >
                        🟡 Observation
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(record.id, 'RECOVERED')}
                        className="flex-1 bg-green-100 text-green-700 py-1.5 rounded text-xs hover:bg-green-200 transition-colors"
                      >
                        🟢 Rétabli
                      </button>
                    </div>
                  )}

                  {record.dischargeDate && (
                    <div className="text-xs text-gray-500 text-center mt-2">
                      Sorti le {new Date(record.dischargeDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Nouveau Dossier Médical</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedTrainer(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dresseur *</label>
                  <select
                    value={newRecord.trainerId}
                    onChange={(e) => {
                      setNewRecord({ ...newRecord, trainerId: e.target.value, pokemonId: '' });
                      const trainer = trainers.find(t => t.id === e.target.value);
                      setSelectedTrainer(trainer);
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner un dresseur</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name} ({trainer.collections[0]?.entries.length || 0} Pokémon)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTrainer && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Pokémon du dresseur *</label>
                    <select
                      value={newRecord.pokemonId}
                      onChange={(e) => {
                        const pokemon = selectedTrainer.collections[0]?.entries.find(
                          (entry: any) => entry.pokemonId === parseInt(e.target.value)
                        );
                        setNewRecord({
                          ...newRecord,
                          pokemonId: e.target.value,
                          height: pokemon?.pokemon.height.toString() || '',
                          weight: pokemon?.pokemon.weight.toString() || '',
                          gender: pokemon?.gender || 'UNKNOWN',
                        });
                      }}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Sélectionner un Pokémon</option>
                      {(selectedTrainer.collections[0]?.entries || []).map((entry: any) => (
                        <option key={entry.pokemonId} value={entry.pokemonId}>
                          #{entry.pokemon.pokedexNumber.toString().padStart(3, '0')} - {entry.pokemon.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Centre Pokémon *</label>
                  <select
                    value={newRecord.pokeCenterId}
                    onChange={(e) => setNewRecord({ ...newRecord, pokeCenterId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner un centre</option>
                    {pokeCenters.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition Médicale *</label>
                  <select
                    value={newRecord.condition}
                    onChange={(e) => setNewRecord({ ...newRecord, condition: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner une condition</option>
                    {CONDITIONS.map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Statut *</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="IN_TREATMENT">En traitement</option>
                    <option value="UNDER_OBSERVATION">En observation</option>
                    <option value="RECOVERED">Rétabli</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Santé: {newRecord.healthPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newRecord.healthPercent}
                    onChange={(e) => setNewRecord({ ...newRecord, healthPercent: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Diagnostic *</label>
                  <textarea
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Traitement</label>
                  <textarea
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedTrainer(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Créer le Dossier
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
