import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/teams - Récupère toutes les équipes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const teams = await prisma.team.findMany({
      where: { userId: session.user.id },
      include: {
        members: {
          include: {
            collectionEntry: {
              include: {
                pokemon: {
                  include: {
                    types: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Crée une nouvelle équipe
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
    const { name, isActive } = body;

    // Si on veut activer cette équipe, désactiver les autres
    if (isActive) {
      await prisma.team.updateMany({
        where: { userId: session.user.id, isActive: true },
        data: { isActive: false },
      });
    }

    const team = await prisma.team.create({
      data: {
        userId: session.user.id,
        name: name || 'Nouvelle Équipe',
        isActive: isActive || false,
      },
      include: {
        members: {
          include: {
            collectionEntry: {
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
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
