import nodemailer from 'nodemailer';
import { logger } from './logger';
import { isHttpCode } from './httpTools';

/**
 * @function sendEmailText
 * @summary Send a text email
 * @params {string} emailTo
 * @params {string} subject
 * @params {string | object} body
 * @returns {object} sendEmailTextResponse
 * @throws {object} sendEmailErroCodeResults
 */
const sendEmailText = async function sendEmailText(emailTo: string, subject: string, body: string | object): Promise<SendEmailTextResponse | CodeMessageError> {
  // Set default log level for file and console transports
  const emailUsername = process.env.EMAILUSERNAME || 'error';
  const emailPassword = process.env.EMAILPASSWORD || 'debug';

  try {
    const emailAccount = {
      'user': emailUsername,
      'pass': emailPassword
    };

    const transporter = nodemailer.createTransport({
      name: 'aalzubidy.com',
      host: 'server204.web-hosting.com',
      port: 465,
      secure: true,
      auth: {
        user: emailAccount.user,
        pass: emailAccount.pass,
      },
      logger: false
    });

    const info = await transporter.sendMail({
      from: `"Ahmed Camera " <${emailAccount.user}>`,
      to: emailTo,
      subject,
      text: body
    });

    logger.debug({ label: 'Email sent', emailFrom: emailAccount.user, emailTo: emailTo, messageId: info.messageId });

    return { message: 'Email sent', emailFrom: emailAccount.user, emailTo: emailTo, messageId: info.messageId };
  } catch (error: any) {
    logger.error(error);
    if (error.code && isHttpCode(error.code) && error.message) throw error;
    throw { code: 500, message: 'Could not send email' };
  }
};

export { sendEmailText };
