import { APIResponseProps, UpdateAgentParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import { AgentService } from "@/_services/agent_service";
import { MYSQLAgentsRepo } from "@/_repo/agents_repo";

const agent_service = new AgentService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "PATCH") {
        
        const req_body = req.body

        const response = await agent_service.UpdateAgentInfo(req_body as UpdateAgentParams) 
        if(response.success){

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":"Invalid account info provided.", "success": false})
        }
    
    }else if(req.method == "DELETE") {
        
        const req_body = req.body
        const agent_id = req_body.agent_id
        let dp_image = req_body.dp_image

        const response = await agent_service.DeleteAgentInfo(agent_id);
        if(response.success){

            const agent_repo = new MYSQLAgentsRepo();
            if(dp_image && dp_image !=""){
                dp_image = dp_image.replace("/images/","")
                await agent_repo.DeleteOldDP({old_dp: dp_image});
            }

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":"Invalid account info provided.", "success": false})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request", "success": false})
    
    }

}