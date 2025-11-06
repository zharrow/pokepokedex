import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/medical/trainers - Récupère la liste des dresseurs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'HEALER') {
      return NextResponse.json(
        { error: 'Accès réservé aux soigneurs' },
        { status: 403 }
      );
    }

    const trainers = await prisma.user.findMany({
      where: {
        role: 'TRAINER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        badges: true,
        collections: {
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
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(trainers);
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trainers' },
      { status: 500 }
    );
  }
}
