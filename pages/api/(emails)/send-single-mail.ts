import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { MailService } from "@/_services/mail_service";
import { SendMailParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const mail_service = new MailService();
const temp_repo = new MYSQLTemplateRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const replaced_body = await temp_repo.ReplaceTemplateCode(req.body.mail_body, "Email", req.body.user_id);
        const replaced_subject = await temp_repo.ReplaceTemplateCode(req.body.subject, "Email", req.body.user_id);

        const params: SendMailParams = {
            user_id: req.body.user_id,
            mailer: req.body.mailer,
            from_email: req.body.from_email,
            to_email: req.body.to_email,
            subject: replaced_subject,
            body: replaced_body,
            message_type: req.body.message_type
        } 

        const send_mail = await mail_service.SendMail(params);
        resp.status(200).json(send_mail);

    }else{
        resp.status(405).end()
    }

}