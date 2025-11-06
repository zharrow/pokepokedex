import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping des types EN -> FR
const typeTranslations: Record<string, { nameFr: string; color: string }> = {
  normal: { nameFr: 'Normal', color: '#A8A878' },
  fire: { nameFr: 'Feu', color: '#F08030' },
  water: { nameFr: 'Eau', color: '#6890F0' },
  electric: { nameFr: 'Électrik', color: '#F8D030' },
  grass: { nameFr: 'Plante', color: '#78C850' },
  ice: { nameFr: 'Glace', color: '#98D8D8' },
  fighting: { nameFr: 'Combat', color: '#C03028' },
  poison: { nameFr: 'Poison', color: '#A040A0' },
  ground: { nameFr: 'Sol', color: '#E0C068' },
  flying: { nameFr: 'Vol', color: '#A890F0' },
  psychic: { nameFr: 'Psy', color: '#F85888' },
  bug: { nameFr: 'Insecte', color: '#A8B820' },
  rock: { nameFr: 'Roche', color: '#B8A038' },
  ghost: { nameFr: 'Spectre', color: '#705898' },
  dragon: { nameFr: 'Dragon', color: '#7038F8' },
  dark: { nameFr: 'Ténèbres', color: '#705848' },
  steel: { nameFr: 'Acier', color: '#B8B8D0' },
  fairy: { nameFr: 'Fée', color: '#EE99AC' },
};

// Fonction pour récupérer un Pokémon depuis PokeAPI
async function fetchPokemonFromAPI(id: number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();

  // Récupérer l'espèce pour avoir les noms français
  const speciesResponse = await fetch(data.species.url);
  const speciesData = await speciesResponse.json();

  const frenchName = speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name;
  const frenchDescription = speciesData.flavor_text_entries
    .find((entry: any) => entry.language.name === 'fr')?.flavor_text
    .replace(/\n/g, ' ') || 'Description non disponible';

  return {
    data,
    speciesData,
    frenchName,
    frenchDescription,
  };
}

async function main() {
  console.log('Début du seed avec PokeAPI...');

  // Nettoyer les données existantes
  console.log('🧹 Nettoyage de la base de données...');
  // Supprimer dans l'ordre des dépendances
  await prisma.medicalRecord.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.collectionEntry.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.ability.deleteMany();
  await prisma.pokemonType.deleteMany();
  await prisma.pokemonMove.deleteMany();
  await prisma.move.deleteMany();
  await prisma.pokemon.deleteMany();
  console.log('✅ Base de données nettoyée\n');

  console.log('Récupération des 151 Pokémon de Kanto...\n');

  // PHASE 1: Créer tous les Pokémon sans les évolutions
  let createdCount = 0;
  for (let i = 1; i <= 151; i++) {
    try {
      console.log(`Récupération du Pokémon #${i}...`);
      const { data, speciesData, frenchName, frenchDescription } = await fetchPokemonFromAPI(i);

      // Extraire les stats
      const stats = data.stats.reduce((acc: any, stat: any) => {
        const statName = stat.stat.name;
        acc[statName.replace('-', '_')] = stat.base_stat;
        return acc;
      }, {});

      // Extraire les types
      const pokemonTypes = data.types.map((t: any) => {
        const typeName = t.type.name;
        const translation = typeTranslations[typeName] || { nameFr: typeName, color: '#777' };
        return {
          name: typeName,
          nameFr: translation.nameFr,
          color: translation.color,
        };
      });

      // Extraire les capacités/talents
      const abilities = data.abilities.map((a: any) => {
        const abilityNameFr = a.ability.name; // On pourrait aussi fetch pour avoir la traduction
        return {
          name: a.ability.name,
          nameFr: abilityNameFr,
          description: 'Capacité du Pokémon',
          isHidden: a.is_hidden,
        };
      });

      // Déterminer les egg groups
      const eggGroups = speciesData.egg_groups.map((g: any) => g.name).join('/');

      // Vérifier si le Pokémon existe déjà
      const existingPokemon = await prisma.pokemon.findUnique({
        where: { pokedexNumber: i }
      });

      if (existingPokemon) {
        console.log(`⏭️  ${frenchName} existe déjà, ignoré`);
        continue;
      }

      // Créer le Pokémon
      await prisma.pokemon.create({
        data: {
          pokedexNumber: i,
          name: data.name,
          nameFr: frenchName,
          height: data.height / 10, // PokeAPI donne en décimètres
          weight: data.weight / 10, // PokeAPI donne en hectogrammes
          description: frenchDescription,
          spriteUrl: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`,
          spriteShinyUrl: data.sprites.front_shiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${i}.png`,
          spriteFemaleUrl: data.sprites.front_female || null,
          spriteShinyFemaleUrl: data.sprites.front_shiny_female || null,
          hasGenderDifference: speciesData.has_gender_differences || false,
          genderDifferenceDesc: speciesData.has_gender_differences ? 'Différences d\'apparence entre mâle et femelle' : null,
          eggType: eggGroups,
          eggCycles: speciesData.hatch_counter || 20,
          hp: stats.hp || 0,
          attack: stats.attack || 0,
          defense: stats.defense || 0,
          specialAttack: stats.special_attack || 0,
          specialDefense: stats.special_defense || 0,
          speed: stats.speed || 0,
          types: {
            create: pokemonTypes,
          },
          abilities: {
            create: abilities,
          },
        },
      });

      createdCount++;
      console.log(`✓ ${frenchName} créé avec succès`);

      // Petit délai pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Erreur pour le Pokémon #${i}:`, error);
    }
  }

  console.log(`\n✓ Phase 1 terminée: ${createdCount} Pokémon créés\n`);

  // PHASE 2: Ajouter les évolutions
  console.log('📊 Phase 2: Ajout des évolutions...\n');
  let evolutionsCount = 0;

  for (let i = 1; i <= 151; i++) {
    try {
      const { speciesData } = await fetchPokemonFromAPI(i);

      // Récupérer la chaîne d'évolution
      if (speciesData.evolution_chain?.url) {
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // Trouver l'évolution de ce Pokémon
        const findEvolution = (chain: any, currentId: number): any => {
          const speciesId = parseInt(chain.species.url.split('/').filter((s: string) => s).pop());

          if (speciesId === currentId && chain.evolves_to.length > 0) {
            const nextEvolution = chain.evolves_to[0];
            const nextId = parseInt(nextEvolution.species.url.split('/').filter((s: string) => s).pop());

            // Récupérer la condition d'évolution
            let condition = 'Évolution';
            if (nextEvolution.evolution_details?.[0]) {
              const detail = nextEvolution.evolution_details[0];
              if (detail.min_level) {
                condition = `Niveau ${detail.min_level}`;
              } else if (detail.item) {
                condition = `Utiliser ${detail.item.name}`;
              } else if (detail.trigger) {
                condition = detail.trigger.name;
              }
            }

            return { nextId, condition };
          }

          // Recherche récursive
          for (const evo of chain.evolves_to) {
            const result = findEvolution(evo, currentId);
            if (result) return result;
          }

          return null;
        };

        const evolution = findEvolution(evolutionData.chain, i);

        if (evolution && evolution.nextId <= 151) {
          const pokemon = await prisma.pokemon.findUnique({
            where: { pokedexNumber: i }
          });

          const evolvesTo = await prisma.pokemon.findUnique({
            where: { pokedexNumber: evolution.nextId }
          });

          if (pokemon && evolvesTo) {
            await prisma.pokemon.update({
              where: { id: evolvesTo.id },
              data: {
                evolvesFromId: pokemon.id,
                evolutionCondition: evolution.condition
              }
            });
            evolutionsCount++;
            console.log(`✓ ${pokemon.nameFr} → ${evolvesTo.nameFr} (${evolution.condition})`);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Erreur lors de l'ajout des évolutions pour #${i}:`, error);
    }
  }

  console.log(`\n✓ Phase 2 terminée: ${evolutionsCount} évolutions ajoutées\n`);

  // PHASE 3: Ajouter les capacités (moves)
  console.log('⚔️ Phase 3: Ajout des capacités...\n');
  let movesCount = 0;
  const processedMoves = new Set<string>();

  for (let i = 1; i <= 151; i++) {
    try {
      const { data, frenchName } = await fetchPokemonFromAPI(i);

      const pokemon = await prisma.pokemon.findUnique({
        where: { pokedexNumber: i }
      });

      if (!pokemon) continue;

      // Limiter à 10 moves par Pokémon pour ne pas surcharger
      const moves = data.moves.slice(0, 10);

      for (const moveData of moves) {
        const moveName = moveData.move.name;

        // Récupérer les détails du move
        let move = await prisma.move.findUnique({
          where: { name: moveName }
        });

        // Si le move n'existe pas, le créer
        if (!move && !processedMoves.has(moveName)) {
          try {
            const moveResponse = await fetch(moveData.move.url);
            const moveDetails = await moveResponse.json();

            const moveNameFr = moveDetails.names?.find((n: any) => n.language.name === 'fr')?.name || moveName;
            const moveDescription = moveDetails.flavor_text_entries
              ?.find((entry: any) => entry.language.name === 'fr')?.flavor_text
              ?.replace(/\n/g, ' ') || 'Capacité Pokémon';

            let category = 'STATUS';
            if (moveDetails.damage_class?.name === 'physical') category = 'PHYSICAL';
            if (moveDetails.damage_class?.name === 'special') category = 'SPECIAL';

            move = await prisma.move.create({
              data: {
                name: moveName,
                nameFr: moveNameFr,
                type: moveDetails.type?.name || 'normal',
                category: category as any,
                power: moveDetails.power || null,
                accuracy: moveDetails.accuracy || null,
                pp: moveDetails.pp || 10,
                description: moveDescription
              }
            });

            processedMoves.add(moveName);
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (moveError) {
            console.error(`Erreur lors de la création du move ${moveName}:`, moveError);
            continue;
          }
        }

        if (move) {
          // Déterminer la méthode d'apprentissage
          const versionDetail = moveData.version_group_details[0];
          let learnMethod = 'LEVEL_UP';
          let levelLearned = null;

          if (versionDetail) {
            const methodName = versionDetail.move_learn_method?.name;
            if (methodName === 'machine') learnMethod = 'TM';
            else if (methodName === 'egg') learnMethod = 'EGG';
            else if (methodName === 'tutor') learnMethod = 'TUTOR';

            if (methodName === 'level-up') {
              levelLearned = versionDetail.level_learned_at || 1;
            }
          }

          // Créer la relation Pokemon-Move
          try {
            await prisma.pokemonMove.create({
              data: {
                pokemonId: pokemon.id,
                moveId: move.id,
                learnMethod: learnMethod as any,
                levelLearned: levelLearned
              }
            });
            movesCount++;
          } catch (e) {
            // Ignorer les doublons
          }
        }
      }

      console.log(`✓ Capacités ajoutées pour ${frenchName}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Erreur lors de l'ajout des capacités pour #${i}:`, error);
    }
  }

  console.log(`\n✓ Phase 3 terminée: ${movesCount} capacités ajoutées\n`);

  // Utilisateurs de test
  console.log('\n📝 Création des utilisateurs de test...');
  const bcrypt = require('bcryptjs');

  const users = [
    {
      email: 'sacha@pokemon.com',
      password: await bcrypt.hash('pikachu', 10),
      name: 'Sacha',
      role: 'TRAINER',
      badges: 4,
    },
    {
      email: 'joelle@pokemon.com',
      password: await bcrypt.hash('soin', 10),
      name: 'Joëlle',
      role: 'HEALER',
      badges: 0,
    },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!existingUser) {
      await prisma.user.create({ data: user });
      console.log(`✓ Utilisateur ${user.name} créé`);
    }
  }

  // Centres Pokémon
  console.log('\n🏥 Création des centres Pokémon...');
  const pokemonCenters = [
    { name: 'Centre Pokémon d\'Argenta', location: 'Centre-ville', city: 'Argenta' },
    { name: 'Centre Pokémon d\'Azuria', location: 'Centre-ville', city: 'Azuria' },
    { name: 'Centre Pokémon de Carmin sur Mer', location: 'Port', city: 'Carmin sur Mer' },
    { name: 'Centre Pokémon de Safrania', location: 'Centre-ville', city: 'Safrania' },
    { name: 'Centre Pokémon de Cramois\'Île', location: 'Volcan', city: 'Cramois\'Île' },
  ];

  for (const center of pokemonCenters) {
    const existingCenter = await prisma.pokeCenter.findFirst({
      where: { name: center.name },
    });
    if (!existingCenter) {
      await prisma.pokeCenter.create({ data: center });
      console.log(`✓ Centre ${center.name} créé`);
    }
  }

  console.log('\n✨ Seed terminé avec succès!');
  console.log(`✓ Pokémon créés: ${createdCount}/151`);
  console.log(`✓ Évolutions ajoutées: ${evolutionsCount}`);
  console.log(`✓ Capacités ajoutées: ${movesCount}`);
  console.log(`✓ Utilisateurs de test créés: ${users.length}`);
  console.log(`✓ Centres Pokémon créés: ${pokemonCenters.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
