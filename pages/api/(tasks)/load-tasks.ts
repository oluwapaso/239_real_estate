import { MYSQLTaskRepo } from "@/_repo/task_repo";
import { LoadTasksParams, LoadUserTasksParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const task_repo = new MYSQLTaskRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;
        const search_type = req_body.search_type;
        let tasks;

        if(search_type == "Tasks Lists"){
            const params: LoadTasksParams = {
                paginated: req_body.paginated,
                task_type: req_body.task_type,
                page: req_body.page, 
                limit: req_body.limit
            }
            tasks = await task_repo.LoadTasks(params);
        }else if(search_type == "User Tasks"){

            const params: LoadUserTasksParams = {
                user_id: req_body.user_id,
            }
            tasks = await task_repo.LoadUserTasks(params);
        }

        resp.status(200).json(tasks);

    }else{
        resp.status(405).end()
    }

}