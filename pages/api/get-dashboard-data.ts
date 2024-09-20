import { MYSQLSystemRepo } from "@/_repo/system_repo";
import { NextApiRequest, NextApiResponse } from "next";

const agentsRepo = new MYSQLSystemRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const agents = await agentsRepo.GetDashboardData()
        resp.status(200).json(agents);

    }else{
        resp.status(405).end()
    }

}