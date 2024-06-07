import { MYSQLAgentsRepo } from "@/_repo/agents_repo";
import { MYSQLUserRepo } from "@/_repo/user_repo";
import { AdminLoginParams, UserLoginParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const userRepo = new MYSQLUserRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const email = req_body.email
        const password = req_body.password

        const params: UserLoginParams = {
            email: email, 
            password: password
        }

        const agents = await userRepo.UserLogin(params);
        resp.status(200).json(agents);

    }else{
        resp.status(405).end()
    }

}