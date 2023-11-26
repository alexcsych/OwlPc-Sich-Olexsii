require('dotenv').config();
const _ = require('lodash');
const { Telegraf, session } = require('telegraf');
const {
  mainMenuKeyboard,
  productsMenuKeyboard,
  accountMenuKeyboard,
  itemsPerPage,
  productsPerPage,
} = require('./menu');
const {
  catchError,
  initializeSession,
  handleLoginEmailStep,
  handleLoginPasswordStep,
  handleSignupUsernameStep,
  handleSignupPasswordStep,
  handleSignupEmailStep,
  menuPrevNext,
  deleteChatMessage,
  editMessage,
  menuPrevNextCart,
  updateCartQuantity,
  handleNameChange,
  handlePasswordChange,
  handleEmailChange,
} = require('./functions');
const { API } = require('./api');

const { BOT_TOKEN } = process.env;
const bot = new Telegraf(BOT_TOKEN);

const showMenuKeyboard = async (ctx, keyboard) => {
  if (ctx.session.isLogin) {
    ctx.session.step = '';
    deleteChatMessage(ctx, ctx.session.messageId);
    ctx.editMessageText('Main menu', keyboard);
  } else {
    ctx.reply('Need authorization');
  }
};

bot.use(session());

bot.start(ctx => {
  ctx.session = {};
  ctx.session.isLogin = false;
  ctx.reply('Welcome! Choose an action:', {
    reply_markup: {
      keyboard: [[{ text: 'Log In' }, { text: 'Sign Up' }]],
      resize_keyboard: true,
    },
  });
});

bot.hears('Log In', ctx => {
  initializeSession(ctx);
  ctx.reply('Enter your email (e.g., example@example.com):');
  ctx.session.step = 'login_email';
});

bot.hears('Sign Up', ctx => {
  initializeSession(ctx);
  ctx.reply('Enter your name (min 2 characters long):');
  ctx.session.step = 'signup_username';
});

bot.hears('Log Out', ctx => {
  if (ctx.session.isLogin) {
    updateCartQuantity(ctx);
    deleteChatMessage(ctx, ctx.session.menuId);
    deleteChatMessage(ctx, ctx.session.messageId);
    initializeSession(ctx);
    ctx.reply('You are logged out. Choose an action:', {
      reply_markup: {
        keyboard: [[{ text: 'Log In' }, { text: 'Sign Up' }]],
        resize_keyboard: true,
      },
    });
  }
});

bot.hears('Menu', async ctx => {
  if (ctx.session.isLogin) {
    ctx.session.step = '';
    deleteChatMessage(ctx, ctx.session.menuId);
    deleteChatMessage(ctx, ctx.session.messageId);
    const sentMessage = await ctx.reply('Main menu', mainMenuKeyboard);
    ctx.session.menuId = sentMessage.message_id;
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('getProducts', ctx => {
  showMenuKeyboard(ctx, productsMenuKeyboard);
});

bot.action('getMenu', ctx => {
  showMenuKeyboard(ctx, mainMenuKeyboard);
});

bot.action('getCart', async ctx => {
  if (ctx.session.isLogin) {
    updateCartQuantity(ctx);
    try {
      const type = 'cart';
      const currentPage = ctx.session.typePageList[type] || 1;
      const offset = (currentPage - 1) * productsPerPage;
      const { data } = await API.getCartProducts(
        ctx.session.user._id,
        productsPerPage,
        offset
      );

      ctx.session.totalSum = data.data.totalSum;
      let keys = Object.keys(data.data.products);
      const deepCopyData = _.cloneDeep(data.data.products);
      const deepCopyData1 = _.cloneDeep(data.data.products);
      ctx.session.cart = deepCopyData;
      ctx.session.updatedCart = deepCopyData1;
      if (productsPerPage + 1 === keys.length) {
        delete data.data.products[keys[keys.length - 1]];
      }

      menuPrevNextCart(ctx, data.data.products, type, currentPage);
    } catch (error) {
      catchError(ctx, error);
    }
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('getAccount', ctx => {
  showMenuKeyboard(ctx, accountMenuKeyboard);
});

bot.action('changeName', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.isChangeAllInfo = false;
    ctx.session.step = 'change_name';
    editMessage(ctx, 'Enter new name (min 2 characters long)');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changePassword', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.isChangeAllInfo = false;
    ctx.session.step = 'change_password';
    editMessage(
      ctx,
      'Enter new password\n(Password must be at least 6 characters long and include a number, a lowercase letter, an uppercase letter, and a symbol)'
    );
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changeEmail', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.isChangeAllInfo = false;
    ctx.session.step = 'change_email';
    editMessage(ctx, 'Enter new email (e.g., example@example.com)');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changeAllInfo', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.isChangeAllInfo = true;
    ctx.session.step = 'change_name';
    editMessage(ctx, 'Enter new name (min 2 characters long)');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('getFullInfo', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.step = '';
    const { name, email, role } = ctx.session.user;
    const fullInfoText = `name: ${name}\nemail: ${email}\nrole: ${role}`;
    const text = `Full Info:\n\n${fullInfoText}`;
    editMessage(ctx, text);
  } else {
    ctx.reply('Need authorization');
  }
});

bot.on('callback_query', async ctx => {
  if (ctx.session.isLogin) {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('getProducts_')) {
      const type = data.replace('getProducts_', '');
      const currentPage = ctx.session.typePageList[type] || 1;
      try {
        if (!ctx.session.items || ctx.session.itemsType !== type) {
          const offset = (currentPage - 1) * itemsPerPage;
          const { data } = await API.getProducts(type, itemsPerPage, offset);
          ctx.session.items = [...data.data];
          if (itemsPerPage + 1 === ctx.session.items.length) {
            data.data.pop();
          }
          ctx.session.itemsType = type;
          menuPrevNext(ctx, data.data, type, currentPage);
        } else {
          const data =
            itemsPerPage + 1 === ctx.session.items.length
              ? ctx.session.items.slice(0, ctx.session.items.length - 1)
              : ctx.session.items;
          menuPrevNext(ctx, data, type, currentPage);
        }
      } catch (error) {
        catchError(ctx, error);
      }
    } else if (data.startsWith('getProduct_')) {
      const productId = data.replace('getProduct_', '');
      const productDetails = ctx.session.items.find(i => i._id === productId);
      const { _id, ...rest } = productDetails;
      const productDetailsText = Object.entries(rest)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const text = `Product Information:\n\n${productDetailsText}`;
      const addToCartKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Add to Cart', callback_data: `addToCart_${productId}` }],
          ],
        },
      };
      editMessage(ctx, text, addToCartKeyboard);
    } else if (data.startsWith('getCartProduct_')) {
      const productId = data.replace('getCartProduct_', '');
      const productDetails = ctx.session.cart[productId];
      const { _id, ...rest } = productDetails;
      const productDetailsText = Object.entries(rest)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const text = `Product Information:\n\n${productDetailsText}`;
      const addToCartKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Remove from Cart',
                callback_data: `removeFromCart_${productId}`,
              },
            ],
          ],
        },
      };
      editMessage(ctx, text, addToCartKeyboard);
    } else if (data.startsWith('addToCart_')) {
      const productId = data.replace('addToCart_', '');
      try {
        await API.addProduct({
          user: ctx.session.user._id,
          product: productId,
        });
        editMessage(ctx, 'The product has been added');
      } catch (error) {
        catchError(ctx, error);
      }
    } else if (data.startsWith('removeFromCart_')) {
      const productId = data.replace('removeFromCart_', '');
      try {
        await API.removeProduct(ctx.session.user._id, productId);
        editMessage(ctx, 'The product has been removed');

        const type = 'cart';
        const currentPage = ctx.session.typePageList[type] || 1;
        const offset = (currentPage - 1) * productsPerPage;
        const { data } = await API.getCartProducts(
          ctx.session.user._id,
          productsPerPage,
          offset
        );

        ctx.session.totalSum = data.data.totalSum;
        let keys = Object.keys(data.data.products);
        const deepCopyData = _.cloneDeep(data.data.products);
        const deepCopyData1 = _.cloneDeep(data.data.products);
        ctx.session.cart = deepCopyData;
        ctx.session.updatedCart = deepCopyData1;
        if (productsPerPage + 1 === keys.length) {
          delete data.data.products[keys[keys.length - 1]];
        }
        menuPrevNextCart(ctx, data.data.products, type, currentPage);
      } catch (error) {
        catchError(ctx, error);
      }
    } else if (data.startsWith('prevPageBTN_')) {
      updateCartQuantity(ctx);
      const type = data.replace('prevPageBTN_', '');
      if (ctx.session.typePageList[type] > 1) {
        const perPage = itemsPerPage;
        const currentPage = --ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * perPage;
          const { data } = await API.getProducts(type, perPage, offset);

          ctx.session.items = [...data.data];
          if (perPage + 1 === data.data.length) {
            data.data.pop();
          }
          menuPrevNext(ctx, data.data, type, currentPage);
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('prevCartPageBTN_')) {
      updateCartQuantity(ctx);
      const type = data.replace('prevCartPageBTN_', '');
      if (ctx.session.typePageList[type] > 1) {
        const perPage = productsPerPage;
        const currentPage = --ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * perPage;
          const { data } = await API.getCartProducts(
            ctx.session.user._id,
            perPage,
            offset
          );

          ctx.session.totalSum = data.data.totalSum;
          let keys = Object.keys(data.data.products);
          const deepCopyData = _.cloneDeep(data.data.products);
          const deepCopyData1 = _.cloneDeep(data.data.products);
          ctx.session.cart = deepCopyData;
          ctx.session.updatedCart = deepCopyData1;
          if (perPage + 1 === keys.length) {
            delete data.data.products[keys[keys.length - 1]];
          }
          menuPrevNextCart(ctx, data.data.products, type, currentPage);
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('nextPageBTN_')) {
      updateCartQuantity(ctx);
      const type = data.replace('nextPageBTN_', '');
      let products = ctx.session.items;
      const perPage = itemsPerPage;
      if (perPage + 1 === products.length) {
        const currentPage = ++ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * perPage;
          const { data } = await API.getProducts(type, perPage, offset);

          ctx.session.items = [...data.data];
          if (perPage + 1 === data.data.length) {
            data.data.pop();
          }
          menuPrevNext(ctx, data.data, type, currentPage);
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('nextCartPageBTN_')) {
      updateCartQuantity(ctx);
      const type = data.replace('nextCartPageBTN_', '');
      let products = Object.values(ctx.session.cart);
      const perPage = productsPerPage;
      if (perPage + 1 === products.length) {
        const currentPage = ++ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * perPage;
          const { data } = await API.getCartProducts(
            ctx.session.user._id,
            perPage,
            offset
          );

          ctx.session.totalSum = data.data.totalSum;
          let keys = Object.keys(data.data.products);
          const deepCopyData = _.cloneDeep(data.data.products);
          const deepCopyData1 = _.cloneDeep(data.data.products);
          ctx.session.cart = deepCopyData;
          ctx.session.updatedCart = deepCopyData1;
          if (perPage + 1 === keys.length) {
            delete data.data.products[keys[keys.length - 1]];
          }
          menuPrevNextCart(ctx, data.data.products, type, currentPage);
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('incQuantity_')) {
      const type = 'cart';
      const currentPage = ctx.session.typePageList[type] || 1;
      const productId = data.replace('incQuantity_', '');
      ctx.session.updatedCart[productId].quantity++;
      ctx.session.totalSum += ctx.session.updatedCart[productId].price;
      let keys = Object.keys(ctx.session.updatedCart);
      const newData = _.cloneDeep(ctx.session.updatedCart);
      if (productsPerPage + 1 === keys.length) {
        delete newData[keys[keys.length - 1]];
      }
      menuPrevNextCart(ctx, newData, type, currentPage);
    } else if (data.startsWith('decQuantity_')) {
      const productId = data.replace('decQuantity_', '');
      if (ctx.session.updatedCart[productId].quantity > 1) {
        const type = 'cart';
        const currentPage = ctx.session.typePageList[type] || 1;
        ctx.session.updatedCart[productId].quantity--;
        ctx.session.totalSum -= ctx.session.updatedCart[productId].price;
        let keys = Object.keys(ctx.session.updatedCart);
        const newData = { ...ctx.session.updatedCart };
        if (productsPerPage + 1 === keys.length) {
          delete newData[keys[keys.length - 1]];
        }
        menuPrevNextCart(ctx, newData, type, currentPage);
      }
    }
  } else {
    ctx.reply('Need authorization');
  }
});

bot.on('text', async ctx => {
  const messageText = ctx.message.text;
  const { session } = ctx;
  const step = session.step || '';
  switch (step) {
    case 'login_email':
      await handleLoginEmailStep(ctx, messageText);
      break;
    case 'login_password':
      await handleLoginPasswordStep(ctx, messageText);
      break;
    case 'signup_username':
      await handleSignupUsernameStep(ctx, messageText);
      break;
    case 'signup_email':
      await handleSignupEmailStep(ctx, messageText);
      break;
    case 'signup_password':
      await handleSignupPasswordStep(ctx, messageText);
      break;
    case 'change_name':
      await handleNameChange(ctx, messageText);
      break;
    case 'change_email':
      await handleEmailChange(ctx, messageText);
      break;
    case 'change_password':
      await handlePasswordChange(ctx, messageText);
      break;
    default:
      ctx.reply('Please select an action.');
  }
});

bot.launch();
