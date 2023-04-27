import {createTransport} from "nodemailer";

export const transporter = createTransport({
  port: 587, host: "smtp.office365.com", auth: {
    user: "",
    pass: "",
  },
});
