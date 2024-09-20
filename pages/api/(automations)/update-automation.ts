import { AutomationService } from "@/_services/automation_service";
import { NextApiRequest, NextApiResponse } from "next";

const autom_service = new AutomationService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "PATCH"){
        
        const up_resp = await autom_service.UpdateAutomation(req);
        resp.status(200).json(up_resp);

    }else{
        resp.status(405).end()
    }

}