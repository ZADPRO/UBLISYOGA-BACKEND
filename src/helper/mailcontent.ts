export function staffDetailSend(id: number, password: string) {
  const mail = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Ublis Yoga</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ff7f50; /* Coral color */
            padding: 20px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
        }
        .footer {
            padding: 10px;
            text-align: center;
            font-size: 0.9em;
            color: #555555;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #ff7f50; /* Coral color */
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>Welcome to Ublis Yoga!</h1>
    </div>
    <div class="content">
        <p>Dear User,</p>
        <p>Congratulations on joining us!</p>
        <p>Your username is: <strong>${id}</strong></p>
        <p>Your password is: <strong>${password}</strong></p>
        <p>Please complete all the documentation and personal data updates on our website by logging in using your username and password.</p>
        <a href="http://43.204.98.66/" class="button">Login Here</a>
    </div>
    <div class="footer">
        <p>Thank you,</p>
        <p>The Ublis Yoga Team</p>
    </div>
</div>

</body>
</html>`;

  return mail;
}

export function updateDataApproval(tableRows: any) {
  const mail = ` <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile Update Approval</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
        .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header { background-color: #ff7043; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .content p { font-size: 16px; line-height: 1.6; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        .table th { background-color: #ffab91; color: #333; }
        .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ublis Yogo</h1>
        </div>
        <div class="content">
          <p>Dear User,</p>
          <p>The Director has approved the recent changes you made to your profile data. Below are the details of the changes:</p>
          <table class="table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Old Data</th>
                <th>New Data</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p>If you have any questions regarding these changes, feel free to contact us.</p>
          <p>Best regards,<br>Director, Ublis Yogo</p>
        </div>
        <div class="footer">&copy; 2024 Ublis Yogo. All rights reserved.</div>
      </div>
    </body>
    </html>`;
  return mail;
}

export function updateDataRejection(tableRows: any) {
  const mail = ` <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profile Update Approval</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
          .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          .header { background-color: #ff7043; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; }
          .content p { font-size: 16px; line-height: 1.6; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
          .table th { background-color: #ffab91; color: #333; }
          .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ublis Yogo</h1>
          </div>
          <div class="content">
            <p>Dear User,</p>
            <p>The Director has Rejected the recent changes you made to your profile data. Below are the details of the changes:</p>
            <table class="table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Old Data</th>
                  <th>New Data</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <p>If you have any questions regarding these changes, feel free to contact us.</p>
            <p>Best regards,<br>Director, Ublis Yogo</p>
          </div>
          <div class="footer">&copy; 2024 Ublis Yogo. All rights reserved.</div>
        </div>
      </body>
      </html>`;
  return mail;
}

export function sendBirthdayWish(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`;
  const mail = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Happy Birthday Wishes</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
          .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); position: relative; overflow: hidden; }
          .header { background-color: #ff6b6b; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; position: relative; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; text-align: center; }
          .content p { font-size: 16px; line-height: 1.6; }
          .name { font-size: 20px; font-weight: bold; color: #ff7043; }
          .birthday-quote { margin-top: 20px; font-size: 18px; color: #555; font-style: italic; }
          .cake { margin: 20px auto; width: 100px; height: 100px; background: url('https://example.com/cake.png') no-repeat center; background-size: cover; }
          .confetti { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
          .confetti span { position: absolute; width: 8px; height: 8px; background-color: #ff7043; border-radius: 50%; animation: fall 5s infinite ease-in-out; }
          .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
          
          /* Keyframes for confetti */
          @keyframes fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
          
          /* Random confetti positions */
          ${Array.from(
            { length: 15 },
            (_, i) => `
            .confetti span:nth-child(${i + 1}) { left: ${
              Math.random() * 100
            }%; animation-delay: ${Math.random() * 2}s; }
          `
          ).join("")}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Happy Birthday from Ublis Yogo!</h1>
          </div>
          <div class="content">
            <p class="name">Dear ${name},</p>
            <p>Wishing you a very happy birthday filled with love, laughter, and wonderful memories!</p>
            <p class="birthday-quote">"May your special day be as amazing as you are and bring you everything you’ve been hoping for."</p>
            <div class="cake"></div>
            <p>We hope this year brings you endless joy and success in every way.</p>
            <p>Best wishes,<br>Ublis Yogo Team</p>
          </div>
          <div class="footer">&copy; 2024 Ublis Yogo. All rights reserved.</div>
          <div class="confetti">
            ${Array.from({ length: 15 }, () => `<span></span>`).join("")}
          </div>
        </div>
      </body>
      </html>`;
  return mail;
}

export function sendAnniversaryWish(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`;
  const mail = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Happy Anniversary Wishes</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
          .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); position: relative; overflow: hidden; }
          .header { background-color: #6b8e23; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; position: relative; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; text-align: center; }
          .content p { font-size: 16px; line-height: 1.6; }
          .name { font-size: 20px; font-weight: bold; color: #4682b4; }
          .anniversary-quote { margin-top: 20px; font-size: 18px; color: #555; font-style: italic; }
          .rings { margin: 20px auto; width: 100px; height: 100px; background: url('https://example.com/rings.png') no-repeat center; background-size: cover; }
          .confetti { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
          .confetti span { position: absolute; width: 8px; height: 8px; background-color: #4682b4; border-radius: 50%; animation: fall 5s infinite ease-in-out; }
          .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
          
          /* Keyframes for confetti */
          @keyframes fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
          
          /* Random confetti positions */
          ${Array.from(
            { length: 15 },
            (_, i) => `
            .confetti span:nth-child(${i + 1}) { left: ${
              Math.random() * 100
            }%; animation-delay: ${Math.random() * 2}s; }
          `
          ).join("")}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Happy Anniversary from Ublis Yoga!</h1>
          </div>
          <div class="content">
            <p class="name">Dear ${name},</p>
            <p>Wishing you both a wonderful wedding anniversary filled with love, laughter, and cherished memories!</p>
            <p class="anniversary-quote">"A successful marriage requires falling in love many times, always with the same person."</p>
            <div class="rings"></div>
            <p>May your bond grow even stronger as you continue this beautiful journey together.</p>
            <p>Best wishes,<br>Ublis Yoga Team</p>
          </div>
          <div class="footer">&copy; 2024 Ublis Yoga. All rights reserved.</div>
          <div class="confetti">
            ${Array.from({ length: 15 }, () => `<span></span>`).join("")}
          </div>
        </div>
      </body>
      </html>`;
  return mail;
}

export function sendTrialApprovalMail(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`;
  const mail = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #fff9f3; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); position: relative; overflow: hidden; }
          .header { background-color: #ff8c00; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; text-align: center; }
          .content p { font-size: 16px; line-height: 1.6; }
          .name { font-size: 20px; font-weight: bold; color: #ff4500; }
          .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
          .button { display: inline-block; margin: 20px 0; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #ff4500; text-decoration: none; border-radius: 4px; }
          .button:hover { background-color: #e04a00; }
          .confetti { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
          .confetti span { position: absolute; width: 8px; height: 8px; background-color: #ff8c00; border-radius: 50%; animation: fall 5s infinite ease-in-out; }

          @keyframes fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }

          ${Array.from(
            { length: 15 },
            (_, i) => `
            .confetti span:nth-child(${i + 1}) { left: ${
              Math.random() * 100
            }%; animation-delay: ${Math.random() * 2}s; }
          `
          ).join("")}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Congratulations! Your Application is Approved</h1>
          </div>
          <div class="content">
            <p class="name">Dear ${name},</p>
            <p>We are delighted to inform you that your application has been successfully submitted and approved by the Ublis Yoga Private Limited team.</p>
            <p>Now, you can proceed to make the payment and continue your classes with us.</p>
            <a href="http://43.204.98.66/" class="button">Make a Payment</a>
            <p>We are excited to have you with us and look forward to supporting your journey towards a healthier, balanced life.</p>
            <p>Best regards,<br>Ublis Yoga Team</p>
          </div>
          <div class="footer">&copy; 2024 Ublis Yoga Private Limited. All rights reserved.</div>
          <div class="confetti">
            ${Array.from({ length: 15 }, () => `<span></span>`).join("")}
          </div>
        </div>
      </body>
      </html>`;
  return mail;
}

export function sendOtpTemplate(clientName: string, otp: string) {
  const mail = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
        .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header { background-color: #ff7043; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .content p { font-size: 16px; line-height: 1.6; }
        .otp-box { font-size: 24px; font-weight: bold; text-align: center; padding: 10px; margin: 20px 0; background-color: #ffe0b2; border: 1px dashed #ff7043; border-radius: 8px; }
        .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ublis Yogo</h1>
        </div>
        <div class="content">
          <p>Dear ${clientName},</p>
          <p>We have received a request to verify your identity. Please use the following OTP to complete the process:</p>
          <div class="otp-box">${otp}</div>
          <p>Note: This OTP is valid for only **1 minute**. Please ensure to use it promptly.</p>
          <p>If you did not initiate this request, please contact us immediately.</p>
          <p>Best regards,<br>Director, Ublis Yogo</p>
        </div>
        <div class="footer">&copy; 2024 Ublis Yogo. All rights reserved.</div>
      </div>
    </body>
    </html>`;
  return mail;
}

export function welcomeVideoMail(
  firstName: string,
  lastName: string,
  videoLink: string
) {
  const mail = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Ublis Yoga</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ff7f50; /* Coral color */
            padding: 20px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
        }
        .footer {
            padding: 10px;
            text-align: center;
            font-size: 0.9em;
            color: #555555;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #ff7f50; /* Coral color */
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>Welcome to Ublis Yoga!</h1>
    </div>
    <div class="content">
        <p>Dear ${firstName} ${lastName},</p>
        <p>We are excited to welcome you to your first yoga class at Ublis Yoga!</p>
        <p>Before your class begins, it is mandatory to watch the introduction video provided in the link below:</p>
        <a href="${videoLink}" class="button">Watch the Video</a>
        <p><strong>Important:</strong> This link is valid for <strong>2 hours</strong> from the moment you click on it. Ensure you watch the video within this time frame.</p>
        <p>Watching this video will help you prepare for your first session and understand the guidelines better.</p>
    </div>
    <div class="footer">
        <p>Thank you,</p>
        <p>The Ublis Yoga Team</p>
    </div>
</div>

</body>
</html>`;

  return mail;
}

export function sendRegistrationConfirmation(
  firstName: string,
  lastName: string
) {
  const name = `${firstName} ${lastName}`;
  const mail = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Successful</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
          .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); position: relative; overflow: hidden; }
          .header { background-color: #4CAF50; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; position: relative; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; text-align: center; }
          .content p { font-size: 16px; line-height: 1.6; }
          .name { font-size: 20px; font-weight: bold; color: #388E3C; }
          .success-message { margin-top: 20px; font-size: 18px; color: #555; font-weight: bold; }
          .checkmark { margin: 20px auto; width: 80px; height: 80px; background: url('https://example.com/checkmark.png') no-repeat center; background-size: cover; }
          .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Successful!</h1>
          </div>
          <div class="content">
            <p class="name">Dear ${name},</p>
            <p>Thank you for registering with us! Your registration has been successfully submitted.</p>
            <p class="success-message">Our team will contact you as soon as possible.</p>
            <div class="checkmark"></div>
            <p>We appreciate your interest and look forward to connecting with you.</p>
            <p>Best regards,<br>Ublis Yogo Team</p>
          </div>
          <div class="footer">&copy; 2024 Ublis Yogo. All rights reserved.</div>
        </div>
      </body>
      </html>`;
  return mail;
}
