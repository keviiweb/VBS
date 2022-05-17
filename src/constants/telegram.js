process.env.NTBA_FIX_319 = 1;
import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
const channel_id = process.env.TELEGRAM_BOT_CHANNEL_ID;
export const bot = global.bot || new TelegramBot(token, { polling: true });

if (process.env.NODE_ENV !== "production") global.bot = bot;

export const sendMessageToChannel = async (message) => {
  bot.sendMessage(channel_id, message).catch((err) => {
    console.log("Channel message not sent", err);
  });
};

export const approvalBookingRequestMessageBuilder = (bookingRequest) => {
  const venueName = bookingRequest.venue;
  const date = bookingRequest.date;
  const timeSlots = bookingRequest.timeSlots;
  const cca = bookingRequest.cca;
  const email = bookingRequest.email;

  let hide = email.split("@")[0].length - 5; //<-- number of characters to hide
  var r = new RegExp(".{" + hide + "}@", "g");
  const masked_email = email.replace(r, "***@");

  const returnMessage = `[APPROVED]\nEmail: ${masked_email}\ncca: ${cca}\nvenueName: ${venueName}\ndate: ${date}\ntimeSlots: ${timeSlots}`;

  return returnMessage;
};

export const rejectBookingRequestMessageBuilder = (bookingRequest) => {
  const venueName = bookingRequest.venue;
  const date = bookingRequest.date;
  const timeSlots = bookingRequest.timeSlots;
  const cca = bookingRequest.cca;
  const email = bookingRequest.email;

  let hide = email.split("@")[0].length - 5; //<-- number of characters to hide
  var r = new RegExp(".{" + hide + "}@", "g");
  const masked_email = email.replace(r, "***@");

  const returnMessage = `[REJECTED]\nEmail: ${masked_email}\ncca: ${cca}\nvenueName: ${venueName}\ndate: ${date}\ntimeSlots: ${timeSlots}`;

  return returnMessage;
};
