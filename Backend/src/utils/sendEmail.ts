import nodemailer from "nodemailer";


interface IEmailData {
  to: string;
  subject: string;
  html: string;
}


const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },

  });


export const sendEmail =
  async (
    data: IEmailData
  ) => {

    await transporter.sendMail({

      from:
        process.env.EMAIL_USER,

      to: data.to,

      subject: data.subject,

      html: data.html,

    });
  };