import { MailService } from "@/_services/mail_service";
import { NextApiRequest, NextApiResponse } from "next";

const mail_service = new MailService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const send_mail = await mail_service.SendBatchEmail(req);
        resp.status(200).json(send_mail);

    }else{
        resp.status(405).end()
    }

}