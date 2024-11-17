const nodemailer = require('nodemailer');
require('dotenv').config();
const senderEmail = process.env.SENDER;
const senderPass = process.env.EMAIL_PASS;

function sendRoomCodeAndPassword(emailIDs, roomCode, password, title) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                // user: 'amk.bhk@gmail.com',
                user: senderEmail,
                pass: senderPass
                // pass: 'usqt mwhe uqed kuyl'
            }
        });

        const mailOptions = {
            // from: 'amk.bhk@gmail.com',
            from:  senderEmail,
            to: emailIDs,
            subject: 'Project Room Code and Password',
            text: `
            Join my project room!
            title: ${title},
            Room Code: ${roomCode},
            Password: ${password}
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                reject('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
                resolve({ success: true });
            }
        });
    });
}



// Function to send deletion notifications to a list of email addresses
function sendDeletionNotifications(emailIDs) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: senderEmail,
                pass: senderPass
            }
        });

        const mailOptions = {
            from: senderEmail,
            to: emailIDs,
            subject: 'Project Room Deleted',
            text: `
            We wanted to inform you that the project room you were part of has been deleted. 
            If you have any questions, please contact the project administrator.
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                reject('Error sending deletion notification emails');
            } else {
                console.log('Deletion notification emails sent: ' + info.response);
                resolve({ success: true });
            }
        });
    });
}


module.exports = { sendRoomCodeAndPassword, sendDeletionNotifications };
