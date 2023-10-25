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
  editMessage,
  handleChangeStep,
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
  ctx.session.step = 'initial';
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

bot.action('getOrders', ctx => {
  showMenuKeyboard(ctx, ordersMenuKeyboard);
});

bot.action('getAccount', ctx => {
  showMenuKeyboard(ctx, accountMenuKeyboard);
});

bot.action('changeName', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.step = 'change_name';
    editMessage(ctx, 'Enter new name');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changePassword', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.step = 'change_password';
    editMessage(ctx, 'Enter new password');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changeEmail', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.step = 'change_email';
    editMessage(ctx, 'Enter new email');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('changeAllInfo', ctx => {
  if (ctx.session.isLogin) {
    ctx.session.step = 'change_all_info';
    editMessage(ctx, 'Enter new all info');
  } else {
    ctx.reply('Need authorization');
  }
});

bot.action('getFullInfo', ctx => {
  if (ctx.session.isLogin) {
    const fullInfo = ctx.session.login
      ? { ...ctx.session.login }
      : { ...ctx.session.signup };
    console.log('fullInfo :>> ', fullInfo);

    const fullInfoText = Object.keys(fullInfo)
      .map(key => `${key}: ${fullInfo[key]}`)
      .join('\n');
    console.log(fullInfoText);

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
        const offset = (currentPage - 1) * itemsPerPage;
        const { data } = await httpClient.get(
          `/products/?type=${type}&&limit=${itemsPerPage}&&offset=${offset}`
        );
        console.log('response.data.data :>> ', data.data);
        ctx.session.items = [...data.data];
        if (itemsPerPage + 1 === ctx.session.items.length) {
          data.data.pop();
          menuPrevNext(ctx, data, type, currentPage);
        } else {
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
      const productDetailsText = Object.entries(productDetails)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const uniqueIdentifier = Math.random().toString(36).substring(7);
      const text = `Product Information (${uniqueIdentifier}):\n\n${productDetailsText}`;
      editMessage(ctx, text);
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
          ctx.session.items = [...data.data];
          if (itemsPerPage + 1 === ctx.session.items.length) {
            data.data.pop();
            menuPrevNext(ctx, data, type, currentPage);
          } else {
            menuPrevNext(ctx, data, type, currentPage);
          }
        } catch (error) {
          catchError(ctx, error);
        }
      }
    } else if (data.startsWith('nextPageBTN_')) {
      console.log('nextPageBTN_');
      const type = data.replace('nextPageBTN_', '');
      console.log('ctx.session.items.length :>> ', ctx.session.items.length);
      console.log('itemsPerPage + 1 :>> ', itemsPerPage + 1);
      if (itemsPerPage + 1 === ctx.session.items.length) {
        const currentPage = ++ctx.session.typePageList[type];
        try {
          const offset = (currentPage - 1) * itemsPerPage;
          const { data } = await httpClient.get(
            `/products/?type=${type}&&limit=${itemsPerPage}&&offset=${offset}`
          );
          console.log('response.data.data :>> ', data.data);
          ctx.session.items = [...data.data];
          if (itemsPerPage + 1 === ctx.session.items.length) {
            data.data.pop();
            menuPrevNext(ctx, data, type, currentPage);
          } else {
            menuPrevNext(ctx, data, type, currentPage);
          }
        } catch (error) {
          catchError(ctx, error);
        }
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
      handleChangeStep(ctx);
      break;
    case 'change_password':
      console.log('change_password');
      session.updateData = {};
      session.updateData.password = messageText;
      handleChangeStep(ctx);
      break;
    case 'change_email':
      console.log('change_email');
      session.updateData = {};
      session.updateData.email = messageText;
      handleChangeStep(ctx);
      break;
    case 'change_all_info':
      console.log('change_all_info');
      // handleChangeAllInfoStep(ctx, messageText);
      break;
    default:
      ctx.reply('Please select an action.');
  }
});

bot.launch();
