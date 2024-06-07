import * as sgMail from '@sendgrid/mail';
import { Helpers } from './helpers';

//const helper = new Helpers();

// Set the API key
// async function setupSendGrid() {
//     const api_info_prms = helper.FetchAPIInfo();
//     const api_info = await api_info_prms

//     if (api_info.success && api_info.data) {
//         console.log("api_info.data.sendgrid_key:", api_info.data.sendgrid_key )
//         sgMail.setApiKey(api_info.data.sendgrid_key as string);
//     }else {
//     console.error('SendGrid API key not found in database');
//   }
// }

//setupSendGrid();

// Function to send an email
export async function sendEmail(from: string, to: string, subject: string, html: string, sendgrid_key: string) {
    try {

        sgMail.setApiKey(sendgrid_key as string);
        const response = await sgMail.send({to, from, subject, html});
        return 'Email sent';
    } catch (error) {
        return 'Error sending email:'+ error;
    }
}
