const mainMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Products', callback_data: 'getProducts' },
        { text: 'Orders', callback_data: 'getOrders' },
        { text: 'Account', callback_data: 'getAccount' },
      ],
    ],
  },
};

const productsMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'CPU', callback_data: 'getProducts_CPU' },
        { text: 'Video Card', callback_data: 'getProducts_Video Card' },
        { text: 'Case', callback_data: 'getProducts_Case' },
      ],
      [
        { text: 'Motherboard', callback_data: 'getProducts_Motherboard' },
        { text: 'RAM', callback_data: 'getProducts_RAM' },
      ],
      [{ text: '<<', callback_data: 'getMenu' }],
    ],
  },
};

const ordersMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'All Orders', callback_data: 'getMenu' },
        { text: 'Orders In Process', callback_data: 'getMenu' },
        { text: 'Finished Orders', callback_data: 'getMenu' },
      ],
      [{ text: '<<', callback_data: 'getMenu' }],
    ],
  },
};

const accountMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Change Name', callback_data: 'getMenu' },
        { text: 'Change Password', callback_data: 'getMenu' },
      ],
      [
        { text: 'Change Email', callback_data: 'getMenu' },
        { text: 'Change All Info', callback_data: 'getMenu' },
      ],
      [{ text: '<<', callback_data: 'getMenu' }],
    ],
  },
};

const itemsPerPage = 9;
// const typeList = ['Video Card', 'CPU', 'Case', 'Motherboard', 'RAM'];

module.exports = {
  mainMenuKeyboard,
  productsMenuKeyboard,
  ordersMenuKeyboard,
  accountMenuKeyboard,
  itemsPerPage,
};
