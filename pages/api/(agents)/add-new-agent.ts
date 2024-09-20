import { AgentService } from "@/_services/agent_service";
import { APIResponseProps, AddAgentParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const agent_service = new AgentService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body

        const response = await agent_service.AddNewAgent(req_body as AddAgentParams) 
        if(response.success){

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request", "success": false})
    
    }

}