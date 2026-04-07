import twilio from 'twilio';

let client;

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
      throw new Error(
        'Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in environment'
      );
    }

    client = twilio(sid, token);
  }
  return client;
}

/**
 * Send an MMS message with a photo attached.
 * @param {string} to       - E.164 phone number, e.g. "+15551234567"
 * @param {string} imageUrl - Publicly accessible URL of the photo
 * @param {string} body     - Text body of the message
 * @returns {Promise<string>} Twilio message SID
 */
export async function sendMMS(to, imageUrl, body) {
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    throw new Error('Missing TWILIO_PHONE_NUMBER in environment');
  }

  const message = await getClient().messages.create({
    from,
    to,
    body,
    mediaUrl: [imageUrl],
  });

  return message.sid;
}

/**
 * Build the SMS body from the SMS_MESSAGE template.
 */
export function buildSmsBody() {
  const eventName = process.env.EVENT_NAME ?? "Pop DeKegg's Tavern";
  const template =
    process.env.SMS_MESSAGE ?? "Here's your photo from {EVENT_NAME}! 🎉";
  return template.replace('{EVENT_NAME}', eventName);
}
