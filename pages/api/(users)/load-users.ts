import { MYSQLUserRepo } from "@/_repo/user_repo";
import { LoadUsersParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const user_repo = new MYSQLUserRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params: LoadUsersParams = {
            paginated: req_body.paginated,
            search_type: req_body.search_type,
            lead_stage: req_body.lead_stage,
            keyword: req_body.keyword,
            page: req_body.page, 
            limit: req_body.limit
        }
        
        const users = await user_repo.LoadUsers(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}