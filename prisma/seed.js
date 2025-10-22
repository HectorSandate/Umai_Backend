// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de base de datos...');

  // Crear usuario cliente
  const customer = await prisma.user.create({
    data: {
      email: 'cliente@plateo.com',
      password: await hashPassword('Password123'),
      name: 'Juan Cliente',
      phone: '6181234567',
      role: 'CUSTOMER',
      isVerified: true,
      location: {
        lat: 24.0277,
        lng: -104.6532
      }
    }
  });

  console.log('Usuario cliente creado:', customer.email);

  // Crear usuario restaurante
  const restaurantUser = await prisma.user.create({
    data: {
      email: 'tacos@plateo.com',
      password: await hashPassword('Password123'),
      name: 'Tacos El Güero',
      phone: '6189876543',
      role: 'RESTAURANT',
      isVerified: true
    }
  });

  console.log('Usuario restaurante creado:', restaurantUser.email);

  // Crear restaurante
  const restaurant = await prisma.restaurant.create({
    data: {
      userId: restaurantUser.id,
      name: 'Tacos El Güero',
      description: 'Los mejores tacos de Durango',
      address: 'Av. 20 de Noviembre 123, Centro',
      phone: '6189876543',
      location: {
        lat: 24.0280,
        lng: -104.6540,
        address: 'Av. 20 de Noviembre 123, Centro'
      },
      categories: ['tacos', 'quesadillas', 'burritos'],
      subscriptionTier: 'BASIC',
      maxVideosPerMonth: 50,
      logoUrl: 'https://via.placeholder.com/200',
      rating: 4.5,
      isActive: true
    }
  });

  console.log('Restaurante creado:', restaurant.name);

  // Crear platillos
  const dishes = await Promise.all([
    prisma.dish.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Tacos de Asada',
        description: 'Tacos de carne asada con cebolla y cilantro',
        price: 15.00,
        category: 'TACOS',
        uberEatsLink: 'https://ubereats.com/example',
        didiLink: 'https://didifood.com/example',
        rappiLink: 'https://rappi.com/example',
        isAvailable: true
      }
    }),
    prisma.dish.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Tacos de Pastor',
        description: 'Tacos al pastor con piña',
        price: 15.00,
        category: 'TACOS',
        uberEatsLink: 'https://ubereats.com/example',
        isAvailable: true
      }
    }),
    prisma.dish.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Quesadillas',
        description: 'Quesadillas de queso con tortilla de maíz',
        price: 35.00,
        category: 'TACOS',
        isAvailable: true
      }
    })
  ]);

  console.log(`${dishes.length} platillos creados`);

  // Crear videos de ejemplo
  const videos = await Promise.all([
    prisma.video.create({
      data: {
        restaurantId: restaurant.id,
        dishId: dishes[0].id,
        cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
        cloudinaryPublicId: 'sample_video_1',
        title: 'Tacos de Asada Recién Hechos',
        description: 'Mira cómo preparamos nuestros deliciosos tacos',
        category: 'TACOS',
        priceRange: 'ECONOMICO',
        tags: ['tacos', 'asada', 'tradicional'],
        deliveryLinks: {
          uber: 'https://ubereats.com/example',
          didi: 'https://didifood.com/example',
          rappi: 'https://rappi.com/example'
        },
        isActive: true,
        isPublic: true
      }
    }),
    prisma.video.create({
      data: {
        restaurantId: restaurant.id,
        dishId: dishes[1].id,
        cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/sample2.mp4',
        cloudinaryPublicId: 'sample_video_2',
        title: 'Tacos al Pastor con Piña',
        description: 'El trompo girando y la piña caramelizada',
        category: 'TACOS',
        priceRange: 'ECONOMICO',
        tags: ['tacos', 'pastor', 'piña'],
        isActive: true,
        isPublic: true
      }
    })
  ]);

  console.log(`${videos.length} videos creados`);

  console.log('Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });