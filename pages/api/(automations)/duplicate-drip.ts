import { AutomationService } from "@/_services/automation_service";
import { NextApiRequest, NextApiResponse } from "next";

const drip_service = new AutomationService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params = {
            automation_id: req_body.automation_id,
            type: req_body.type,
        }
        
        const users = await drip_service.DuplicateDrips(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}