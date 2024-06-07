import { MYSQLAgentsRepo } from "@/_repo/agents_repo";
import { NextApiRequest, NextApiResponse } from "next";

const agentsRepo = new MYSQLAgentsRepo()
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const agent_id = req_body.agent_id

        const comp_info = await agentsRepo.GetSingleAgentInfo(agent_id)
        resp.status(200).json(comp_info);

    }else{
        resp.status(405).end()
    }

}