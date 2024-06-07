import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { MailService } from "@/_services/mail_service";
import { UserService } from "@/_services/user_service";
import { APIResponseProps, SendMailParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const mail_service = new MailService();
const user_service = new UserService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body;
        const home_address = req_body.home_address;
        const email = req_body.email_address;
        
        const com_repo = new MYSQLCompanyRepo();
        const comp_info = await com_repo.GetCompayInfo();

        const api_info_prms = com_repo.GetApiInfo();
        const api_info = await api_info_prms;

        const msg_body = `<table cellspacing="0" cellpadding="0" border="0" bgcolor="white" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
        <tbody>
        <tr>
        <td width="92%">  
        <table align="center" width="600" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
        <tbody> 
        <tr>
        <td>  
        
        <p style="line-height: 1.5em;"> 
        <b>Home Address: </b>${home_address}<br/> 
        <b>Contact Email: </b>${email}<br/>
        </div>
        </p>
        
        <br>
        <br> 
        <br />
        <br /> 
        </td>
        </tr>
            
        </tbody>
        </table>
        
        </td>
        </tr>
        </tbody>
        </table>`

        try{

            let from_email = "";
            if(req.body.mailer == "Sendgrid"){
                from_email = api_info.data.sendgrid_mailer;
            }
            
            const params: SendMailParams = {
                user_id: req.body.user_id,
                mailer: req.body.mailer,
                from_email: from_email,
                to_email: comp_info.data.selling_req_email,
                subject: "Selling My Home - Consultation",
                body: msg_body,
                message_type: req.body.message_type
            } 
            
            const send_mail = await mail_service.SendMail(params);
            if(send_mail.success && req.body.user_id){
                const send_email_ar = await mail_service.SendAutoResponder(params);
                const add_selling_req = await user_service.AddSellingRequest(req);
                //const send_sms_ar = await sms_service.SendAutoResponder(params);
            }
            resp.status(200).json(send_mail);
        
        }catch(e){
            resp.status(500).json({"message":"Failed to send email: "+e })
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}