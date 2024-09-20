import { MYSQLAutomationRepo } from "@/_repo/automation_repo";
import { APIResponseProps } from "@/components/types";
import { NextApiRequest } from "next";

 
export class AutomationService {
    
    autom_repo = new MYSQLAutomationRepo();

    public async AddNewDrip(params: any):Promise<APIResponseProps>{

        const automation_name = params.automation_name;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!automation_name){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        const resp = await this.autom_repo.AddNewDrip(params)
        return resp;

    }

    public async DuplicateDrips(params: any):Promise<APIResponseProps>{

        const automation_id = params.automation_id;
        const type = params.type;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!automation_id || !type){
            default_resp.message = "fatal error."
            return default_resp as APIResponseProps
        }

        const resp = await this.autom_repo.DuplicateDrips(params)
        return resp;

    }

    public async UpdatePublishstatus(params: any):Promise<APIResponseProps>{

        const automation_id = params.automation_id;
        const is_published = params.is_published;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!automation_id || !is_published){
            default_resp.message = "fatal error."
            return default_resp as APIResponseProps
        }

        const resp = await this.autom_repo.UpdatePublishstatus(params)
        return resp;

    }

    public async UpdateDripName(params: any):Promise<APIResponseProps>{

        const automation_id = params.automation_id;
        const automation_name = params.automation_name;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!automation_id || !automation_name){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        const resp = await this.autom_repo.UpdateDripName(params)
        return resp;

    }

    public async UpdateAutomation(req: NextApiRequest):Promise<APIResponseProps>{

        const params = req.body;
        const automation_id = params.automation_id;
        const resource = params.resource;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!automation_id || !resource){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        if(resource == "update-trigger"){
            
            const up_params = {
                automation_id: automation_id,
                trigger: params.trigger,
            }

            const resp = await this.autom_repo.UpdateTriger(up_params)
            return resp;

        } else if(resource == "change-step-action"){
            
            const up_params = {
                automation_id: params.automation_id,
                step_id: params.step_id,
                step_uid: params.step_uid,
                trigger: params.trigger
            }
            
            const resp = await this.autom_repo.ChangeStepAction(up_params)
            return resp;

        } else if(resource == "update-step"){
            
            const up_params = {
                automation_id: automation_id,
                step_id: params.step_id,
                step_uid: params.step_uid,
                wait_period: params.wait_period,
                wait_time: params.wait_time,
                email_template: params.email_template,
                sms_template: params.sms_template,
                trigger: params.trigger,
            }

            const resp = await this.autom_repo.UpdateStep(up_params)
            return resp;

        } else if(resource == "add-new-step"){
            
            const up_params = {
                automation_id: automation_id,
                step_id: params.step_id,
                parent_id: params.parent_id,
                parent_type: params.parent_type,
                parent_uid: params.parent_uid,
            }

            const resp = await this.autom_repo.AddNewStep(up_params)
            return resp;

        } else if(resource == "delete-step"){
            
            const up_params = {
                automation_id: automation_id,
                step_id: params.step_id,
                parent_id: params.parent_id,
                parent_type: params.parent_type,
                parent_uid: params.parent_uid,
            }

            const resp = await this.autom_repo.DeleteStep(up_params)
            return resp;

        } else{
            default_resp.message = "Inavlid resource type."
            return default_resp as APIResponseProps
        }

    }

    public async StartCampaign(req: NextApiRequest):Promise<APIResponseProps>{

        const params = req.body;
        const automation_id = params.automation_id;
        const user_id = params.user_id;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!automation_id || automation_id=="" || !user_id || user_id==""){
            default_resp.message = "Fatal error.";
            return default_resp as APIResponseProps;
        }

        const is_running = await this.autom_repo.IsCampaignRunning(automation_id, user_id);
        if(is_running){
            default_resp.message = "This automation is currently running.";
            return default_resp as APIResponseProps;
        }

        const resp = await this.autom_repo.StartNewCampaign(req);
        return resp;

    }

    public async UpdateCampaignStatus(req: NextApiRequest):Promise<APIResponseProps>{
         
        const params = req.body;
        const automation_id = params.automation_id;
        const user_id = params.user_id;
        const status = params.status;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!automation_id || automation_id=="" || !user_id || user_id=="" || !status || status==""){
            default_resp.message = "Fatal error.";
            return default_resp as APIResponseProps;
        }

        let resp: APIResponseProps = default_resp;
        if(status == "Pause" || status == "Resume"){
            resp = await this.autom_repo.PauseResumeCampaign(req, status);
        }else if(status == "Cancel"){
            //resp = await this.autom_repo.CancelCampaign(req);
        }

        return resp;

    }

    public async ProcessDrips(req: NextApiRequest):Promise<APIResponseProps>{
        
        const resp = await this.autom_repo.ProcessDrips();
        return resp;

    }

}