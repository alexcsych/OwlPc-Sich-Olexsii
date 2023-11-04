const mainMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Products', callback_data: 'getProducts' },
        { text: 'Cart', callback_data: 'getCart' },
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
      [{ text: 'Get Full Info', callback_data: 'getFullInfo' }],
      [
        { text: 'Change Name', callback_data: 'changeName' },
        { text: 'Change Password', callback_data: 'changePassword' },
      ],
      [
        { text: 'Change Email', callback_data: 'changeEmail' },
        { text: 'Change All Info', callback_data: 'changeAllInfo' },
      ],
      [{ text: '<<', callback_data: 'getMenu' }],
    ],
  },
};

const itemsPerPage = 9;
const productsPerPage = 5;
// const typeList = ['Video Card', 'CPU', 'Case', 'Motherboard', 'RAM'];

module.exports = {
  mainMenuKeyboard,
  productsMenuKeyboard,
  ordersMenuKeyboard,
  accountMenuKeyboard,
  itemsPerPage,
  productsPerPage,
};
