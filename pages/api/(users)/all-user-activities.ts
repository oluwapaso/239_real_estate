import { MYSQLUserRepo } from "@/_repo/user_repo";
import { LoadUsersActivities, LoadUsersParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const user_repo = new MYSQLUserRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params: LoadUsersActivities = {
            user_id: req_body.user_id,
            type: req_body.type,
            skip: req_body.skip,
            limit: req_body.limit,
        }
        
        const users = await user_repo.LoadUsersActivities(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}