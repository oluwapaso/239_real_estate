import * as sgMail from '@sendgrid/mail';

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
