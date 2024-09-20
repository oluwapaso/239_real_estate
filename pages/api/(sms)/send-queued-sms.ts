import { MYSQL_SMS_Repo } from "@/_repo/sms_repo";
import { SMS_Service } from "@/_services/sms_service";
import { QueueError, Send_SMS_Params } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const sms_service = new SMS_Service();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    try{

        const sms_repo = new MYSQL_SMS_Repo();
        const queue_prms = sms_repo.GetQueuedSMS();
        const queues = await queue_prms;
        const sms_to: any[] = [];
        const sent_ids: any[] = [];
        const errored_ids: QueueError[] = [];
        const batch_ids: any[] = [];
        
        if(queues && queues.length){

            const queue_ids: any[] = [];

            await Promise.all(queues.map(async (queue: any)=> {

                queue_ids.push(queue.queue_id);
                sms_to.push({
                    "queue_id": queue.queue_id,
                    "user_id": queue.user_id, 
                    "message_kind": queue.message_kind, 
                    "message_type": queue.message_type, 
                    "from_info": queue.from_info, 
                    "to_info": queue.to_info, 
                    "sms_body": queue.sms_body, 
                    "subject": queue.subject, 
                    "batch_id": queue.batch_id
                });

                if(queue.batch_id && queue.batch_id!=""){
                    batch_ids.push(queue.batch_id);
                }

            }));

            if(sms_to && sms_to.length > 0){

                await Promise.all(sms_to.map(async (sms)=> {

                    const params: Send_SMS_Params = {
                        user_id: sms.user_id,  
                        to_number: sms.to_info, 
                        body: sms.sms_body,
                        message_type: sms.message_type,
                        batch_id: sms.batch_id,
                    } 
                    
                    const send_mail = await sms_service.SendSMS(params);
                    if(send_mail.success){
                        sent_ids.push(sms.queue_id);
                    }else{
                        errored_ids.push({queue_id:sms.queue_id, error_message: send_mail.message});
                    }

                }));

            }else{
                console.log("No queued sms to send at the moment.");
                resp.status(200).json({"status":"Error", "message": "No queued sms to send at the moment."});
            }

            if(sent_ids && sent_ids.length > 0){
                const delQueue = await sms_repo.DeleteQueue(sent_ids);
                console.log("delQueue:", delQueue);
            }

            console.log("errored_ids.length:", errored_ids.length)
            if(errored_ids && errored_ids.length > 0){
                const isErrUpdated = await sms_repo.MarkAsErrored(errored_ids);
                console.log("isErrUpdated:", isErrUpdated);
            }

            console.log("batch_ids.length:", batch_ids.length)
            if(batch_ids && batch_ids.length > 0){

                const batch_uids = Array.from(new Set(batch_ids))
                console.log("Has batch sms to update:", "batch_ids.length", batch_ids.length, "batch_uids.length", batch_uids.length)
                const isBatchUpdated = await sms_repo.UpdateBatchMessageStats(batch_uids);
                const isBatchStatsCounted = await sms_repo.CountBatchMessageStats(batch_uids);
                console.log("isBatchUpdated:", isBatchUpdated, "isBatchStatsCounted:", isBatchStatsCounted);
            }
            
            if(errored_ids && errored_ids.length > 0 && sent_ids.length < 1){
                resp.status(200).json({"status":"Error", "message": "No queued sms sent."});
            }

            resp.status(200).json({"status":"Success", "message": 'SMS sent'});

        }else{
            console.log("No queued sms to send at the moment..");
            resp.status(200).json({"status":"Error", "message": "No queued sms to send at the moment.."});
        }

    }catch(e: any){
        console.log("error:", e.message);
        resp.status(200).json({"status":"Error", "message": e.message});
    }
    
}