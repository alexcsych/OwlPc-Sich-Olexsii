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

module.exports = {
  httpClient,
  initializeSession,
  handleLoginEmailStep,
  handleLoginPasswordStep,
  handleSignupUsernameStep,
  handleSignupPasswordStep,
  handleSignupEmailStep,
  handleSignupRoleStep,
};
