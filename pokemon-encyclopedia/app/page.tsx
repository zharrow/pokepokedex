import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-pokemon-blue mb-8">
          Bienvenue dans le Pokédex Kanto
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Découvrez tous les Pokémon de la première génération
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link 
            href="/encyclopedia" 
            className="p-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Encyclopédie</h2>
            <p className="text-blue-100">Explorez tous les Pokémon de Kanto</p>
          </Link>
          
          <Link 
            href="/collection" 
            className="p-8 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Ma Collection</h2>
            <p className="text-red-100">Gérez vos Pokémon et équipes</p>
          </Link>
          
          <Link 
            href="/medical" 
            className="p-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Centre Pokémon</h2>
            <p className="text-green-100">Suivi médical et soins</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
