const { Telegraf, session } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const { BOT_TOKEN, SERVER_API_URL } = process.env;
const bot = new Telegraf(BOT_TOKEN);
const httpClient = axios.create({ baseURL: `${SERVER_API_URL}` });

bot.use(session());

bot.start(ctx => {
  if (!ctx.session) {
    ctx.session = {};
  }
  ctx.session.registrationStep = 'initial';
  ctx.reply('Добро пожаловать! Выберите действие:', {
    reply_markup: {
      keyboard: [[{ text: 'Log In' }, { text: 'Sign Up' }]],
      resize_keyboard: true,
    },
  });
});

bot.hears('Log In', ctx => {
  ctx.reply('Введите свой логин:');
  ctx.session.registrationStep = 'login';
});

bot.hears('Sign Up', ctx => {
  ctx.reply('Введите свой логин:');
  ctx.session.registrationStep = 'signup_username';
});

bot.hears('Log Out', ctx => {
  ctx.session = {};
  ctx.reply('Вы вышли из системы. Выберите действие:', {
    reply_markup: {
      keyboard: [[{ text: 'Log In' }, { text: 'Sign Up' }]],
      resize_keyboard: true,
    },
  });
});

bot.on('text', async ctx => {
  const userId = ctx.message.from.id;
  const messageText = ctx.message.text;
  const registrationStep = ctx.session.registrationStep || '';

  switch (registrationStep) {
    case 'login':
      ctx.session.login = messageText;
      ctx.reply('Введите свой пароль:');
      ctx.session.registrationStep = 'login_password';
      break;
    case 'login_password':
      // Отправляем логин и пароль на сервер для входа
      // try {
      //   const response = await axios.post(`${SERVER_API_URL}/login`, {
      //     userId,
      //     login: ctx.session.login,
      //     password: messageText,
      //   });
      //   if (response.data.success) {
      ctx.reply('Вход выполнен успешно!');
      // Теперь пользователь вошел в систему и может просматривать продукцию и заказы
      // Реализуйте логику для просмотра данных
      ctx.reply('Выберите действие:', {
        reply_markup: {
          keyboard: [[{ text: 'Log Out' }]], // Добавляем кнопку Log Out
          resize_keyboard: true,
        },
      });
      //   } else {
      //     ctx.reply('Ошибка входа. Проверьте логин и пароль.');
      //   }
      // } catch (error) {
      //   ctx.reply('Произошла ошибка при входе.');
      //   console.error(error);
      // }
      ctx.session.registrationStep = undefined;
      break;
    case 'signup_username':
      ctx.session.username = messageText;
      ctx.reply('Введите свой пароль для регистрации:');
      ctx.session.registrationStep = 'signup_password';
      break;
    case 'signup_password':
      ctx.session.password = messageText;
      ctx.reply('Введите свой адрес электронной почты для регистрации:');
      ctx.session.registrationStep = 'signup_email';
      break;
    case 'signup_email':
      ctx.session.email = messageText;
      ctx.reply(
        'Введите свою роль (например: customer, creator, moderator) для регистрации:'
      );
      ctx.session.registrationStep = 'signup_role';
      break;
    case 'signup_role':
      ctx.session.role = messageText;
      // Отправляем данные на сервер для регистрации
      try {
        const response = await httpClient.post(`/api/users/signup`, {
          name: ctx.session.username,
          password: ctx.session.password,
          email: ctx.session.email,
          role: ctx.session.role,
          cart: [],
        });
        console.log('response.data :>> ', response.data);
        if (response.data.success) {
          ctx.reply(
            'Регистрация выполнена успешно! Теперь вы можете войти в систему.'
          );
          ctx.reply('Выберите действие:', {
            reply_markup: {
              keyboard: [[{ text: 'Log Out' }]], // Добавляем кнопку Log Out
              resize_keyboard: true,
            },
          });
        } else {
          ctx.session = {};
          ctx.reply(
            'Ошибка регистрации. Пожалуйста, попробуйте другой логин или проверьте данные.'
          );
        }
      } catch (error) {
        ctx.session = {};
        ctx.reply('Произошла ошибка при регистрации.');
        console.error(error);
      }
      ctx.session.registrationStep = undefined;
      break;
    default:
      ctx.reply('Пожалуйста, выберите действие.');
  }
});

bot.launch();
