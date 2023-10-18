require('dotenv').config();
const axios = require('axios');
const { signUpSchem, logInSchem } = require('./validation');
const { SERVER_API_URL } = process.env;
const httpClient = axios.create({ baseURL: SERVER_API_URL });

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

function initializeSession (ctx) {
  ctx.session = {};
  ctx.session.isLogin = false;
  console.log('ctx.session :>> ', ctx.session);
}

function handleLoginEmailStep (ctx, messageText) {
  const { session } = ctx;
  session.loginEmail = messageText;
  ctx.reply('Enter your password:');
  session.registrationStep = 'login_password';
  console.log('ctx.session.registrationStep :>> ', session.registrationStep);
}

async function handleLoginPasswordStep (ctx, messageText) {
  const { session } = ctx;
  session.loginPassword = messageText;
  session.registrationStep = '';
  const userLoginData = {
    email: session.loginEmail,
    password: session.loginPassword,
  };

  try {
    await logInSchem.validate(userLoginData, { abortEarly: false });
    const response = await httpClient.post(`/users/login`, userLoginData);
    if (response.data.data) {
      session.isLogin = true;
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
  session.signupUsername = messageText;
  ctx.reply('Enter your password to register:');
  session.registrationStep = 'signup_password';
}

function handleSignupPasswordStep (ctx, messageText) {
  const { session } = ctx;
  session.signupPassword = messageText;
  ctx.reply('Enter your email address to register:');
  session.registrationStep = 'signup_email';
}

function handleSignupEmailStep (ctx, messageText) {
  const { session } = ctx;
  session.signupEmail = messageText;
  ctx.reply(
    'Enter your role (for example: customer, creator, moderator) to register:'
  );
  session.registrationStep = 'signup_role';
}

async function handleSignupRoleStep (ctx, messageText) {
  const { session } = ctx;
  session.signupRole = messageText;
  session.registrationStep = '';
  const userSignupData = {
    name: session.signupUsername,
    password: session.signupPassword,
    email: session.signupEmail,
    role: session.signupRole,
    cart: [],
  };

  try {
    await signUpSchem.validate(userSignupData, { abortEarly: false });
    const response = await httpClient.post(`/users/signup`, userSignupData);
    if (response.data.data) {
      session.isLogin = true;
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
const menuPrevNext = (ctx, { data }, category, currentPage) => {
  const inlineKeyboard = data.products.map(pr => ({
    text: pr.name,
    callback_data: `getProduct_${pr._id}`,
  }));
  const groupedButtons = [];
  while (inlineKeyboard.length > 0) {
    groupedButtons.push(inlineKeyboard.splice(0, 3));
  }
  groupedButtons.push([
    { text: '<', callback_data: `prevPageBTN_${category}` },
    { text: `Current Page ${currentPage}`, callback_data: `page` },
    { text: '>', callback_data: `nextPageBTN_${category}` },
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
};
