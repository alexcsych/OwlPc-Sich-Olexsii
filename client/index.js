require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const {
  mainMenuKeyboard,
  productsMenuKeyboard,
  ordersMenuKeyboard,
  accountMenuKeyboard,
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
} = require('./functions');

const { BOT_TOKEN } = process.env;
const bot = new Telegraf(BOT_TOKEN);

const showMenuKeyboard = (ctx, keyboard) => {
  if (ctx.session.isLogin) {
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

bot.hears('Menu', ctx => {
  if (ctx.session.isLogin) {
    ctx.reply('Main menu', mainMenuKeyboard);
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

bot.action('getProductsCPU', async ctx => {
  if (ctx.session.isLogin) {
    try {
      console.log('response');
      const response = await httpClient.get(`/products/?type=Видеокарта`);
      console.log('response.data.data :>> ', response.data.data);
      const inlineKeyboard = response.data.data.map(pr => ({
        text: pr.name,
        callback_data: 'getMenu',
      }));
      const groupedButtons = [];
      while (inlineKeyboard.length > 0) {
        groupedButtons.push(inlineKeyboard.splice(0, 3));
      }
      groupedButtons.push([
        { text: '<', callback_data: 'getMenu' },
        { text: '>', callback_data: 'getMenu' },
      ]);
      groupedButtons.push([{ text: '<<', callback_data: 'getMenu' }]);
      const replyMarkup = {
        inline_keyboard: groupedButtons,
      };
      ctx.editMessageText('Main menu', { reply_markup: replyMarkup });
    } catch (error) {
      catchError(ctx, error);
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
