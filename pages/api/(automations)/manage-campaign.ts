import { AutomationService } from "@/_services/automation_service";
import { NextApiRequest, NextApiResponse } from "next";

const drip_service = new AutomationService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const users = await drip_service.StartCampaign(req);
        resp.status(200).json(users);

    } else if(req.method == "PATCH"){ 
        
        const users = await drip_service.UpdateCampaignStatus(req);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}