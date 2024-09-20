import { AutomationService } from "@/_services/automation_service";
import { NextApiRequest, NextApiResponse } from "next";

const drip_service = new AutomationService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params = {
            automation_name: req_body.automation_name,
        }
        
        const users = await drip_service.AddNewDrip(params);
        resp.status(200).json(users);

    } else if(req.method == "PATCH"){

        const req_body = req.body;

        const params = {
            automation_id: req_body.automation_id,
            automation_name: req_body.automation_name,
        }
        
        const users = await drip_service.UpdateDripName(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}