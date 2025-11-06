import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/medical/pokecenters - Récupère la liste des centres Pokémon
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const centers = await prisma.pokeCenter.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(centers);
  } catch (error) {
    console.error('Error fetching poke centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poke centers' },
      { status: 500 }
    );
  }
}
