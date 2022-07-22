import { checkerString } from '@constants/sys/helper';
import TelegramBot from 'node-telegram-bot-api';
import { BookingRequest } from 'types/vbs/bookingReq';

const token = process.env.TELEGRAM_BOT_TOKEN;
const channel_id = process.env.TELEGRAM_BOT_CHANNEL_ID;

/**
 * Sends a message to the telegram channel
 *
 * @param message Message to be sent
 */
export const sendMessageToChannel = async (message: string): Promise<void> => {
  if (
    process.env.SEND_TELEGRAM &&
    (process.env.SEND_TELEGRAM === '1' ||
      Number(process.env.SEND_TELEGRAM) === 1)
  ) {
    try {
      if (
        token !== undefined &&
        channel_id !== undefined &&
        checkerString(message)
      ) {
        const bot = new TelegramBot(token, { polling: true });
        if (bot.isPolling() && checkerString(message)) {
          bot.sendMessage(channel_id, message).catch((err) => {
            console.error('Channel message not sent', err);
          });
          await bot.stopPolling();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

/**
 * Formats the string according to a specified format
 *
 * For approved requests
 *
 * @param bookingRequest
 * @returns A formatted string
 */
export const approvalBookingRequestMessageBuilder = (
  bookingRequest: BookingRequest,
): string => {
  let returnMessage: string = '';
  if (bookingRequest.dateStr !== undefined) {
    try {
      const venueName: string = bookingRequest.venue;
      const date: string = bookingRequest.dateStr;
      const timeSlots: string = bookingRequest.timeSlots;
      const cca: string = bookingRequest.cca;
  
      if (
        checkerString(venueName) &&
        checkerString(date) &&
        checkerString(timeSlots) &&
        checkerString(cca)
      ) {
        returnMessage = `[APPROVED]\nCCA: ${cca}\nVenue: ${venueName}\nDate: ${date}\nTimeslot(s): ${timeSlots}`;
      }
    } catch (error) {
      console.error(error);
    }
  }

  return returnMessage;
};

/**
 * Formats the string according to a specified format
 *
 * For rejected requests
 *
 * @param bookingRequest
 * @returns A formatted string
 */
export const rejectBookingRequestMessageBuilder = (
  bookingRequest: BookingRequest,
): string => {
  let returnMessage: string = '';
  try {
    if (
      bookingRequest.dateStr !== undefined &&
      bookingRequest.reason !== undefined
    ) {
      const venueName: string = bookingRequest.venue;
      const date: string = bookingRequest.dateStr;
      const timeSlots: string = bookingRequest.timeSlots;
      const cca: string = bookingRequest.cca;
      const reason: string = bookingRequest.reason;
  
      if (
        checkerString(venueName) &&
        checkerString(date) &&
        checkerString(timeSlots) &&
        checkerString(cca)
      ) {
        returnMessage = `[REJECTED]\nCCA: ${cca}\nVenue: ${venueName}\nDate: ${date}\nTimeslot(s): ${timeSlots}\nReason: ${reason}`;
      }
    }
  } catch (error) {
    console.error(error);
  }

  return returnMessage;
};
