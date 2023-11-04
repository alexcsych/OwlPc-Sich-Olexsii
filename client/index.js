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
  httpClient,
  initializeSession,
  handleLoginEmailStep,
  handleLoginPasswordStep,
  handleSignupUsernameStep,
  handleSignupPasswordStep,
  handleSignupEmailStep,
  handleSignupRoleStep,
  menuPrevNext,
  deleteChatMessage,
  editMessage,
  handleChangeStep,
  menuPrevNextCart,
  updateCartQuantity,
} = require('./functions');

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

const catchError = (ctx, error) => {
  ctx.session.step = 'initial';
  if (error.response && error.response.data && error.response.data.errors) {
    const { status, title, validationErrors } = error.response.data.errors;
    ctx.reply(
      `Error\n\nstatus:\n${status}\n\ntitle:\n${title}\n\n${
        validationErrors
          ? `validationErrors:\n${validationErrors.join('\n')}`
          : ''
      }`
    );
  } else if (error.errors) {
    ctx.reply(
      `Validation error. Please check the entered data.\n\nvalidationErrors:\n${error.errors.join(
        '\n'
      )}`
    );
  } else {
    ctx.reply(`${error}`);
  }
};

bot.use(session());

bot.start(ctx => {
  ctx.session = {};
  ctx.session.isLogin = false;
  console.log('ctx.session :>> ', ctx.session);
  console.log('ctx.session :>> ', ctx.session);
  ctx.reply('Welcome! Choose an action:', {
    reply_markup: {
      keyboard: [[{ text: 'Log In' }, { text: 'Sign Up' }]],
      resize_keyboard: true,
    },
  });
});

bot.hears('Log In', ctx => {
  initializeSession(ctx);
  ctx.reply('Enter your email:');
  ctx.session.step = 'login_email';
});

bot.hears('Sign Up', ctx => {
  initializeSession(ctx);
  ctx.reply('Enter your login:');
  ctx.session.step = 'signup_username';
});

bot.hears('Log Out', ctx => {
  if (ctx.session.isLogin) {
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
      const { data } = await httpClient.get(
        `/carts/${ctx.session.user._id}?limit=${productsPerPage}&&offset=${offset}`
      );
      console.log('data.data :>> ', data.data);

      let keys = Object.keys(data.data);
      const deepCopyData = _.cloneDeep(data.data);
      const deepCopyData1 = _.cloneDeep(data.data);
      ctx.session.cart = deepCopyData;
      ctx.session.updatedCart = deepCopyData1;
      console.log('keys.length :>> ', keys.length);
      if (productsPerPage + 1 === keys.length) {
        delete data.data[keys[keys.length - 1]];
      }

      menuPrevNextCart(ctx, data.data, type, currentPage);
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
    editMessage(ctx, 'Enter new name');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changePassword', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.isChangeAllInfo = false;
    ctx.session.step = 'change_password';
    editMessage(ctx, 'Enter new password');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changeEmail', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.isChangeAllInfo = false;
    ctx.session.step = 'change_email';
    editMessage(ctx, 'Enter new email');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changeAllInfo', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.isChangeAllInfo = true;
    ctx.session.step = 'change_name';
    editMessage(ctx, 'Enter new name');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('getFullInfo', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.step = '';
    console.log('ctx.session.user :>> ', ctx.session.user);
    const { name, email, role } = ctx.session.user;
    const fullInfoText = `name: ${name}\nemail: ${email}\nrole: ${role}`;
    const uniqueIdentifier = Math.random().toString(36).substring(7);
    const text = `Full Info (${uniqueIdentifier}):\n\n${fullInfoText}`;
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
          const { data } = await httpClient.get(
            `/products/?type=${type}&&limit=${itemsPerPage}&&offset=${offset}`
          );
          console.log('response.data.data :>> ', data.data);
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
      console.log('ctx.session.items :>> ', ctx.session.items);
      const productDetails = ctx.session.items.find(i => i._id === productId);
      console.log('productDetails :>> ', productDetails);
      const { _id, ...rest } = productDetails;
      console.log('productDetails :>> ', productDetails);
      const productDetailsText = Object.entries(rest)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const uniqueIdentifier = Math.random().toString(36).substring(7);
      const text = `Product Information (${uniqueIdentifier}):\n\n${productDetailsText}`;
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
      console.log('ctx.session.cart :>> ', ctx.session.cart);
      console.log('productId :>> ', productId);
      const productDetails = ctx.session.cart[productId];
      console.log('productDetails :>> ', productDetails);
      const { _id, ...rest } = productDetails;
      console.log('rest :>> ', rest);
      const productDetailsText = Object.entries(rest)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const uniqueIdentifier = Math.random().toString(36).substring(7);
      const text = `Product Information (${uniqueIdentifier}):\n\n${productDetailsText}`;
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
      console.log('addToCart');
      const productId = data.replace('addToCart_', '');
      try {
        await httpClient.post(`/carts`, {
          user: ctx.session.user._id,
          product: productId,
        });
      } catch (error) {
        catchError(ctx, error);
      }
    } else if (data.startsWith('removeFromCart_')) {
      const productId = data.replace('removeFromCart_', '');
      try {
        await httpClient.delete(
          `/carts?user=${ctx.session.user._id}&&product=${productId}`
        );
        await ctx.deleteMessage();

        const type = 'cart';
        const currentPage = ctx.session.typePageList[type] || 1;
        const offset = (currentPage - 1) * productsPerPage;
        const { data } = await httpClient.get(
          `/carts/${ctx.session.user._id}?limit=${productsPerPage}&&offset=${offset}`
        );
        console.log('data.data :>> ', data.data);

        let keys = Object.keys(data.data);
        ctx.session.cart = { ...data.data };
        if (productsPerPage + 1 === keys.length) {
          delete data.data[keys[keys.length - 1]];
        }
        menuPrevNextCart(ctx, data.data, type, currentPage);
      } catch (error) {
        catchError(ctx, error);
      }
    } else if (data.startsWith('prevPageBTN_')) {
      console.log('prevPageBTN_');
      updateCartQuantity(ctx);
      const type = data.replace('prevPageBTN_', '');
      if (ctx.session.typePageList[type] > 1) {
        const perPage = type === 'cart' ? productsPerPage : itemsPerPage;
        const currentPage = --ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * perPage;
          const { data } = await httpClient.get(
            `/${
              type === 'cart' ? `carts/${ctx.session.user._id}` : 'products'
            }/?type=${type}&&limit=${perPage}&&offset=${offset}`
          );
          if (type === 'cart') {
            let keys = Object.keys(data.data);
            const deepCopyData = _.cloneDeep(data.data);
            const deepCopyData1 = _.cloneDeep(data.data);
            ctx.session.cart = deepCopyData;
            ctx.session.updatedCart = deepCopyData1;
            if (perPage + 1 === keys.length) {
              delete data.data[keys[keys.length - 1]];
            }
            menuPrevNextCart(ctx, data.data, type, currentPage);
          } else {
            ctx.session.items = [...data.data];
            if (perPage + 1 === data.data.length) {
              data.data.pop();
            }
            menuPrevNext(ctx, data.data, type, currentPage);
          }
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('nextPageBTN_')) {
      console.log('nextPageBTN_');
      updateCartQuantity(ctx);
      const type = data.replace('nextPageBTN_', '');
      let products =
        type === 'cart' ? Object.values(ctx.session.cart) : ctx.session.items;
      console.log('products.length :>> ', products.length);
      const perPage = type === 'cart' ? productsPerPage : itemsPerPage;
      if (perPage + 1 === products.length) {
        const currentPage = ++ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * perPage;
          const { data } = await httpClient.get(
            `/${
              type === 'cart' ? `carts/${ctx.session.user._id}` : 'products'
            }/?type=${type}&&limit=${perPage}&&offset=${offset}`
          );
          if (type === 'cart') {
            let keys = Object.keys(data.data);
            const deepCopyData = _.cloneDeep(data.data);
            const deepCopyData1 = _.cloneDeep(data.data);
            ctx.session.cart = deepCopyData;
            ctx.session.updatedCart = deepCopyData1;
            if (perPage + 1 === keys.length) {
              delete data.data[keys[keys.length - 1]];
            }
            menuPrevNextCart(ctx, data.data, type, currentPage);
          } else {
            ctx.session.items = [...data.data];
            if (perPage + 1 === data.data.length) {
              data.data.pop();
            }
            menuPrevNext(ctx, data.data, type, currentPage);
          }
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('incQuantity_')) {
      console.log('incQuantity_');
      const type = 'cart';
      const currentPage = ctx.session.typePageList[type] || 1;
      const productId = data.replace('incQuantity_', '');
      console.log(
        'ctx.session.updatedCart[productId].quantity :>> ',
        ctx.session.updatedCart[productId].quantity
      );
      ctx.session.updatedCart[productId].quantity++;
      console.log(
        'ctx.session.updatedCart[productId].quantity :>> ',
        ctx.session.updatedCart[productId].quantity
      );
      let keys = Object.keys(ctx.session.updatedCart);
      const newData = _.cloneDeep(ctx.session.updatedCart);
      if (productsPerPage + 1 === keys.length) {
        delete newData[keys[keys.length - 1]];
      }
      console.log('newData :>> ', newData);
      menuPrevNextCart(ctx, newData, type, currentPage);
    } else if (data.startsWith('decQuantity_')) {
      console.log('decQuantity_');
      const productId = data.replace('decQuantity_', '');
      if (ctx.session.updatedCart[productId].quantity > 1) {
        const type = 'cart';
        const currentPage = ctx.session.typePageList[type] || 1;
        ctx.session.updatedCart[productId].quantity--;
        console.log(
          'ctx.session.updatedCart[productId].quantity :>> ',
          ctx.session.updatedCart[productId].quantity
        );
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
      handleLoginEmailStep(ctx, messageText);
      break;
    case 'login_password':
      await handleLoginPasswordStep(ctx, messageText);
      break;
    case 'signup_username':
      handleSignupUsernameStep(ctx, messageText);
      break;
    case 'signup_password':
      handleSignupPasswordStep(ctx, messageText);
      break;
    case 'signup_email':
      handleSignupEmailStep(ctx, messageText);
      break;
    case 'signup_role':
      await handleSignupRoleStep(ctx, messageText);
      break;
    case 'change_name':
      console.log('change_name');
      session.updateData = {};
      session.updateData.name = messageText;
      if (session.isChangeAllInfo) {
        ctx.reply('Enter new password');
        session.step = 'change_password';
      } else {
        handleChangeStep(ctx);
      }
      break;
    case 'change_password':
      console.log('change_password');
      if (session.isChangeAllInfo) {
        session.updateData.password = messageText;
        ctx.reply('Enter new email');
        session.step = 'change_email';
      } else {
        session.updateData = {};
        session.updateData.password = messageText;
        handleChangeStep(ctx);
      }
      break;
    case 'change_email':
      console.log('change_email');
      if (!session.isChangeAllInfo) {
        session.updateData = {};
      }
      session.updateData.email = messageText;
      handleChangeStep(ctx);
      break;
    default:
      ctx.reply('Please select an action.');
  }
});

bot.launch();
