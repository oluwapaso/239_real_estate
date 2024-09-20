import { MYSQLAutomationRepo } from "@/_repo/automation_repo";
import { APIResponseProps, AutomationStep } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const drip_repo = new MYSQLAutomationRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params = {
            automation_id: req_body.automation_id,
            step_id: req_body.step_id
        }
        
        const steps_details: AutomationStep | APIResponseProps = await drip_repo.LoadSingleAutomationStep(params);
        if("success" in steps_details){ //it's APIResponseProps i.e error
            resp.status(400).json(steps_details);
        }else if("step_id" in steps_details){
            resp.status(200).json(steps_details);
        }

    }else{
        resp.status(405).end()
    }

}