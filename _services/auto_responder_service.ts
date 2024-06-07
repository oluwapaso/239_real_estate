import { Helpers } from "@/_lib/helpers";
import { MYSQLAutoResponderRepo } from "@/_repo/auto_responder";
import { APIResponseProps, AddTemplateParams, UpdateAutoResponderParams, UpdateTemplateParams } from "@/components/types";

export class AutoResponderService {

    ar_repo = new MYSQLAutoResponderRepo();
    helpers = new Helpers();

    public async UpdateAutoResponderInfo(params: UpdateAutoResponderParams):Promise<APIResponseProps>{

        const type = params.type;
        const name = params.name;
        const auto_responder_id = params.auto_responder_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!auto_responder_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        if(!type || !name){
            default_resp.message = "Auto responder type and name are required."
            return default_resp as APIResponseProps
        }

        const is_updated = await this.ar_repo.UpdateARInfo(params);
        default_resp.success = is_updated;
        default_resp.data = {"auto_responder_id":auto_responder_id};
        if(is_updated){
            default_resp.message = "Auto responder succesfully updated";
        }else{
            default_resp.message = "Unable to update auto responder";
        }
        return default_resp;

    }

}
