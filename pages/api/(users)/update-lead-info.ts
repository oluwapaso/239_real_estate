import { APIResponseProps, UpdateAgentParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import { UserService } from "@/_services/user_service";

const user_service = new UserService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200);
    
    }else if(req.method == "PATCH") {

        const response = await user_service.UpdateLeadInfo(req);
        if(response.success){

            resp.status(200).json(response);

        }else{
            console.log("response:", response)
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request", "success": false})
    
    }

}