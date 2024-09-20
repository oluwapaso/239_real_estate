import twilio from 'twilio';

// Function to send an email
export async function send_SMS(account_sid: string, auth_token: string,  twillio_number: string, to_number: string,  body: string) {
    try {

        const client = twilio(account_sid, auth_token);
        const response = await client.messages.create({
            body: body,
            from: twillio_number,
            to: to_number,
        });

        console.log("Response", response)
        return 'SMS sent';
        
    } catch (error) {
        return 'Error sending sms:'+ error;
    }
}
