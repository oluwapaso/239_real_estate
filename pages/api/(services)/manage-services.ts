import { CommunityService } from "@/_services/community_service";
import { ServicesService } from "@/_services/services_service";
import { NextApiRequest, NextApiResponse } from "next"

//This is important for formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const srvc_service = new ServicesService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const response = await srvc_service.AddNewService(req);
        resp.status(200).json(response);

    } else if(req.method == "PATCH"){
        
        const response = await srvc_service.UpdateService(req);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
