import { MYSQLUserRepo } from "@/_repo/user_repo";
import { NextApiRequest, NextApiResponse } from "next";

const user_repo = new MYSQLUserRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const users = await user_repo.LoadSingleUser(req.body.user_id);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}