import { MYSQLAgentsRepo } from "@/_repo/agents_repo";
import { AdminLoginParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const agentsRepo = new MYSQLAgentsRepo()
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const username = req_body.username
        const password = req_body.password

        const params: AdminLoginParams = {
            username: username, 
            password: password
        }

        const agents = await agentsRepo.AdminLogin(params)
        resp.status(200).json(agents);

    }else{
        resp.status(405).end()
    }

}