import { Helpers } from "@/_lib/helpers";
import { MYSQLTaskRepo } from "@/_repo/task_repo";
import { APIResponseProps, AddTaskParams, MarkMultiTaskAsDoneParams, MarkTaskAsDoneParams } from "@/components/types";

export class TaskService {

    task_repo = new MYSQLTaskRepo();
    helpers = new Helpers();

    public async AddNewTask(params: AddTaskParams):Promise<APIResponseProps>{

        const user_id = params.user_id;
        const title = params.title;
        const date = params.date;
        const time = params.time;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!user_id || user_id == ""){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        if(!date || !time || !title){
            default_resp.message = "All fields are required."
            return default_resp as APIResponseProps
        }

        const [is_added, task_id] = await this.task_repo.AddNewTask(params);
        default_resp.success = is_added;
        
        if(is_added){
            default_resp.message = "Task succesfully added";
            default_resp.data = {task_id:task_id};
        }else{
            default_resp.message = "Unable to add new task";
        }
        return default_resp;

    }

    public async MarkTaskAsDone(params: MarkTaskAsDoneParams):Promise<APIResponseProps>{

        const task_id = params.task_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!task_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        console.log("params:", params)
        const is_updated = await this.task_repo.MarkTaskAsDone(params);
        default_resp.success = is_updated;
        
        if(is_updated){
            default_resp.message = "Task succesfully updated";
        }else{
            default_resp.message = "Unable to update task status";
        }
        return default_resp;

    }

    public async MarkMultiTaskAsDone(params: MarkMultiTaskAsDoneParams):Promise<APIResponseProps>{

        const task_ids = params.task_ids;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!task_ids || task_ids.length < 1){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        let implode_ids = task_ids.join("', '");
        implode_ids = `'${implode_ids}'`;

        console.log("implode_ids:", implode_ids)
        const is_updated = await this.task_repo.MarkMultiTaskAsDone(implode_ids);
        default_resp.success = is_updated;
        
        if(is_updated){
            default_resp.message = "Task succesfully updated";
        }else{
            default_resp.message = "Unable to update task status";
        }
        return default_resp;

    }

}
