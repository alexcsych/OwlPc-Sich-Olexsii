const { Telegraf, session } = require('telegraf');
const axios = require('axios');
const { signUpSchem, logInSchem } = require('./validation');
require('dotenv').config();

const { BOT_TOKEN, SERVER_API_URL, SALT_ROUNDS } = process.env;
const bot = new Telegraf(BOT_TOKEN);
const httpClient = axios.create({ baseURL: `${SERVER_API_URL}` });

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
      `Ошибка валидации. Пожалуйста, проверьте введенные данные.\n\nvalidationErrors:\n${error.errors.join(
        '\n'
      )}`
    );
  } else {
    ctx.reply(`${error}`);
  }
};

bot.use(session());

bot.start(ctx => {
  if (!ctx.session) {
    ctx.session = {};
    ctx.session.isLogin = false;
  }
  console.log('ctx.session :>> ', ctx.session);
  // ctx.session.registrationStep = 'initial';
  console.log('ctx.session :>> ', ctx.session);
  ctx.reply('Добро пожаловать! Выберите действие:', {
    reply_markup: {
      keyboard: [[{ text: 'Log In' }, { text: 'Sign Up' }]],
      resize_keyboard: true,
    },
  });
});

bot.hears('Log In', ctx => {
  if (!ctx.session) {
    ctx.session = {};
    ctx.session.isLogin = false;
  }
  console.log('ctx.session :>> ', ctx.session);
  ctx.reply('Введите свою почту:');
  ctx.session.registrationStep = 'login_email';
});

bot.hears('Sign Up', ctx => {
  if (!ctx.session) {
    ctx.session = {};
    ctx.session.isLogin = false;
  }
  console.log('ctx.session :>> ', ctx.session);
  ctx.reply('Введите свой логин:');
  ctx.session.registrationStep = 'signup_username';
});

bot.hears('Log Out', ctx => {
  if (!ctx.session) {
    ctx.session = {};
    ctx.session.isLogin = false;
  }
  if (ctx.session.isLogin) {
    ctx.session = {};
    ctx.session.isLogin = false;
    ctx.reply('Вы вышли из системы. Выберите действие:', {
      reply_markup: {
        keyboard: [[{ text: 'Log In' }, { text: 'Sign Up' }]],
        resize_keyboard: true,
      },
    });
  }
});

bot.hears('Menu', ctx => {
  if (ctx.session.isLogin) {
    ctx.reply('Головне меню', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Products', callback_data: 'getProducts' }],
          [{ text: 'Orders', callback_data: 'getOrders' }],
        ],
      },
    });
  } else {
    ctx.reply('Need autorisation');
  }
});

bot.action('getProducts', ctx => {
  if (ctx.session.isLogin) {
    ctx.reply('Статистика за день', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Products', callback_data: 'getProducts' }],
          [{ text: 'Orders', callback_data: 'getOrders' }],
        ],
      },
    });
  } else {
    ctx.reply('Need autorisation');
  }
});

bot.on('text', async ctx => {
  if (!ctx.session) {
    ctx.session = {};
    ctx.session.isLogin = false;
  }
  // const userId = ctx.message.from.id;
  const messageText = ctx.message.text;
  const registrationStep = ctx.session.registrationStep || '';
  switch (registrationStep) {
    case 'login_email':
      ctx.session.loginEmail = messageText;
      ctx.reply('Введите свой пароль:');
      ctx.session.registrationStep = 'login_password';
      console.log(
        'ctx.session.registrationStep :>> ',
        ctx.session.registrationStep
      );
      break;
    case 'login_password':
      // Отправляем логин и пароль на сервер для входа
      ctx.session.loginPassword = messageText;
      console.log('ctx.session.loginPassword :>> ', ctx.session.loginPassword);
      const userLoginData = {
        email: ctx.session.loginEmail,
        password: ctx.session.loginPassword,
      };
      console.log('userLoginData :>> ', userLoginData);
      try {
        await logInSchem.validate(userLoginData, { abortEarly: false });
        const response = await httpClient.post(`/users/login`, userLoginData);
        if (response.data.data) {
          ctx.session.isLogin = true;
          ctx.reply('Вход выполнен успешно!');
          ctx.reply('Выберите действие:', {
            reply_markup: {
              keyboard: [[{ text: 'Menu' }, { text: 'Log Out' }]], // Добавляем кнопку Log Out
              resize_keyboard: true,
            },
          });
        }
      } catch (error) {
        console.log('error :>> ', error);
        catchError(ctx, error);
      }
      break;
    case 'signup_username':
      ctx.session.signupUsername = messageText;
      ctx.reply('Введите свой пароль для регистрации:');
      ctx.session.registrationStep = 'signup_password';
      break;
    case 'signup_password':
      ctx.session.signupPassword = messageText;
      ctx.reply('Введите свой адрес электронной почты для регистрации:');
      ctx.session.registrationStep = 'signup_email';
      break;
    case 'signup_email':
      ctx.session.signupEmail = messageText;
      ctx.reply(
        'Введите свою роль (например: customer, creator, moderator) для регистрации:'
      );
      ctx.session.registrationStep = 'signup_role';
      break;
    case 'signup_role':
      ctx.session.signupRole = messageText;
      const userSignupData = {
        name: ctx.session.signupUsername,
        password: ctx.session.signupPassword,
        email: ctx.session.signupEmail,
        role: ctx.session.signupRole,
        cart: [],
      };

      try {
        await signUpSchem.validate(userSignupData, { abortEarly: false });
        const response = await httpClient.post(`/users/signup`, userSignupData);
        if (response.data.data) {
          ctx.reply(
            'Регистрация выполнена успешно! Теперь вы можете войти в систему.'
          );
          ctx.reply('Выберите действие:', {
            reply_markup: {
              keyboard: [[{ text: 'Menu' }, { text: 'Log Out' }]], // Добавляем кнопку Log Out
              resize_keyboard: true,
            },
          });
          ctx.session.isLogin = true;
        }
      } catch (error) {
        catchError(ctx, error);
      }
      break;
    default:
      ctx.reply('Пожалуйста, выберите действие.');
  }
});

bot.launch();
