import { SMS_Service } from "@/_services/sms_service";
import { NextApiRequest, NextApiResponse } from "next";

const sms_service = new SMS_Service();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const send_mail = await sms_service.SendBatchSMS(req);
        resp.status(200).json(send_mail);

    }else{
        resp.status(405).end()
    }

}