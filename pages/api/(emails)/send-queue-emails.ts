import { MYSQLMailRepo } from "@/_repo/mail_repo";
import { MailService } from "@/_services/mail_service";
import { SendMailParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const mail_service = new MailService();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    try{

        const email_repo = new MYSQLMailRepo();
        const queue_prms = email_repo.GetQueuedEmails();
        const queues = await queue_prms;
        const mail_to: any[] = [];
        const sent_ids: any[] = [];
        const errored_ids: any[] = [];

        if(queues && queues.length){

            const queue_ids: any[] = [];

            await Promise.all(queues.map(async (queue: any)=> {

                queue_ids.push(queue.queue_id);
                mail_to.push({
                    "queue_id": queue.queue_id,
                    "user_id": queue.user_id, 
                    "message_kind": queue.message_kind, 
                    "message_type": queue.message_type, 
                    "from_info": queue.from_info, 
                    "to_info": queue.to_info, 
                    "email_body": queue.email_body, 
                    "subject": queue.subject
                });

            }));

            if(mail_to && mail_to.length > 0){

                await Promise.all(mail_to.map(async (mail)=> {

                    const params: SendMailParams = {
                        user_id: mail.user_id,
                        mailer: "Sendgrid",
                        from_email: mail.from_info,
                        to_email: mail.to_info,
                        subject: mail.subject,
                        body: mail.email_body,
                        message_type: mail.message_type
                    } 
                    
                    const send_mail = await mail_service.SendMail(params);
                    if(send_mail.success){
                        sent_ids.push(mail.queue_id);
                    }else{
                        errored_ids.push(mail.queue_id);
                    }

                }));

            }else{
                console.log("No queued emails to send at the moment.");
                resp.status(200).json({"status":"Error", "message": "No queued emails to send at the moment."});
            }

            if(sent_ids && sent_ids.length > 0){
                const delQueue = await email_repo.DeleteQueue(sent_ids);
                console.log("delQueue:", delQueue);
            }

            if(errored_ids && errored_ids.length > 0){
                const isErrUpdated = await email_repo.MarkAsErrored(errored_ids);
                console.log("isErrUpdated:", isErrUpdated);
            }
            
            resp.status(200).json({"status":"Success", "message": 'Email sent'});

        }else{
            console.log("No queued emails to send at the moment..");
            resp.status(200).json({"status":"Error", "message": "No queued emails to send at the moment.."});
        }

    }catch(e: any){
        console.log("error:", e.message);
        resp.status(200).json({"status":"Error", "message": e.message});
    }
 
}