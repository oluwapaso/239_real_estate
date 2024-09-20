import { AutomationService } from "@/_services/automation_service";
import { NextApiRequest, NextApiResponse } from "next";

const drip_service = new AutomationService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "PATCH"){

        const req_body = req.body;

        const params = {
            automation_id: req_body.automation_id,
            is_published: req_body.is_published,
        }
        
        const users = await drip_service.UpdatePublishstatus(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}