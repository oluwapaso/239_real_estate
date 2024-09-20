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
        Below are the form details filled by the user<br/>
        </p>

        <p style="line-height: 1.5em;"> 
        <b>First Name: </b>${req_body.first_name}<br/> 
        <b>Last Name: </b>${req_body.last_name}<br/> 
        <b>Email: </b>${req_body.email}<br/> 
        <b>Primary Phone: </b>${req_body.primary_phone}<br/>  
        <b>Secondary Phone: </b>${req_body.secondary_phone}<br/> 
        <b>Fax: </b>${req_body.fax}<br/> <br/> 

        <b>Address: </b>${req_body.address}<br/> 
        <b>City: </b>${req_body.city}<br/> 
        <b>State: </b>${req_body.state}<br/> 
        <b>Zip Code: </b>${req_body.zip_code}<br/> <br/> 

        <b>Number of Bedrooms: </b>${req_body.num_of_beds}<br/> 
        <b>Number of Bathrooms: </b>${req_body.num_of_baths}<br/> 
        <b>Square Feet: </b>${req_body.square_feet}<br/> 
        <b>Mode of Contact: </b>${req_body.mode_of_contact}<br/>
        <b>Price Range: </b>${req_body.price_range}<br/> <br/> 

        <b>When do you want to move?: </b>${req_body.move_on}<br/>
        <b>When did you start looking?: </b>${req_body.started_looking_in}<br/>
        <b>Where would you like to own?: </b>${req_body.own_in}<br/>
        <b>Are you currently with an agent?: </b>${req_body.with_an_agent}<br/>
        <b>Describe your Dream Home: </b>${req_body.home_description}<br/>
        </div>
        </p>
    
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
                subject: "New Buying Message From "+req_body.first_name+" "+req_body.last_name,
                body: msg_body,
                message_type: req.body.message_type
            } 
            
            const send_mail = await mail_service.SendMail(params);
            if(send_mail.success && req.body.user_id){
                const send_email_ar = await mail_service.SendAutoResponder(params);
                const add_buying_req = await user_service.AddBuyingRequest(req);
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