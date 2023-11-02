require('dotenv').config();
const axios = require('axios');
const { signUpSchem, logInSchem, updateUserSchem } = require('./validation');
const { accountMenuKeyboard } = require('./menu');
const { SERVER_API_URL } = process.env;
const httpClient = axios.create({ baseURL: SERVER_API_URL });

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

function initializeSession (ctx) {
  ctx.session = {};
  ctx.session.user = {};
  ctx.session.cartProductsId = [];
  ctx.session.isLogin = false;
  ctx.session.typePageList = {
    'Video Card': 1,
    CPU: 1,
    Case: 1,
    Motherboard: 1,
    RAM: 1,
    cart: 1,
  };
  console.log('ctx.session :>> ', ctx.session);
}

function handleLoginEmailStep (ctx, messageText) {
  const { session } = ctx;
  session.login = {};
  session.login.email = messageText;
  ctx.reply('Enter your password:');
  session.step = 'login_password';
  console.log('ctx.session.step :>> ', session.step);
}

async function handleLoginPasswordStep (ctx, messageText) {
  const { session } = ctx;
  session.login.password = messageText;
  session.step = '';
  const userLoginData = {
    ...session.login,
  };

  try {
    await logInSchem.validate(userLoginData, { abortEarly: false });
    const { data } = await httpClient.post(`/users/login`, userLoginData);

    session.isLogin = true;
    session.user = { ...data.data.user };
    session.cartProductsId = [...data.data.cart];
    ctx.reply('Login successful! Choose an action:', {
      reply_markup: {
        keyboard: [[{ text: 'Menu' }, { text: 'Log Out' }]],
        resize_keyboard: true,
      },
    });
  } catch (error) {
    catchError(ctx, error);
  }
}

function handleSignupUsernameStep (ctx, messageText) {
  const { session } = ctx;
  session.signup = {};
  session.signup.name = messageText;
  ctx.reply('Enter your password to register:');
  session.step = 'signup_password';
}

function handleSignupPasswordStep (ctx, messageText) {
  const { session } = ctx;
  session.signup.password = messageText;
  ctx.reply('Enter your email address to register:');
  session.step = 'signup_email';
}

function handleSignupEmailStep (ctx, messageText) {
  const { session } = ctx;
  session.signup.email = messageText;
  ctx.reply(
    'Enter your role (for example: customer, creator, moderator) to register:'
  );
  session.step = 'signup_role';
}

async function handleSignupRoleStep (ctx, messageText) {
  const { session } = ctx;
  session.signup.role = messageText;
  session.step = '';
  const userSignupData = {
    ...session.signup,
  };

  try {
    await signUpSchem.validate(userSignupData, { abortEarly: false });
    const { data } = await httpClient.post(`/users/signup`, userSignupData);

    session.isLogin = true;
    session.user = { ...data.data.user };
    session.cartProductsId = [...data.data.cart];
    ctx.reply('Registration completed successfully! Choose an action:', {
      reply_markup: {
        keyboard: [[{ text: 'Menu' }, { text: 'Log Out' }]],
        resize_keyboard: true,
      },
    });
  } catch (error) {
    catchError(ctx, error);
  }
}

const menuPrevNext = (ctx, { data }, type, currentPage) => {
  const inlineKeyboard = data.map(pr => ({
    text: pr.name,
    callback_data: `getProduct_${pr._id}`,
  }));
  const groupedButtons = [];
  while (inlineKeyboard.length > 0) {
    groupedButtons.push(inlineKeyboard.splice(0, 3));
  }
  groupedButtons.push([
    { text: '<', callback_data: `prevPageBTN_${type}` },
    { text: `Current Page ${currentPage}`, callback_data: `page` },
    { text: '>', callback_data: `nextPageBTN_${type}` },
  ]);
  groupedButtons.push([{ text: '<<', callback_data: 'getProducts' }]);
  const replyMarkup = {
    inline_keyboard: groupedButtons,
  };
  ctx.editMessageText('Main menu', { reply_markup: replyMarkup });
};

const menuPrevNextCart = (ctx, { data }, type, currentPage) => {
  const inlineKeyboard = data.map(pr => ({
    text: pr.name,
    callback_data: `getCartProduct_${pr._id}`,
  }));
  const groupedButtons = [];
  while (inlineKeyboard.length > 0) {
    groupedButtons.push(inlineKeyboard.splice(0, 3));
  }
  groupedButtons.push([
    { text: '<', callback_data: `prevPageBTN_${type}` },
    { text: `Current Page ${currentPage}`, callback_data: `page` },
    { text: '>', callback_data: `nextPageBTN_${type}` },
  ]);
  groupedButtons.push([{ text: '<<', callback_data: 'getMenu' }]);
  const replyMarkup = {
    inline_keyboard: groupedButtons,
  };
  editMessage(ctx, 'Main menu', { reply_markup: replyMarkup }, true);
};

const deleteChatMessage = async (ctx, id) => {
  if (id) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }
};

const editMessage = async (ctx, text, inlineBtn, isRemoveFromCart) => {
  const chatId = ctx.chat.id;
  const messageId = isRemoveFromCart
    ? ctx.session.menuId
    : ctx.session.messageId;

  try {
    const options = !inlineBtn ? null : inlineBtn;
    const sentMessage = await ctx.telegram.editMessageText(
      chatId,
      messageId,
      null,
      text,
      options
    );
    isRemoveFromCart
      ? (ctx.session.menuId = sentMessage.message_id)
      : (ctx.session.messageId = sentMessage.message_id);
  } catch (error) {
    const options = !inlineBtn ? {} : inlineBtn;
    const sentMessage = await ctx.reply(text, options);
    isRemoveFromCart
      ? (ctx.session.menuId = sentMessage.message_id)
      : (ctx.session.messageId = sentMessage.message_id);
  }
};

const handleChangeStep = async ctx => {
  const { session } = ctx;
  session.step = '';
  const userUpdateData = {
    ...session.updateData,
  };
  try {
    await updateUserSchem.validate(userUpdateData, { abortEarly: false });
    console.log('valid :>> ');
    const { data } = await httpClient.put(
      `/users/${session.user._id}`,
      userUpdateData
    );
    console.log('data.data');
    session.user = { ...data.data };
    console.log('session.user :>> ', session.user);

    await ctx.reply('User was updated');
    deleteChatMessage(ctx, ctx.session.menuId);
    deleteChatMessage(ctx, ctx.session.messageId);
    const sentMessage = await ctx.reply('Main menu', accountMenuKeyboard);
    ctx.session.menuId = sentMessage.message_id;
  } catch (error) {
    catchError(ctx, error);
  }
};

module.exports = {
  httpClient,
  initializeSession,
  handleLoginEmailStep,
  handleLoginPasswordStep,
  handleSignupUsernameStep,
  handleSignupPasswordStep,
  handleSignupEmailStep,
  handleSignupRoleStep,
  menuPrevNext,
  menuPrevNextCart,
  deleteChatMessage,
  editMessage,
  handleChangeStep,
};
