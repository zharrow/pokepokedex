import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Encyclopédie Pokémon - Kanto',
  description: 'Encyclopédie complète des Pokémon de la région de Kanto',
  manifest: '/manifest.json',
  themeColor: '#3B4CCA',
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="fr">
      <body className="font-pokemon">
        <nav className="bg-pokemon-blue text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Pokédex Kanto</h1>
            <div className="flex gap-4">
              <a href="/encyclopedia" className="hover:text-pokemon-yellow">Encyclopédie</a>
              <a href="/collection" className="hover:text-pokemon-yellow">Ma Collection</a>
              <a href="/medical" className="hover:text-pokemon-yellow">Centre Pokémon</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
