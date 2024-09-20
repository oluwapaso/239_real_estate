import { MYSQLAutomationRepo } from "@/_repo/automation_repo";
import { NextApiRequest, NextApiResponse } from "next";

const drip_repo = new MYSQLAutomationRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params = {
            paginated: req_body.paginated,
            page: req_body.page,
            search_type: req_body.search_type,
            limit: req_body.limit
        }
        
        const users = await drip_repo.LoadAutomations(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}