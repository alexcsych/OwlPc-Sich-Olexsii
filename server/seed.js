const mongoose = require('mongoose');
const { Product } = require('./src/models'); // Подключите модель Product, если она находится в отдельном файле

// Генерация случайных тестовых данных для видеокарт
function generateRandomVideoCard () {
  const possibleMemoryTypes = ['GDDR5', 'GDDR6'];
  const randomMemoryType =
    possibleMemoryTypes[Math.floor(Math.random() * possibleMemoryTypes.length)];

  return {
    name: 'Video Card ' + Math.floor(Math.random() * 1000),
    type: 'Video card',
    price: Math.floor(Math.random() * 30000),
    memory: Math.floor(Math.random() * 16) + ' GB',
    memoryType: randomMemoryType, // Случайным образом выбираем GDDR5 или GDDR6
    fansAmount: Math.floor(Math.random() * 3) + 1,
  };
}

async function seedDatabase () {
  try {
    // Создать и сохранить 10 случайных видеокарт
    const videoCards = [];
    for (let i = 0; i < 10; i++) {
      videoCards.push(generateRandomVideoCard());
    }

    await Product.create(videoCards);
    console.log('10 случайных видеокарт успешно добавлены в базу данных.');
  } catch (error) {
    console.error('Ошибка при добавлении тестовых данных:', error);
  }
}

seedDatabase();
