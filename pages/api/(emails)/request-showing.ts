import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { MailService } from "@/_services/mail_service";
import { UserService } from "@/_services/user_service";
import { APIResponseProps, SendMailParams } from "@/components/types";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";

const mail_service = new MailService();
const user_service = new UserService();
export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body
        const fullname = req_body.fullname
        const email = req_body.email
        const phone = req_body.phone_number
        const subject = "New showing request";
        const prefer_date = req_body.prefer_date
        const exact_date = req_body.exact_date
        const notes = req_body.notes;
        const prop_link =  req_body.prop_url;

        const com_repo = new MYSQLCompanyRepo();
        const comp_info = await com_repo.GetCompayInfo();

        let exactDate = ''
        if(prefer_date == "Exact Day"){
            exactDate = `(${moment(exact_date).format("MM/DD/YYYY")})`;
        }

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
        <b>Contact Name: </b>${fullname}<br/> 
        <b>Contact Email: </b>${email}<br/> 
        <b>Contact Phone: </b>${phone}<br/>  
        <b>Subject: </b>${subject}<br/> 
        <b>Prefer Date: </b>${prefer_date} ${exactDate}<br/> 
        <b>Property Link: </b><a href="${prop_link}">${prop_link}</a><br/> 
        <b>Notes: </b>${notes}<br/> 
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
                to_email: comp_info.data.contact_us_email,
                subject: "Property Details Message: "+subject,
                body: msg_body,
                message_type: req.body.message_type
            } 
            
            const send_mail = await mail_service.SendMail(params);
            if(send_mail.success && req.body.user_id){
                const send_email_ar = await mail_service.SendAutoResponder(params);
                const add_showing_req = await user_service.AddShowingRequest(req);
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