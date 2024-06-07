import { AutoResponderService } from "@/_services/auto_responder_service";
import { UpdateAutoResponderParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next"

const ar_service = new AutoResponderService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "PATCH"){
        
        const req_body = req.body;
        const payload: UpdateAutoResponderParams = {
            type: req_body.type,
            name: req_body.name,
            send_ar: req_body.send_ar,
            email_subject: req_body.email_subject,
            email_body: req_body.email_body,
            sms_body: req_body.sms_body,
            auto_responder_id: req_body.auto_responder_id,
        }

        const response = await ar_service.UpdateAutoResponderInfo(payload);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
