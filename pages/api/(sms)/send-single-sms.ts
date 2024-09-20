import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { SMS_Service } from "@/_services/sms_service";
import { Send_SMS_Params } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const sms_service = new SMS_Service();
const temp_repo = new MYSQLTemplateRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const replaced_body = await temp_repo.ReplaceTemplateCode(req.body.sms_body, "SMS", req.body.user_id);

        const params: Send_SMS_Params = {
            user_id: req.body.user_id,
            to_number: req.body.to_number,
            body: replaced_body,
            message_type: req.body.message_type
        } 

        const send_mail = await sms_service.SendSMS(params);
        resp.status(200).json(send_mail);

    }else{
        resp.status(405).end()
    }

}