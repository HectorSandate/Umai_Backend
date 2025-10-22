// tests/test-upload-video.js

const path = require('path');
const fs = require('fs');

// Cargar .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const cloudinaryService = require('../src/services/cloudinary.service');

async function testUploadVideo() {
  try {
    console.log('=================================');
    console.log('TEST: SUBIR VIDEO A CLOUDINARY');
    console.log('=================================\n');
    
    // Ruta del video de prueba
    const videoPath = path.join(__dirname, '..', 'test-video.mp4');
    
    // Verificar que existe
    if (!fs.existsSync(videoPath)) {
      console.error('❌ No se encontró el archivo de video en:', videoPath);
      console.log('\n💡 Descarga un video de prueba y guárdalo como test-video.mp4 en la raíz del proyecto');
      return;
    }
    
    // Leer archivo
    const videoBuffer = fs.readFileSync(videoPath);
    const fileSizeMB = (videoBuffer.length / 1024 / 1024).toFixed(2);
    
    console.log('📹 Archivo encontrado');
    console.log(`   Tamaño: ${fileSizeMB} MB`);
    console.log('');
    
    // Subir a Cloudinary
    console.log('⏳ Subiendo video a Cloudinary...');
    console.log('   Esto puede tomar unos segundos...\n');
    
    const result = await cloudinaryService.uploadVideo(videoBuffer, {
      folder: 'plateo/test'
    });
    
    console.log('=================================');
    console.log('✅ VIDEO SUBIDO EXITOSAMENTE!');
    console.log('=================================\n');
    
    console.log('📊 Información del video:');
    console.log(`   URL: ${result.url}`);
    console.log(`   Public ID: ${result.publicId}`);
    console.log(`   Duración: ${result.duration} segundos`);
    console.log(`   Formato: ${result.format}`);
    console.log(`   Resolución: ${result.width}x${result.height}`);
    console.log(`   Tamaño: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
    
    console.log('🌐 Puedes ver el video en:');
    console.log(`   ${result.url}`);
    console.log('');
    
    console.log('✅ Cloudinary está funcionando correctamente!');
    
  } catch (error) {
    console.error('\n=================================');
    console.error('❌ ERROR AL SUBIR VIDEO');
    console.error('=================================\n');
    console.error('Mensaje:', error.message);
    console.error('\nStack:', error.stack);
  }
}

testUploadVideo();