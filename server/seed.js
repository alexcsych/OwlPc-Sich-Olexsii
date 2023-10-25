const { Product } = require('./src/models');

function generateRandomVideoCard () {
  const possibleMemoryTypes = ['GDDR5', 'GDDR6'];
  const randomMemoryType =
    possibleMemoryTypes[Math.floor(Math.random() * possibleMemoryTypes.length)];

  return {
    name: 'Video Card ' + Math.floor(Math.random() * 1000),
    type: 'Video Card',
    price: Math.floor(Math.random() * 30000),
    memory: Math.floor(Math.random() * 16) + ' GB',
    memoryType: randomMemoryType,
    fansAmount: Math.floor(Math.random() * 3) + 1,
  };
}

function generateRandomCPU () {
  const possibleSocket = [
    'Socket 1151',
    'Socket 1200',
    'Socket 1700',
    'Socket AM4',
  ];
  const randomSocket =
    possibleSocket[Math.floor(Math.random() * possibleSocket.length)];

  return {
    name: 'CPU ' + Math.floor(Math.random() * 1000),
    type: 'CPU',
    price: Math.floor(Math.random() * 30000),
    cores: Math.floor(Math.random() * 16),
    socket: randomSocket,
  };
}

function generateRandomMotherboard () {
  const possibleSocket = [
    'Socket 1151',
    'Socket 1200',
    'Socket 1700',
    'Socket AM4',
  ];
  const randomSocket =
    possibleSocket[Math.floor(Math.random() * possibleSocket.length)];

  const possibleFormFactor = ['ATX', 'MicroATX', 'MiniITX'];
  const randomFormFactor =
    possibleFormFactor[Math.floor(Math.random() * possibleFormFactor.length)];

  const possibleMemoryType = ['DDR3', 'DDR4', 'DDR5', 'DDR4 (SO-DIMM)'];
  const randomMemoryType =
    possibleMemoryType[Math.floor(Math.random() * possibleMemoryType.length)];

  return {
    name: 'Motherboard ' + Math.floor(Math.random() * 1000),
    type: 'Motherboard',
    price: Math.floor(Math.random() * 10000),
    RAMslotsAmount: Math.floor(Math.random() * 4),
    socket: randomSocket,
    formFactor: randomFormFactor,
    memoryType: randomMemoryType,
  };
}

function generateRandomCase () {
  const possibleFormFactors = ['ATX', 'MicroATX', 'MiniITX'];
  const randomFormFactor =
    possibleFormFactors[Math.floor(Math.random() * possibleFormFactors.length)];

  return {
    name: 'Case ' + Math.floor(Math.random() * 1000),
    type: 'Case',
    price: Math.floor(Math.random() * 10000),
    formFactor: randomFormFactor,
    fansAmount: Math.floor(Math.random() * 4) + 1,
  };
}

function generateRandomRAM () {
  const possibleMemoryTypes = ['DDR3', 'DDR4', 'DDR5', 'DDR4 (SO-DIMM)'];
  const randomMemoryType =
    possibleMemoryTypes[Math.floor(Math.random() * possibleMemoryTypes.length)];

  return {
    name: 'RAM ' + Math.floor(Math.random() * 3000),
    type: 'RAM',
    price: Math.floor(Math.random() * 1000),
    memory: Math.floor(Math.random() * 64) + ' GB',
    memoryType: randomMemoryType,
  };
}

async function seedDatabase () {
  try {
    const videoCards = [];
    for (let i = 0; i < 10; i++) {
      videoCards.push(generateRandomVideoCard());
      videoCards.push(generateRandomCPU());
      videoCards.push(generateRandomMotherboard());
      videoCards.push(generateRandomRAM());
      videoCards.push(generateRandomCase());
    }

    await Product.create(videoCards);
  } catch (error) {
    console.error('Ошибка при добавлении тестовых данных:', error);
  }
}

seedDatabase();
