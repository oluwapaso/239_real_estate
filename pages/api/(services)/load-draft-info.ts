import { CommunityService } from "@/_services/community_service";
import { ServicesService } from "@/_services/services_service";
import { NextApiRequest, NextApiResponse } from "next";

const srvc_service = new ServicesService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const comp_info = await srvc_service.LoadDraftInfo(req)
        resp.status(200).json(comp_info);

    }else{
        resp.status(405).end()
    }

}