import { CommunityService } from "@/_services/community_service";
import { ServicesService } from "@/_services/services_service";
import { NextApiRequest, NextApiResponse } from "next"

const srvc_service = new ServicesService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const response = await srvc_service.DeleteService(req);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
