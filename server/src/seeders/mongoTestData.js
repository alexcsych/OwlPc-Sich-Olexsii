const { User, Product } = require('../models');
const userData = require('./User.json');
const productData = require('./Product.json');

async function createTestData () {
  try {
    await User.create(userData);
    await Product.create(productData);

    // const orders = await Order.create([
    //   {
    //     user: users[0]._id,
    //     products: [
    //       { product: products[0]._id, quantity: 2 },
    //       { product: products[1]._id, quantity: 1 },
    //     ],
    //   },
    //   {
    //     user: users[1]._id,
    //     products: [
    //       { product: products[1]._id, quantity: 2 },
    //       { product: products[2]._id, quantity: 1 },
    //     ],
    //   },
    // ]);
    // await Promise.all(
    //   orders.map(async order => {
    //     await order.calculateTotalPrice();
    //     await order.save();
    //   })
    // );

    // const updateQuery = { _id: orders[0]._id };
    // const updateData = { $set: { 'products.$[].quantity': 5 } };

    // const updatedOrder = await Order.findOneAndUpdate(updateQuery, updateData, {
    //   new: true,
    // });

    // await updatedOrder.calculateTotalPrice();
    // await updatedOrder.save();
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData();

// const createOrder = async orderData => {
//   try {
//     const order = await Order.create(orderData);
//     await order.calculateTotalPrice();
//     return order;
//   } catch (error) {
//     throw error;
//   }
// };

// const updateOrder = async (orderId, updateData) => {
//   try {
//     const order = await Order.findById(orderId);
//     if (!order) {
//       throw new Error('Заказ не найден');
//     }

//     Object.assign(order, updateData);
//     await order.calculateTotalPrice();
//     return order;
//   } catch (error) {
//     throw error;
//   }
// };

// const newOrderData = {
//   user: '650efbbc4982bec5a4853ee4',
//   products: [
//     { product: '650efbbc4982bec5a4853eea', quantity: 2 },
//     { product: '650efbbc4982bec5a4853eeb', quantity: 1 },
//   ],
// };

// createOrder(newOrderData);

// const orderIdToUpdate = '650efbbc4982bec5a4853ef3';
// const updateData = {
//   products: [{ product: '650efbbc4982bec5a4853eec', quantity: 2 }],
// };

// updateOrder(orderIdToUpdate, updateData);
