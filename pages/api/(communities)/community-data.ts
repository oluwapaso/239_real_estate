import { MYSQLCommunityRepo } from "@/_repo/community_repo";
import { NextApiRequest, NextApiResponse } from "next";

const comm_repo = new MYSQLCommunityRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const comm_info = await comm_repo.LoadCommunityData(req.body.community);
        resp.status(200).json(comm_info);

    }else{
        resp.status(405).end()
    }

}