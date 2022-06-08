import TelegramBot from 'node-telegram-bot-api';

process.env.NTBA_FIX_319 = 1;
const token = process.env.TELEGRAM_BOT_TOKEN;
const channelID = process.env.TELEGRAM_BOT_CHANNEL_ID;
export const bot = global.bot || new TelegramBot(token, { polling: true });

if (process.env.NODE_ENV !== 'production') global.bot = bot;

bot.on('polling_error', (msg) => console.error(msg));

export const sendMessageToChannel = async (message) => {
  if (
    process.env.SEND_TELEGRAM &&
    (process.env.SEND_TELEGRAM === '1' ||
      Number(process.env.SEND_TELEGRAM) === 1)
  ) {
    try {
      bot.sendMessage(channelID, message).catch((err) => {
        console.error('Channel message not sent', err);
      });
    } catch (error) {
      console.error(error);
    }
  }
};

export const approvalBookingRequestMessageBuilder = (bookingRequest) => {
  const venueName = bookingRequest.venue;
  const { date } = bookingRequest;
  const { timeSlots } = bookingRequest;
  const { cca } = bookingRequest;

  const returnMessage = `[APPROVED]\nCCA: ${cca}\nVenue: ${venueName}\nDate: ${date}\nTimeslot(s): ${timeSlots}`;

  return returnMessage;
};

export const rejectBookingRequestMessageBuilder = (bookingRequest) => {
  const venueName = bookingRequest.venue;
  const { date } = bookingRequest;
  const { timeSlots } = bookingRequest;
  const { cca } = bookingRequest;

  const returnMessage = `[REJECTED]\nCCA: ${cca}\nVenue: ${venueName}\nDate: ${date}\nTimeslot(s): ${timeSlots}`;

  return returnMessage;
};
