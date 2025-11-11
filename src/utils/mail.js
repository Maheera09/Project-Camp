import Mailgen from "mailgen"; //we are using this module for generating an e-mail template. Not sending it.
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Mailgen",
      link: "https://taskmanagerlink.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHTML = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    text: emailTextual,
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    console.error("Email service failed", err);
  }
};

const emailVerificationMailgenContent = (username, verificationURL) => {
  return {
    body: {
      name: username,
      intro: "Welcome to ProjectCamp! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email, please click on the following button:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your e-mail:",
          link: verificationURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const forgorPasswordMailgenContent = (username, passwordResetURL) => {
  return {
    body: {
      name: username,
      intro: "Reset Password",
      action: {
        instructions:
          "To reset password, please click on the following button:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset Password:",
          link: passwordResetURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgorPasswordMailgenContent,
  sendEmail,
};
