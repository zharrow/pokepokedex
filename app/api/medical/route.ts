import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/medical - Récupère tous les dossiers médicaux (pour soigneurs)
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

    const status = request.nextUrl.searchParams.get('status');

    const where: any = {};
    if (status === 'active') {
      where.status = { in: ['IN_TREATMENT', 'UNDER_OBSERVATION'] };
    } else if (status === 'recovered') {
      where.status = 'RECOVERED';
    } else if (status) {
      where.status = status;
    }

    const records = await prisma.medicalRecord.findMany({
      where,
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
      orderBy: {
        admissionDate: 'desc',
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

// POST /api/medical - Crée un nouveau dossier médical
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      trainerId,
      pokemonId,
      pokeCenterId,
      status,
      healthPercent,
      condition,
      diagnosis,
      treatment,
      notes,
      height,
      weight,
      gender,
    } = body;

    const record = await prisma.medicalRecord.create({
      data: {
        trainerId,
        pokemonId: parseInt(pokemonId),
        pokeCenterId,
        status: status || 'IN_TREATMENT',
        healthPercent: parseInt(healthPercent) || 100,
        condition,
        diagnosis,
        treatment: treatment || null,
        notes: notes || null,
        height: parseFloat(height),
        weight: parseFloat(weight),
        gender: gender || 'UNKNOWN',
      },
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

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}
