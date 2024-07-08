import { Helpers } from "@/_lib/helpers";
import { MYSQLAgentsRepo } from "@/_repo/agents_repo";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { MailService } from "@/_services/mail_service";
import { APIResponseProps, AddTokenParams, AgentsType, GetSingleAdminParams, GetSingleAgentParams, SendMailParams } from "@/components/types";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from 'nodemailer';

const agent_repo = new MYSQLAgentsRepo();
const mail_service = new MailService();
const helpers = new Helpers();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body 
        const account_email = req_body.account_email;

        const com_repo = new MYSQLCompanyRepo();
        const api_info_prms = com_repo.GetApiInfo();
        const api_info = await api_info_prms;

        const params: GetSingleAdminParams = {
            search_by:"Email",
            fields:"admin_id,status",
            email: account_email
        } 

        let admin_id: any
        let token: string | null = null
        let status: string | undefined

        const admin_info = await agent_repo.GetSingleAdmin({params}) 
        if(admin_info && typeof admin_info != "string"){

            admin_id = admin_info.admin_id
            status = admin_info?.status

        }else if (typeof admin_info === "string"){
            resp.status(400).json({"message":admin_info})
        }else{
            resp.status(400).json({"message":"Invalid account info provided."})
        }

        if(status=="Active" || status=="Inactive" || status=="Reset Password"){

            const resetToken = agent_repo.GetResetToken({
                params:{
                    email:account_email,
                    search_by:"Email"
                }
            })

            await resetToken.then((reset_token: string | null) => {
                if(reset_token){
                   token = reset_token 
                }else{

                    token = helpers.GenarateRandomString(50);
                    const date = moment().format('YYYY-MM-DD HH:mm:ss');
                    /** Add new token via repo */
                    const tok_params: AddTokenParams = {
                        email:account_email,
                        date,
                        token 
                    }
                    const is_added = agent_repo.AddNewToken({params:tok_params})
                    
                    if(!is_added){
                        resp.status(500).json({"message":"Unable to add new token."})
                    }
                    /** Add new token via repo */

                }
            });

        }else{
             resp.status(401).json({"message":"Account is not active. Please contact support."})
        }

        
        const msg_body = `<div style="font-family:Helvetica Light,Helvetica,Arial,sans-serif;margin:0;padding:0; width:100%" bgcolor="#eeeeee"> 
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
        <tbody><tr>
        <td bgcolor="#eeeeee" align="center" style="padding:25px" >

        <table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;max-width:600px" >
        <tbody><tr>
        <td>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
        <tbody>
        <tr>
        <td>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
        <tbody>

        <tr>
        <td align="center" style="color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:21px;font-weight:bold;padding:0px;padding-top: 40px;" >
        You requested for a password reset
        </td>
        </tr>
        <tr>
        <td align="center" style="color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:normal;line-height:22px;padding:30px 5% 0px" >
        Follow the link below to reset your password
        </td>
        </tr>
                
        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="20"></td>
        </tr>
        
        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="20"></td>
        </tr>

        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="1" style="padding:0px 30px">
        <table cellpadding="0" cellspacing="0" width="30%" style="border-collapse:collapse">
        <tbody><tr>
        <td style="border-top-color:#eeeeee;border-top-style:solid;border-top-width:1px;padding:0px 30px"></td>
        <td>
        </td>
        </tr>
        </tbody></table>
        </td>
        </tr>

        
        </tbody></table>
        </td>
        </tr>
        
        <tr>
        <td>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">

        <tbody>  
        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="20"></td>
        </tr>

        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="1" style="padding:0px 30px">
        <table cellpadding="0" cellspacing="0" width="300" height="46" style="border-collapse:collapse">

        <tbody><tr>
        <td bgcolor="#2ccae7" height="46" align="center" style="border-radius:2px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/reset-password?email=${account_email}&token=${token}" 
        style="color:#ffffff;display:inline-block;font-family:\'Helvetica Neue\',arial;font-size:17px;font-weight:bold;line-height:46px;min-width:280px;max-width:280px;text-align:center;text-decoration:none">
        Reset Your Password</a></td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        

        <tr>
        <td width="100%" align="center" valign="top" bgcolor="#ffffff" height="40"></td>
        </tr>

        </tbody></table>
        </td>
        </tr>
        
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr> 
        
        </tbody>
        </table>
        </div>`;

        try{
            
            let from_email = api_info.data.sendgrid_mailer;
            const params: SendMailParams = {
                user_id: 0,
                mailer: "",
                from_email: from_email,
                to_email: req_body.account_email,
                subject: "Reset your admin password",
                body: msg_body,
                message_type: req.body.message_type
            } 
            
            const send_mail = await mail_service.SendMail(params);
            if(send_mail.message == "Email sent!"){
                resp.status(200).json({success: true, "message":"Reset Link Sent", "data": send_mail});
            }else{
                resp.status(200).json(send_mail);
            }
        
        }catch(e){
            resp.status(500).json({"message":"Failed to send email: "+e })
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request"})
    
    }

}