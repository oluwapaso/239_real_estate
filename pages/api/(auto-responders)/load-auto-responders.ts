import { MYSQLAutoResponderRepo } from "@/_repo/auto_responder";
import { MYSQLUserRepo } from "@/_repo/user_repo";
import { NextApiRequest, NextApiResponse } from "next";

const ar_repo = new MYSQLAutoResponderRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const users = await ar_repo.LoadAutoResponders();
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}