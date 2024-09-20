import { TaskService } from "@/_services/task_service";
import { APIResponseProps, AddTaskParams, MarkMultiTaskAsDoneParams, MarkTaskAsDoneParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next"

const task_service = new TaskService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const req_body = req.body;
        const payload: AddTaskParams = {
            user_id: req_body.user_id,
            title: req_body.title,
            date: req_body.date,
            time: req_body.time,
        }

        const response = await task_service.AddNewTask(payload);
        resp.status(200).json(response);

    } else if(req.method == "PATCH"){
        
        const req_body = req.body;
        const type = req_body.type;
        let response: APIResponseProps | null = null ; 

        if(type == "Single"){

            const payload: MarkTaskAsDoneParams = {
                task_id: req_body.task_id
            }
            
            response = await task_service.MarkTaskAsDone(payload);

        }else if(type == "Multiple"){
            
            const payload: MarkMultiTaskAsDoneParams = {
                task_ids: req_body.task_ids
            }
            
            response = await task_service.MarkMultiTaskAsDone(payload);

        }

        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
