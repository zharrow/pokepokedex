import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import Header from '@/components/Header'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Encyclopédie Pokémon - Kanto',
  description: 'Encyclopédie complète des Pokémon de la région de Kanto',
  manifest: '/manifest.json',
  themeColor: '#DC2626',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={montserrat.variable}>
      <body className="bg-gray-50 min-h-screen font-sans">
        <Providers>
          <Header />
          <main className="container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm opacity-75">
                Données fournies par <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">PokéAPI</a>
              </p>
              <p className="text-xs opacity-50 mt-2">
                Application Pokédex Kanto - 151 Pokémon de première génération
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
