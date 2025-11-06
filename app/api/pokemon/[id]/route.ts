import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/pokemon/[id] - Récupère un Pokémon par son ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const pokemon = await prisma.pokemon.findUnique({
      where: { id },
      include: {
        types: true,
        abilities: true,
        moves: {
          include: {
            move: true,
          },
          orderBy: {
            levelLearned: 'asc',
          },
        },
        evolvesFrom: {
          select: {
            id: true,
            nameFr: true,
            pokedexNumber: true,
            spriteUrl: true,
          },
        },
        evolvesTo: {
          select: {
            id: true,
            nameFr: true,
            pokedexNumber: true,
            spriteUrl: true,
          },
        },
      },
    });

    if (!pokemon) {
      return NextResponse.json(
        { error: 'Pokemon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pokemon);
  } catch (error) {
    console.error('Error fetching pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pokemon' },
      { status: 500 }
    );
  }
}
