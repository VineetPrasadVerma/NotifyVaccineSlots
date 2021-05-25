const axios = require('axios')
const moment = require('moment')
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()

const getCenters = async (districtId, date) => {
    try {
        const resp = await axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'Accept-Language': 'en_US',
                'Accept': 'application/json',
            }
        });
        return resp.data.centers
    } catch (e) {
        console.log('Error', e, new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
        return []
    }
}

async function getFilteredCenters(age) {
    const centers = await getCenters('313', moment().format('DD-MM-YYYY'))
    const formattedMessgae = []
    centers.map(center => {
        const sessions = center.sessions
        for (const session of sessions) {
            if (session.available_capacity > 1 && session.min_age_limit === age && session.date >= moment().format('DD-MM-YYYY')) {
                formattedMessgae.push("<b>Name:</b> " + center.name + '\n' + "<b>Address:</b> " + center.address + '\n' + "<b>Available Capacity:</b> " + session.available_capacity + '\n' + "<b>Vaccine Name:</b> " + session.vaccine + '\n' + "<b>Date:</b> " + session.date + '\n\n')
            }
        }
    })

    // console.log(formattedMessgae)
    return formattedMessgae
}

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN
const chatId = process.env.CHATID
const time = process.env.TIME

const bot = new TelegramBot(token, { polling: false });

const telegrambot = (message) => {
    try {
        bot.sendMessage(chatId, message, {
            parse_mode: 'html'
        });
    } catch (err) {
        console.log('Something went wrong when trying to send a Telegram notification', err);
    }
}

async function sendMessage() {
    const formattedMessgae = await getFilteredCenters(18)
    if (formattedMessgae.length > 0) {
        telegrambot(`<b>Vaccine Available. Schedule ASAP</b>\n\n${formattedMessgae.join('')}`)
    }
}

setInterval(() => sendMessage(), time)