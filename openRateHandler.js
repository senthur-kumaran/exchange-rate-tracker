const axios = require('axios');
const { Telegraf } = require('telegraf');

// Replace 'YOUR_BOT_TOKEN' with your bot's token
const BOT_TOKEN = process.env.BOT_TOKEN;
// Replace 'CHAT_ID' with your group's chat ID
const CHAT_ID = process.env.CHAT_ID;

// Replace 'OPEN_EXCHANGE_API_KEY' with open exchange api key
const OPEN_EXCHANGE_API_KEY = process.env.OPEN_EXCHANGE_API_KEY;

const bot = new Telegraf(BOT_TOKEN);

const getExchangeRate = async () => {
    try {
        const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_API_KEY}&symbols=LKR,USD,EUR`);
        const rates = response.data.rates;
        return rates;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
    }
};

const sendExchangeRate = async () => {
    const rates = await getExchangeRate();

    const euroToLkr = (rates.LKR / rates.EUR).toFixed(2);
    const usdToLkr = (rates.LKR / rates.USD).toFixed(2);
    const euroToUsd = (rates.USD / rates.EUR).toFixed(2);

    const message = `Exchange Rates:\n\nEURO to LKR: ${euroToLkr}\nUSD to LKR: ${usdToLkr}\nEURO to USD: ${euroToUsd}`;

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