import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/collection/[id] - Supprime un Pokémon de la collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: entryId } = await params;

    // Vérifier que l'entrée appartient à l'utilisateur
    const entry = await prisma.collectionEntry.findUnique({
      where: { id: entryId },
      include: {
        collection: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entrée non trouvée' },
        { status: 404 }
      );
    }

    if (entry.collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.collectionEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete from collection' },
      { status: 500 }
    );
  }
}

// PATCH /api/collection/[id] - Met à jour une entrée (favoris, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: entryId } = await params;
    const body = await request.json();

    // Vérifier que l'entrée appartient à l'utilisateur
    const entry = await prisma.collectionEntry.findUnique({
      where: { id: entryId },
      include: {
        collection: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entrée non trouvée' },
        { status: 404 }
      );
    }

    if (entry.collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const updated = await prisma.collectionEntry.update({
      where: { id: entryId },
      data: body,
      include: {
        pokemon: {
          include: {
            types: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating collection entry:', error);
    return NextResponse.json(
      { error: 'Failed to update collection entry' },
      { status: 500 }
    );
  }
}
