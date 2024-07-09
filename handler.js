const axios = require('axios');
const { Telegraf } = require('telegraf');

// Replace 'YOUR_BOT_TOKEN' with your bot's token
const BOT_TOKEN = process.env.BOT_TOKEN;
// Replace 'CHAT_ID' with your group's chat ID
const CHAT_ID = process.env.CHAT_ID;

const bot = new Telegraf(BOT_TOKEN);

const getExchangeRate = async (currency) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const response = await axios.get(`https://cron.numbers.lk/api/exrates?currency=${currency}&date=${today}&latest=true`);
    const exchangeRates = response.data.data;
    return exchangeRates.map(({ bank, buying_currency, selling_currency }) => {
      return {
        bank,
        buyingRate: buying_currency,
        sellingRate: selling_currency,
      };
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
  }
};

const formatExchangeRates = (currency, rates) => {
  let message = `Exchange Rates for ${currency}:\n\n`;
  
  // Find the maximum length for each bank according to the bank name for padding
  const maxLength = [16, 21, 20, 10, 20, 19, 21, 21, 16, 14, 23]
  
  rates.forEach((rate, i) => {
    const buyingRate = parseFloat(rate.buyingRate).toFixed(2);
    const sellingRate = parseFloat(rate.sellingRate).toFixed(2);
    
    // Pad bank name to align columns
    const paddedBank = rate.bank.padEnd(maxLength[i], ' ');
    
    message += `${paddedBank} |${buyingRate}(B) |${sellingRate}(S)\n`;
  });
  
  return message;
};

const sendExchangeRate = async () => {
  const exchangeRatesUSD = await getExchangeRate("USD");
  const exchangeRatesEUR = await getExchangeRate("EUR");

  let message = formatExchangeRates('USD', exchangeRatesUSD);
  message += `-----------------------------------------------------------\n\n`
  message += formatExchangeRates('EUR', exchangeRatesEUR);

  try {
    await bot.telegram.sendMessage(CHAT_ID, message);
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Lambda handler
exports.run = async () => {
  await sendExchangeRate();
};