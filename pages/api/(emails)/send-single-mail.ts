import { MailService } from "@/_services/mail_service";
import { SendMailParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const mail_service = new MailService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const params: SendMailParams = {
            user_id: req.body.user_id,
            mailer: req.body.mailer,
            from_email: req.body.from_email,
            to_email: req.body.to_email,
            subject: req.body.subject,
            body: req.body.mail_body,
            message_type: req.body.message_type
        } 

        const send_mail = await mail_service.SendMail(params);
        resp.status(200).json(send_mail);

    }else{
        resp.status(405).end()
    }

}