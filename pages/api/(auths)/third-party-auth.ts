import { MYSQLAgentsRepo } from "@/_repo/agents_repo";
import { MYSQLUserRepo } from "@/_repo/user_repo";
import { UserService } from "@/_services/user_service";
import { AdminLoginParams, UserAuthParams, UserLoginParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const userService = new UserService();
const userRepo = new MYSQLUserRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body
        const email = req_body.email
        const name = req_body.name

        const params: UserAuthParams = {
            email: email, 
            name: name
        }

        const user = await userRepo.UserAuthLogin(params);
        if(user.success){
            const first_name = name.split(" ")[0];
            const last_name = name.split(" ")[1];
            //userService.AddToSalesForce(email, first_name, last_name);
        }
        resp.status(200).json(user);

    }else{
        resp.status(405).end()
    }

}