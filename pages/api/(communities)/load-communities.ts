import { MYSQLCommunityRepo } from "@/_repo/community_repo";
import { LoadCommunitiesParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const comm_repo = new MYSQLCommunityRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const page = req_body.page
        const post_type = req_body.post_type
        const city_slug = req_body.city_slug
        const limit = req_body.limit
        const paginated = req_body.paginated;

        const params: LoadCommunitiesParams = {
            paginated: paginated,
            post_type: post_type,
            city_slug: city_slug,
            page: page, 
            limit: limit
        }
        
        const commuities = await comm_repo.LoadCommunities(params)
        resp.status(200).json(commuities);

    }else{
        resp.status(405).end()
    }

}