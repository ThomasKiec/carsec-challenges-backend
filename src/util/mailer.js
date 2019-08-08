/* eslint-disable sort-keys */
/* eslint-disable max-len */

import { createTransport } from 'nodemailer'

export async function sendSignupEmail(email, password) {
  const transporter = createTransport({
    auth: {
      pass: process.env.EMAIL_PASSWORD,
      user: process.env.EMAIL_USER,
    },
    service: 'Gmail',
  })

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    subject: 'Carsec Challenges signup',
    to: email,
    html: `<html>
            <head>
              <title></title>
              <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
            </head>
            <body aria-readonly="false"><span style="font-family:arial,helvetica,sans-serif">Hello ,<br />
            <br />
            <br />
            You have been registered as a user by the administrator on the CARSEC challenges website.<br />
            <br />
            This email contains your username and password to log in. Please change your password the first time you log in.<br />
            <br />
            User name: ${email} &nbsp;<br />
            Password: ${password} &nbsp;<br />
            <br />
            <br />
            Please do not reply to this message as it was generated automatically and is for your information only.</span></body>
            </html>
            `,
  })

  return info
}

export async function sendPasswordResetEmail(email, password) {
  const transporter = createTransport({
    auth: {
      pass: process.env.EMAIL_PASSWORD,
      user: process.env.EMAIL_USER,
    },
    service: 'gmail',
  })

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    subject: 'Carsec Challenges password reset',
    to: email,
    html: `<html>
            <head>
              <title></title>
              <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
            </head>
            <body aria-readonly="false"><span style="font-family:arial,helvetica,sans-serif">Hello ,<br />
            <br />
            <br />
            Your password has been reset by the administrator on the CARSEC challenges website.<br />
            <br />
            This email contains your username and password to log in. Please change your password the first time you log in.<br />
            <br />
            User name: ${email} &nbsp;<br />
            Password: ${password} &nbsp;<br />
            <br />
            <br />
            Please do not reply to this message as it was generated automatically and is for your information only.</span></body>
            </html>
            `,
  })

  return info
}
