require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const {
  mainMenuKeyboard,
  productsMenuKeyboard,
  ordersMenuKeyboard,
  accountMenuKeyboard,
  itemsPerPage,
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
} = require('./functions');

const { BOT_TOKEN } = process.env;
const bot = new Telegraf(BOT_TOKEN);

const showMenuKeyboard = async (ctx, keyboard) => {
  if (ctx.session.isLogin) {
    deleteChatMessage(ctx, ctx.session.messageId);
    ctx.editMessageText('Main menu', keyboard);
  } else {
    ctx.reply('Need authorization');
  }
};

const catchError = (ctx, error) => {
  ctx.session.registrationStep = 'initial';
  if (error.response) {
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
  ctx.session.registrationStep = 'login_email';
});

bot.hears('Sign Up', ctx => {
  initializeSession(ctx);
  ctx.reply('Enter your login:');
  ctx.session.registrationStep = 'signup_username';
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

bot.action('getOrders', ctx => {
  showMenuKeyboard(ctx, ordersMenuKeyboard);
});

bot.action('getAccount', ctx => {
  showMenuKeyboard(ctx, accountMenuKeyboard);
});

bot.on('callback_query', async ctx => {
  if (ctx.session.isLogin) {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('getProducts_')) {
      const type = data.replace('getProducts_', '');
      const currentPage = ctx.session.typePageList[type] || 1;
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const { data } = await httpClient.get(
          `/products/?type=${type}&&limit=${itemsPerPage}&&offset=${offset}`
        );
        console.log('response.data.data :>> ', data.data);
        if (data.data.next) {
          menuPrevNext(ctx, data, type, currentPage);
        }
      } catch (error) {
        catchError(ctx, error);
      }
    } else if (data.startsWith('getProduct_')) {
      const productId = data.replace('getProduct_', '');
      const response = await httpClient.get(`/products/${productId}`);
      const productDetails = response.data.data;

      const productDetailsText = Object.entries(productDetails)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const uniqueIdentifier = Math.random().toString(36).substring(7);

      if (ctx.session.messageId) {
        try {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            ctx.session.messageId,
            null,
            `Product Information (${uniqueIdentifier}):\n\n${productDetailsText}`
          );
        } catch (error) {
          const sentMessage = await ctx.reply(
            `Product Information (${uniqueIdentifier}):\n\n${productDetailsText}`
          );
          ctx.session.messageId = sentMessage.message_id;
        }
      } else {
        const sentMessage = await ctx.reply(
          `Product Information (${uniqueIdentifier}):\n\n${productDetailsText}`
        );
        ctx.session.messageId = sentMessage.message_id;
      }
    } else if (data.startsWith('prevPageBTN_')) {
      console.log('prevPageBTN_');
      const type = data.replace('prevPageBTN_', '');
      if (ctx.session.typePageList[type] > 1) {
        const currentPage = --ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * itemsPerPage;
          const { data } = await httpClient.get(
            `/products/?type=${type}&&limit=${itemsPerPage}&&offset=${offset}`
          );
          menuPrevNext(ctx, data, type, currentPage);
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('nextPageBTN_')) {
      console.log('nextPageBTN_');
      const type = data.replace('nextPageBTN_', '');
      const currentPage = ++ctx.session.typePageList[type];
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const { data } = await httpClient.get(
          `/products/?type=${type}&&limit=${itemsPerPage}&&offset=${offset}`
        );
        console.log('response.data.data :>> ', data.data);
        if (data.data.next) {
          menuPrevNext(ctx, data, type, currentPage);
        } else {
          --ctx.session.typePageList[type];
        }
      } catch (error) {
        catchError(ctx, error);
      }
    }
  } else {
    ctx.reply('Need authorization');
  }
});

bot.on('text', async ctx => {
  const messageText = ctx.message.text;
  const registrationStep = ctx.session.registrationStep || '';
  switch (registrationStep) {
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
    default:
      ctx.reply('Please select an action.');
  }
});

bot.launch();
