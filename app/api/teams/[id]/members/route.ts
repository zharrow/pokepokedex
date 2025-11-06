import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/teams/[id]/members - Ajoute un Pokémon à l'équipe
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const teamId = params.id;
    const body = await request.json();
    const { entryId, position } = body;

    // Vérifier que l'équipe appartient à l'utilisateur
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    if (team.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que l'équipe n'a pas déjà 6 membres
    if (team.members.length >= 6) {
      return NextResponse.json(
        { error: 'L\'équipe est complète (6 Pokémon maximum)' },
        { status: 400 }
      );
    }

    // Vérifier que l'entrée appartient à l'utilisateur
    const entry = await prisma.collectionEntry.findUnique({
      where: { id: entryId },
      include: {
        collection: true,
        pokemon: true,
      },
    });

    if (!entry || entry.collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Pokémon non trouvé dans votre collection' },
        { status: 404 }
      );
    }

    // Trouver la prochaine position disponible si non spécifiée
    const nextPosition = position || team.members.length + 1;

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        entryId,
        pokemonId: entry.pokemonId,
        position: nextPosition,
      },
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
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/members?memberId=xxx - Retire un Pokémon de l'équipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const teamId = params.id;
    const memberId = request.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId requis' },
        { status: 400 }
      );
    }

    // Vérifier que le membre appartient à une équipe de l'utilisateur
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        team: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      );
    }

    if (member.team.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
