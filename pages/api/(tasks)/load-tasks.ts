import { MYSQLTaskRepo } from "@/_repo/task_repo";
import { LoadUserTasksParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const task_repo = new MYSQLTaskRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params: LoadUserTasksParams = {
            user_id: req_body.user_id,
        }
        
        const users = await task_repo.LoadUserTasks(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}