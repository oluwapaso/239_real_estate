import { Helpers } from "@/_lib/helpers";
import { MYSQLRequestRepo } from "@/_repo/property_request";
import { APIResponseProps, AcknowledgeMultiRequestParams, AcknowledgeRequestParams, MarkMultiTaskAsDoneParams, MarkTaskAsDoneParams } from "@/components/types";

export class RequestsService {

    req_repo = new MYSQLRequestRepo();
    helpers = new Helpers();

    public async AcknowledgeRequest(params: AcknowledgeRequestParams):Promise<APIResponseProps>{

        const request_id = params.request_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!request_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        console.log("params:", params)
        const is_updated = await this.req_repo.AcknowledgeRequest(params);
        default_resp.success = is_updated;
        
        if(is_updated){
            default_resp.message = "Request succesfully updated";
        }else{
            default_resp.message = "Unable to update request status";
        }
        return default_resp;

    }

    public async AcknowledgeMultiRequest(params: AcknowledgeMultiRequestParams):Promise<APIResponseProps>{

        const request_ids = params.request_ids;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!request_ids || request_ids.length < 1){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        let implode_ids = request_ids.join("', '");
        implode_ids = `'${implode_ids}'`;

        console.log("implode_ids:", implode_ids)
        const is_updated = await this.req_repo.AcknowledgeMultiRequests(implode_ids);
        default_resp.success = is_updated;
        
        if(is_updated){
            default_resp.message = "Request succesfully updated";
        }else{
            default_resp.message = "Unable to update request status";
        }
        return default_resp;

    }

}
