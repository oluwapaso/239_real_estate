import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { APIResponseProps } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body;
        const fname = req_body.first_name;
        const lname = req_body.last_name;
        const email = req_body.email;
        const phone = req_body.phone;
        const subject = req_body.subject;
        const message = req_body.message;

        const com_repo = new MYSQLCompanyRepo();
        const comp_info = await com_repo.GetCompayInfo();

        const msg_body = `<table cellspacing="0" cellpadding="0" border="0" bgcolor="white" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
        <tbody>
        <tr>
        <td width="92%">  
        <table align="center" width="600" style="color:#5e6670;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.25em;background-color:white;padding:0;text-align:left;padding-bottom:20px">
        <tbody> 
        <tr>
        <td>  
        
        <p style="line-height: 1.5em;"> 
        <b>Contact Name: </b>${fname} ${lname}<br/> 
        <b>Contact Email: </b>${email}<br/> 
        <b>Contact Phone: </b>${phone}<br/>  
        <b>Subject: </b>${subject}<br/> 
        <b>Message: </b>${message}
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
            from: process.env.NEXT_PUBLIC_MAILER,
            to: comp_info.data.contact_us_email, //"adebayoishola01@gmail.com",
            subject: "Contact Us Message: "+subject,
            html: msg_body
        }

        try{
        
            await transporter.sendMail(mailOptions);
            resp.status(200).json({"message":"Email sent!"});
        
        }catch(e){
            resp.status(500).json({"message":"Failed to send email: "+e })
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}