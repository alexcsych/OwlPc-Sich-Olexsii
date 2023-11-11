const { API } = require('./api');
const { accountMenuKeyboard } = require('./menu');
const { signUpSchem, logInSchem, updateUserSchem } = require('./validation');

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
  ctx.reply(
    'Enter your password:\n(Password must be at least 6 characters long and include a number, a lowercase letter, an uppercase letter, and a symbol)'
  );
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
    const { data } = await API.loginUser(userLoginData);

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
  ctx.reply(
    'Enter your password to register:\n(Password must be at least 6 characters long and include a number, a lowercase letter, an uppercase letter, and a symbol)'
  );
  session.step = 'signup_password';
}

function handleSignupPasswordStep (ctx, messageText) {
  const { session } = ctx;
  session.signup.password = messageText;
  ctx.reply(
    'Enter your email address to register (e.g., example@example.com):'
  );
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
    const { data } = await API.signupUser(userSignupData);

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

const menuPrevNext = (ctx, data, type, currentPage) => {
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

const menuPrevNextCart = (ctx, data, type, currentPage) => {
  console.log('menuPrevNextCart :>> ', data);
  const inlineKeyboard = Object.values(data).map(pr => [
    {
      text: pr.name,
      callback_data: `getCartProduct_${pr._id}`,
    },
    { text: '➖', callback_data: `decQuantity_${pr._id}` },
    { text: `${pr.quantity}`, callback_data: `quantity` },
    { text: '➕', callback_data: `incQuantity_${pr._id}` },
  ]);
  inlineKeyboard.push([
    { text: '<', callback_data: `prevPageBTN_${type}` },
    { text: `Current Page ${currentPage}`, callback_data: `page` },
    { text: '>', callback_data: `nextPageBTN_${type}` },
  ]);
  inlineKeyboard.push([{ text: '<<', callback_data: 'getMenu' }]);
  const replyMarkup = {
    inline_keyboard: inlineKeyboard,
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
    const { data } = await API.updateUser(session.user._id, userUpdateData);
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

const updateCartQuantity = async ctx => {
  console.log('updateCartQuantity');
  console.log('ctx.session.cart :>> ', ctx.session.cart);
  console.log('ctx.session.updatedCart :>> ', ctx.session.updatedCart);
  console.log(
    'ctx.session.cart && ctx.session.updatedCart :>> ',
    ctx.session.cart !== undefined && ctx.session.updatedCart !== undefined
  );
  if (ctx.session.cart !== undefined && ctx.session.updatedCart !== undefined) {
    const diffArray = [];
    console.log('123');

    for (const productId in ctx.session.cart) {
      console.log('productId :>> ', productId);
      console.log(
        ctx.session.cart.hasOwnProperty(productId) &&
          ctx.session.updatedCart.hasOwnProperty(productId)
      );
      if (
        ctx.session.cart.hasOwnProperty(productId) &&
        ctx.session.updatedCart.hasOwnProperty(productId)
      ) {
        console.log(
          'ctx.session.updatedCart[productId].quantity :>> ',
          ctx.session.updatedCart[productId].quantity
        );
        console.log(
          'ctx.session.cart[productId].quantity :>> ',
          ctx.session.cart[productId].quantity
        );
        const quantityDiff =
          ctx.session.updatedCart[productId].quantity -
          ctx.session.cart[productId].quantity;
        console.log('quantityDiff :>> ', quantityDiff);
        if (quantityDiff !== 0) {
          diffArray.push({
            user: ctx.session.user._id,
            product: productId,
            quantity: ctx.session.updatedCart[productId].quantity,
          });
        }
      }
    }

    console.log('diffArray :>> ', diffArray);
    if (diffArray.length > 0) {
      console.log('diffArray :>> ', diffArray);
      try {
        await API.updateQuantity({ updateProducts: diffArray });
      } catch (error) {
        catchError(ctx, error);
      }
    }
  }
};

module.exports = {
  catchError,
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
  updateCartQuantity,
};
