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

function initializeSession ({ session }) {
  session = {};
  session.isLogin = false;
  session.typePageList = {
    'Video Card': 1,
    CPU: 1,
    Case: 1,
    Motherboard: 1,
    RAM: 1,
  };
  console.log('ctx.session :>> ', session);
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
    if (data.data) {
      session.isLogin = true;
      session.login = { ...data.data };
      ctx.reply('Login successful! Choose an action:', {
        reply_markup: {
          keyboard: [[{ text: 'Menu' }, { text: 'Log Out' }]],
          resize_keyboard: true,
        },
      });
    }
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
    cart: [],
  };

  try {
    await signUpSchem.validate(userSignupData, { abortEarly: false });
    const { data } = await httpClient.post(`/users/signup`, userSignupData);
    if (data.data) {
      session.isLogin = true;
      delete session.signup.password;
      ctx.reply('Registration completed successfully! Choose an action:', {
        reply_markup: {
          keyboard: [[{ text: 'Menu' }, { text: 'Log Out' }]],
          resize_keyboard: true,
        },
      });
    }
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

const deleteChatMessage = async (ctx, id) => {
  if (id) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }
};

const editMessage = async (ctx, text) => {
  if (ctx.session.messageId) {
    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.session.messageId,
        null,
        text
      );
    } catch (error) {
      const sentMessage = await ctx.reply(text);
      ctx.session.messageId = sentMessage.message_id;
    }
  } else {
    const sentMessage = await ctx.reply(text);
    ctx.session.messageId = sentMessage.message_id;
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
      `/users/${session.signup ? session.signup.email : session.login.email}`,
      userUpdateData
    );
    console.log('data');
    if (data.data) {
      console.log('data.data');
      if (session.signup) {
        session.signup = { ...data.data };
        console.log('session.signup :>> ', session.signup);
      } else {
        session.login = { ...data.data };
        console.log('session.login :>> ', session.login);
      }
      ctx.reply('User was updated');
      deleteChatMessage(ctx, ctx.session.menuId);
      deleteChatMessage(ctx, ctx.session.messageId);
      const sentMessage = await ctx.reply('Main menu', accountMenuKeyboard);
      ctx.session.menuId = sentMessage.message_id;
    }
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
  deleteChatMessage,
  editMessage,
  handleChangeStep,
};
