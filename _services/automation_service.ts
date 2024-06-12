import { MYSQLAutomationRepo } from "@/_repo/automation_repo";
import { APIResponseProps } from "@/components/types";

 
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

}