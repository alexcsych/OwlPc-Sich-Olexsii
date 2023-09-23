const mongoose = require('mongoose');
const { User } = require('./src/models');

async function createTestData () {
  try {
    const testUsers = [
      {
        name: 'Test User 1',
        email: 'testuser1@example.com',
        password: 'password1',
        role: 'customer',
      },
      {
        name: 'Test User 2',
        email: 'testuser2@example.com',
        password: 'password2',
        role: 'creator',
      },
    ];

    await User.create(testUsers);

    console.log('Test data has been created.');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestData();
