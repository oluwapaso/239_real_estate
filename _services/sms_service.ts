import { Helpers } from "@/_lib/helpers";
import { AddBatchMessageParams, APIResponseProps, BatchSMSErrorsParams, GetSingleUserParams, SendSMSParams, SetBatchMessageStatsParams } from "@/components/types";
import { MYSQLMailRepo } from "@/_repo/mail_repo"; 
import { MYSQLAutoResponderRepo } from "@/_repo/auto_responder"; 
import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { NextApiRequest } from "next";
import { MYSQL_SMS_Repo } from "@/_repo/sms_repo";

export class SMS_Service {

    helpers = new Helpers();
    mail_repo = new MYSQLMailRepo();
    sms_repo = new MYSQL_SMS_Repo();
    ar_repo = new MYSQLAutoResponderRepo();
    temp_repo = new MYSQLTemplateRepo();

    public async SendBatchSMS(req: NextApiRequest): Promise<APIResponseProps> {

        const sms_body = req.body.sms_body;
        const user_ids = req.body.user_ids;
        let template_name = req.body.template_name;
        let unsubscribed = 0;
        let errored = 0;
        let queued = 0;
        let errors: BatchSMSErrorsParams[] = []

        console.log("made it here SendBatchSMS()")
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        //Early return
        if(!user_ids || user_ids.length < 1){
            default_resp.message = "No user is selected for this batch email";
            return default_resp;
        }

        if(!template_name || template_name == ""){
            template_name = template_name.slice(0, 16);
        }
        //Else continue
        const batch_params: AddBatchMessageParams = {
            type: "SMS",
            total_messages: user_ids.length, 
            template_name: template_name,
        }  

        let [is_added, batch_id] = await this.mail_repo.AddBatchMessage(batch_params);

        //Early return
        if(!is_added) {
            default_resp.message = "Unable to add batch SMS.";
            return default_resp;
        }

        //Else continue
        await Promise.all(
            user_ids.map(async (user_id: number) => {
                
                if(user_id) {

                    const params: GetSingleUserParams = {
                        search_by: "User ID",
                        fields: "user_id, phone_1, phone_2, firstname, sub_to_mailing_lists",
                        user_id: String(user_id)
                    } 

                    //Lazy-load MYSQLUserRepo to avoid import cycle
                    const { MYSQLUserRepo } = await import("@/_repo/user_repo");
                    const user_repo = new MYSQLUserRepo();
                    const user_info = await user_repo.GetSingleUser({params}) as any;
                    
                    if(user_info && typeof user_info != "string"){

                        //Early sync return
                        if(user_info.sub_to_mailing_lists != "true"){
                            errors.push({user_id: user_id, batch_id: batch_id, to_phone: user_info.phone_1 || user_info.phone_2, 
                            error:"User unsubscribed from receiving mass sms. You can still contact them individually"})
                            unsubscribed++;
                            return; //We are in async function, it's just breking out of current iteration
                        }

                        //Else continue
                        const replaced_body = await this.temp_repo.ReplaceTemplateCode(sms_body, "SMS", user_id);

                        const queue_params: SendSMSParams = {
                            user_id: user_id,
                            from_phone:"",
                            to_phone: user_info.phone_1 || user_info.phone_2,
                            body: replaced_body,
                            message_type: "CRM Message",
                            batch_id: batch_id,
                        } 

                        const add_to_queue = await this.sms_repo.Add_SMS_ToQueue(queue_params);
                        if(add_to_queue){
                            queued++;
                        }else{
                            errors.push({user_id: user_id, batch_id: batch_id, to_phone: user_info.phone_1 || user_info.phone_2, error: "Unable to add message to queue."})
                            errored++;
                            return; //We are in async function, it's just breking out of current iteration
                        }

                    }else{
                        errors.push({user_id: user_id, batch_id: batch_id, to_phone:"", error:"Invalid account info.."})
                        errored++;
                    }

                }else{
                    errors.push({user_id: 0, batch_id: batch_id, to_phone:"", error:"Invalid account info."})
                    errored++;
                }

            })
        )

        if(queued > 0 || errored > 0 || unsubscribed > 0){
            default_resp.success = true;
            default_resp.message = `${queued} batch SMS queued successfully.`;
        }else{
            default_resp.message = "Unable to add SMS to queue.";
        }

        //Log batch email errors 
        if(errors.length > 0 && (errored>0 || unsubscribed > 0)){
            const isErrAdded = await this.sms_repo.LogBatchSMSErrors(errors);
        }

        //Update batch email stats 
        const stats_params: SetBatchMessageStatsParams = {
            type: "SMS",
            batch_id: batch_id, 
            errored: errored,
            unsubscribed: unsubscribed,
            queued: queued,
        }  
        let isUpdated = await this.mail_repo.SetBatchMessageStats(stats_params);

        return default_resp;

    }

}   