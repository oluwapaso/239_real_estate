import { Helpers } from "@/_lib/helpers";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { AddBatchMessageParams, APIResponseProps, BatchMailErrorsParams, GetSingleUserParams, LoadSingleAutoResponderParams, 
    SendMailParams, SetBatchMessageStatsParams } from "@/components/types";
import { sendEmail } from "@/_lib/sendgridMailer";
import nodemailer from 'nodemailer';
import { MYSQLMailRepo } from "@/_repo/mail_repo"; 
import { MYSQLAutoResponderRepo } from "@/_repo/auto_responder"; 
import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { NextApiRequest } from "next";

export class MailService {

    helpers = new Helpers();
    mail_repo = new MYSQLMailRepo();
    ar_repo = new MYSQLAutoResponderRepo();
    temp_repo = new MYSQLTemplateRepo();
    //user_repo = new MYSQLUserRepo();

    public async SendMail(params: SendMailParams): Promise<APIResponseProps> {

        console.log("made it here SendMail()")
        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        let mailer = params.mailer;
        const user_id = params.user_id;
        const from_email = params.from_email;
        const to_email = params.to_email;
        const subject = params.subject;
        const body = params.body;

        if(!mailer || mailer == ""){
            mailer = "Sendgrid";
        }

        if(!this.helpers.validateEmail(from_email)){
            default_resp.message = "Provide a valid from email";
            return default_resp;
        }

        if(!this.helpers.validateEmail(to_email)){
            default_resp.message = "Provide a valid to email";
            return default_resp;
        }

        if(!subject || subject == "" || !body || body == ""){
            default_resp.message = "All fields are required";
            return default_resp;
        }

        if (mailer === 'Nodemailer') {

            const transporter = nodemailer.createTransport({
                host: process.env.NEXT_PUBLIC_MAIL_HOST,
                port: 465,
                secure: true,
                auth:{
                    user: process.env.NEXT_PUBLIC_MAILER,
                    pass: process.env.NEXT_PUBLIC_PWORD,
                }
            });

            const mailOptions = {
                from: from_email,
                to: to_email,
                subject: subject,
                html: body
            }

            await transporter.sendMail(mailOptions)
            default_resp.message = "Email sent!";
            if(user_id && user_id > 0){
                this.mail_repo.AddSentMail(params);
            }

        }else if(mailer == "Sendgrid"){

            console.log("made it here in mailer 11 == Sendgrid")
            try{

                const com_repo = new MYSQLCompanyRepo();
                const comp_info = await com_repo.GetCompayInfo();
                const api_info_prms = com_repo.GetApiInfo();
                const api_info = await api_info_prms
                console.log("made it here in mailer == Sendgrid")

                const response = await sendEmail(from_email, to_email, subject, body, api_info.data.sendgrid_key); 
                
                if(response == "Email sent"){
                    default_resp.success = true;
                    default_resp.message = "Email sent!";
                    default_resp.data = {sent_to:comp_info.data.selling_req_email};
                    
                    if(user_id && user_id > 0){
                        this.mail_repo.AddSentMail(params);
                    }
                }else{
                    default_resp.message = "Error sending email:: "+response;
                    //throw new Error(response);
                }
            
            }catch(e:any){
                console.log("Send Mail Error:", e)
                default_resp.message = "Error sending email: "+e;
            }

        }

        return default_resp;

    }

    public async SendAutoResponder(params: SendMailParams): Promise<APIResponseProps> {

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
 
        const user_id = params.user_id;
        const ar_params: LoadSingleAutoResponderParams = {
            search_by: "AR Type",
            search_value: params.message_type,
            template_type: "Email",
        }
        const ar_template = await this.ar_repo.LoadARInfo(ar_params);
        if(ar_template){
            
            if(ar_template.send_ar == "Yes"){

                const replaced_body = await this.temp_repo.ReplaceTemplateCode(ar_template.email_body, "Email", user_id);
                const replaced_subject = await this.temp_repo.ReplaceTemplateCode(ar_template.email_subject, "Email", user_id);
                params.body = replaced_body;
                params.subject = replaced_subject;

                const add_to_queue = await this.mail_repo.AddMailToQueue(params);
                
                if(add_to_queue){
                    default_resp.success = add_to_queue;
                    default_resp.message = "Auto responder queued successfully.";
                }else{
                    default_resp.message = "Unable to add auto responder to queue.";
                }

            }else{
                console.log("Not sending auto responder");
            }
        }else{
            console.log("UNable to load ar for :", params.message_type);
        }
        
        return default_resp;

    }


    public async SendBatchEmail(req: NextApiRequest): Promise<APIResponseProps> {

        const from_email = req.body.from_email;
        const mail_body = req.body.mail_body;
        const subject = req.body.subject;
        const user_ids = req.body.user_ids;
        const mailer = req.body.mailer;
        let template_name = req.body.template_name;
        let unsubscribed = 0;
        let errored = 0;
        let queued = 0;
        let errors: BatchMailErrorsParams[] = [];

        console.log("made it here SendBatchMail()")
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
            template_name = subject
        }
        //Else continue
        const batch_params: AddBatchMessageParams = {
            type: "Email",
            total_messages: user_ids.length, 
            template_name: template_name,
        }  

        let [is_added, batch_id] = await this.mail_repo.AddBatchMessage(batch_params);

        //Early return
        if(!is_added) {
            default_resp.message = "Unable to add batch email.";
            return default_resp;
        }

        //Else continue
        await Promise.all(
            user_ids.map(async (user_id: number) => {
                
                if(user_id) {

                    const params: GetSingleUserParams = {
                        search_by: "User ID",
                        fields: "user_id, email, firstname, sub_to_mailing_lists",
                        user_id: String(user_id)
                    } 

                    //Lazy-load MYSQLUserRepo to avoid import cycle
                    const { MYSQLUserRepo } = await import("@/_repo/user_repo");
                    const user_repo = new MYSQLUserRepo();
                    const user_info = await user_repo.GetSingleUser({params}) as any;
                    
                    if(user_info && typeof user_info != "string"){

                        //Early sync return
                        if(user_info.sub_to_mailing_lists != "true"){
                            errors.push({user_id: user_id, batch_id: batch_id, to_email: user_info.email, 
                            error:"User unsubscribed from receiving mass email. You can still contact them individually"})
                            unsubscribed++;
                            return; //We are in async function, it's just breking out of current iteration
                        }

                        //Early sync return
                        if(!this.helpers.validateEmail(user_info.email)){
                            errors.push({user_id: user_id, batch_id: batch_id, to_email: user_info.email, error:"Invalid email address"})
                            errored++;
                            return; //We are in async function, it's just breking out of current iteration
                        }  

                        //Else continue
                        const replaced_body = await this.temp_repo.ReplaceTemplateCode(mail_body, "Email", user_id);
                        const replaced_subject = await this.temp_repo.ReplaceTemplateCode(subject, "Email", user_id);

                        const queue_params: SendMailParams = {
                            user_id: user_id,
                            mailer: mailer,
                            from_email: from_email,
                            to_email: user_info.email,
                            subject: replaced_subject,
                            body: replaced_body,
                            message_type: "CRM Message",
                            batch_id: batch_id,
                        } 

                        const add_to_queue = await this.mail_repo.AddMailToQueue(queue_params);
                        if(add_to_queue){
                            queued++;
                        }else{
                            errors.push({user_id: user_id, batch_id: batch_id, to_email: user_info.email, error: "Unable to add message to queue."})
                            errored++;
                            return; //We are in async function, it's just breking out of current iteration
                        }

                    }else{
                        errors.push({user_id: user_id, batch_id: batch_id, to_email:"", error:"Invalid account info.."})
                        errored++;
                    }

                }else{
                    errors.push({user_id: 0, batch_id: batch_id, to_email:"", error:"Invalid account info."})
                    errored++;
                }

            })
        )

        if(queued > 0 || errored > 0 || unsubscribed > 0){
            default_resp.success = true;
            default_resp.message = `${queued} batch email${queued > 1 ? "s":""} queued successfully.`;
        }else{
            default_resp.message = `Unable to add email${queued > 1 ? "s":""} to queue.`;
        }

        //Log batch email errors 
        if(errors.length > 0 && (errored>0 || unsubscribed > 0)){
            const isErrAdded = await this.mail_repo.LogBatchMailErrors(errors);
        }

        //Update batch email stats 
        const stats_params: SetBatchMessageStatsParams = {
            type: "Email",
            batch_id: batch_id, 
            errored: errored,
            unsubscribed: unsubscribed,
            queued: queued,
        }  
        let isUpdated = await this.mail_repo.SetBatchMessageStats(stats_params);

        return default_resp;

    }

}   