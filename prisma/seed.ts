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
  console.log('Récupération des 151 Pokémon de Kanto...\n');

  // Boucle pour récupérer les 151 Pokémon de Kanto
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

  // Centres Pokémon
  const pokemonCenters = [
    { name: 'Centre Pokémon Bourg Palette', location: 'Route 1', city: 'Bourg Palette' },
    { name: 'Centre Pokémon Argenta', location: 'Centre-ville', city: 'Argenta' },
    { name: 'Centre Pokémon Azuria', location: 'Centre-ville', city: 'Azuria' },
    { name: 'Centre Pokémon Carmin sur Mer', location: 'Port', city: 'Carmin sur Mer' },
    { name: 'Centre Pokémon Safrania', location: 'Centre-ville', city: 'Safrania' },
    { name: 'Centre Pokémon Céladopole', location: 'Centre-ville', city: 'Céladopole' },
    { name: 'Centre Pokémon Cramois Île', location: 'Volcan', city: 'Cramois Île' },
    { name: 'Centre Pokémon Parmanie', location: 'Centre-ville', city: 'Parmanie' },
  ];

  for (const center of pokemonCenters) {
    await prisma.pokeCenter.create({ data: center });
  }

  console.log('\n✓ Seed terminé!');
  console.log(`✓ Pokémon créés: ${createdCount}/151`);
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
