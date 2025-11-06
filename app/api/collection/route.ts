import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/collection - Récupère la collection de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer ou créer la collection
    let collection = await prisma.collection.findUnique({
      where: { userId: session.user.id },
      include: {
        entries: {
          include: {
            pokemon: {
              include: {
                types: true,
              },
            },
          },
          orderBy: {
            captureDate: 'desc',
          },
        },
      },
    });

    if (!collection) {
      collection = await prisma.collection.create({
        data: {
          userId: session.user.id,
        },
        include: {
          entries: {
            include: {
              pokemon: {
                include: {
                  types: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// POST /api/collection - Ajoute un Pokémon à la collection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      pokemonId,
      nickname,
      level,
      gender,
      isShiny,
      nature,
      pokeball,
      ivHp,
      ivAttack,
      ivDefense,
      ivSpAttack,
      ivSpDefense,
      ivSpeed,
    } = body;

    // Récupérer ou créer la collection
    let collection = await prisma.collection.findUnique({
      where: { userId: session.user.id },
    });

    if (!collection) {
      collection = await prisma.collection.create({
        data: { userId: session.user.id },
      });
    }

    // Ajouter l'entrée
    const entry = await prisma.collectionEntry.create({
      data: {
        collectionId: collection.id,
        pokemonId: parseInt(pokemonId),
        nickname: nickname || null,
        level: parseInt(level) || 1,
        gender: gender || 'UNKNOWN',
        isShiny: isShiny || false,
        nature: nature || 'Hardy',
        pokeball: pokeball || 'pokeball',
        ivHp: parseInt(ivHp) || 0,
        ivAttack: parseInt(ivAttack) || 0,
        ivDefense: parseInt(ivDefense) || 0,
        ivSpAttack: parseInt(ivSpAttack) || 0,
        ivSpDefense: parseInt(ivSpDefense) || 0,
        ivSpeed: parseInt(ivSpeed) || 0,
      },
      include: {
        pokemon: {
          include: {
            types: true,
          },
        },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error adding to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add to collection' },
      { status: 500 }
    );
  }
}
