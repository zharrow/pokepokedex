import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH /api/medical/[id] - Met à jour un dossier médical
export async function PATCH(
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

    if (session.user.role !== 'HEALER') {
      return NextResponse.json(
        { error: 'Accès réservé aux soigneurs' },
        { status: 403 }
      );
    }

    const recordId = params.id;
    const body = await request.json();

    // Si le statut passe à RECOVERED, mettre la date de sortie
    if (body.status === 'RECOVERED' && !body.dischargeDate) {
      body.dischargeDate = new Date();
    }

    const updated = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: body,
      include: {
        pokemon: {
          include: {
            types: true,
          },
        },
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pokeCenter: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to update medical record' },
      { status: 500 }
    );
  }
}

// DELETE /api/medical/[id] - Supprime un dossier médical
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

    if (session.user.role !== 'HEALER') {
      return NextResponse.json(
        { error: 'Accès réservé aux soigneurs' },
        { status: 403 }
      );
    }

    const recordId = params.id;

    await prisma.medicalRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical record' },
      { status: 500 }
    );
  }
}
