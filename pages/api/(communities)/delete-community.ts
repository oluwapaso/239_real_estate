import { CommunityService } from "@/_services/community_service";
import { NextApiRequest, NextApiResponse } from "next"

const comm_service = new CommunityService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const response = await comm_service.DeleteCommunity(req);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
