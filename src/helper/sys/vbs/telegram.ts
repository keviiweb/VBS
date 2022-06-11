import TelegramBot from 'node-telegram-bot-api';
const token = process.env.TELEGRAM_BOT_TOKEN;
const channel_id = process.env.TELEGRAM_BOT_CHANNEL_ID;
export const bot = global.bot || new TelegramBot(token, { polling: true });

if (process.env.NODE_ENV !== 'production') global.bot = bot;

export const sendMessageToChannel = async (message: string) => {
  if (
    process.env.SEND_TELEGRAM &&
    (process.env.SEND_TELEGRAM == '1' || Number(process.env.SEND_TELEGRAM) == 1)
  ) {
    try {
      bot.sendMessage(channel_id, message).catch((err) => {
        console.log('Channel message not sent', err);
      });
    } catch (error) {
      console.log(error);
    }
  }
};

export const approvalBookingRequestMessageBuilder = (bookingRequest) => {
  const venueName = bookingRequest.venue;
  const date = bookingRequest.date;
  const timeSlots = bookingRequest.timeSlots;
  const cca = bookingRequest.cca;

  const returnMessage = `[APPROVED]\nCCA: ${cca}\nVenue: ${venueName}\nDate: ${date}\nTimeslot(s): ${timeSlots}`;
  return returnMessage;
};

export const rejectBookingRequestMessageBuilder = (bookingRequest) => {
  const venueName = bookingRequest.venue;
  const date = bookingRequest.date;
  const timeSlots = bookingRequest.timeSlots;
  const cca = bookingRequest.cca;

  const returnMessage = `[REJECTED]\nCCA: ${cca}\nVenue: ${venueName}\nDate: ${date}\nTimeslot(s): ${timeSlots}`;
  return returnMessage;
};
