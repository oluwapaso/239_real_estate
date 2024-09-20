import { MYSQLAutomationRepo } from "@/_repo/automation_repo";
import { NextApiRequest, NextApiResponse } from "next";

const drip_repo = new MYSQLAutomationRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const automations = await drip_repo.LoadUserAutomations(req);
        resp.status(200).json(automations);

    }else{
        resp.status(405).end()
    }

}