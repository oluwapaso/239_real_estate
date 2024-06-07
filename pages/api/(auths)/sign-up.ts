 import { UserService } from "@/_services/user_service"; 
import { NextApiRequest, NextApiResponse } from "next";

const userService = new UserService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const agents = await userService.RegiterAccount(req);
        resp.status(200).json(agents);

    }else{
        resp.status(405).end()
    }

}