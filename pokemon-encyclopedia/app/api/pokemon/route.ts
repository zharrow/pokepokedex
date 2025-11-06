import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/pokemon - Liste tous les Pokémon avec filtres optionnels
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '151');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (type) {
      where.types = {
        some: {
          nameFr: type,
        },
      };
    }

    if (search) {
      where.OR = [
        { nameFr: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pokemon, total] = await Promise.all([
      prisma.pokemon.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          types: true,
          abilities: true,
        },
        orderBy: {
          pokedexNumber: 'asc',
        },
      }),
      prisma.pokemon.count({ where }),
    ]);

    return NextResponse.json({
      pokemon,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pokemon' },
      { status: 500 }
    );
  }
}
