const Botkit = require('botkit');
const config = require('./config');
const contract = require('./contract');

const controller = Botkit.slackbot({
  json_file_store: 'storage_bot',
  debug: false,
});

controller.spawn({
  token: config.SLACK_TOKEN
}).startRTM(err => {
  if (err) {
    throw new Error(err);
  }
});

/**
 * アドレスの登録
 * command: register {address}
 */
controller.hears(['register ([a-zA-Z0-9]+)'], 'direct_mention', (bot, msg) => {
  const address = msg.match[1] || '';
  console.log(`register address: ${address}`);

  controller.storage.users.get(msg.user, (err, user) => {
    if (err) {
      console.error(err);
    }
    const userInfo = {
      id: msg.user,
      address,
    };

    console.log(`userInfo: ${userInfo}`);

    controller.storage.users.save(userInfo, (err, id) => {
      if (err) {
        console.error(err);
      }
      bot.reply(msg, `アドレス： \`${userInfo.address}\` を登録しました！`);
    });

  })
});

/**
 * トークンの送付
 * command: tip {user name} {数量}
 */
controller.hears(['tip (.*) ([0-9]+)'], 'direct_mention', (bot, msg) => {
  const toUser = msg.match[1] || '';
  const amount = msg.match[2] || 0;

  controller.storage.users.get(toUser, (err, user) => {
    if (err) {
      console.error(err);
      bot.reply(msg, ':warning: 送付先のアドレスが登録されていません');
      return;
    }
    console.log(`toUser: ${toUser}\namount: ${amount}`);
    console.log(user);

    contract.transfer(user.address, amount)
      .then(res => {
        console.log(res);
        bot.reply(msg, 'トークンを送付しました！');
        // TODO: 送られた側にダイレクトメッセージで送付されたことを伝えたい
      })
      .catch(err => {
        console.error(err);
        bot.reply(msg, 'トークンの送付に失敗しました');
      });

  });

});

/**
 * 残高表示
 * command: balance
 */
controller.hears(['balance'], 'direct_mention', (bot, msg) => {

  controller.storage.users.get(msg.user, (err, sender) => {
    if (err) {
      console.error(err);
      bot.reply(msg, ':warning: 残高確認ができません');
      return;
    }
    console.log(sender);

    const balance = contract.balanceOf(sender.address)
      .then(balance => {
        bot.reply(msg, `残高：${balance/1e18} ${config.SYMBOL}`);
      })
      .catch(err => {
        console.error(err);
        bot.reply(msg, `エラーが発生しました`);
      })

  });

});

/**
 * トークンの送付（デバッグ用）
 * command: tip {user name} {数量}
 */
controller.hears(['tiptest (.*) ([0-9]+)'], 'direct_mention', (bot, msg) => {
  const toUserAddress = msg.match[1] || '';
  const amount = msg.match[2] || 0;

  contract.transfer(toUserAddress, amount)
    .then(res => {
      console.log(res);
      bot.reply(msg, 'トークンを送付しました！');
    })
    .catch(err => {
      console.error(err);
      bot.reply(msg, 'トークンの送付に失敗しました');
    });

});
