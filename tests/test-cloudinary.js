// tests/test-cloudinary.js

const path = require('path');

// Cargar .env desde la raíz explícitamente
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Debug: ver qué variables se cargaron
console.log('=== DEBUG ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'NO definido');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definido' : 'NO definido');
console.log('=============\n');

const { cloudinary } = require('../src/config/cloudinary');

async function testCloudinary() {
  try {
    console.log('Probando conexión a Cloudinary...');
    
    const result = await cloudinary.api.ping();
    
    console.log('✅ Conexión exitosa a Cloudinary');
    console.log('Estado:', result.status);
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    
  } catch (error) {
    console.error('❌ Error al conectar con Cloudinary:');
    console.error(error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Verifica que tu API Key sea correcta');
    }
    if (error.message.includes('Invalid cloud name')) {
      console.log('\n💡 Verifica que tu Cloud Name sea correcto');
    }
  }
}

testCloudinary();