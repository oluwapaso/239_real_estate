import { ServicesService } from "@/_services/services_service";
import { TemplatesService } from "@/_services/templates_service";
import { AddTemplateParams, AddTestimonialParams, UpdateTemplateParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next"

const temp_service = new TemplatesService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const req_body = req.body;
        const payload: AddTemplateParams = {
            template_type: req_body.template_type,
            template_name: req_body.template_name,
            email_subject: req_body.email_subject,
            email_body: req_body.email_body,
            sms_body: req_body.sms_body,
        }

        const response = await temp_service.AddNewTemplalte(payload);
        resp.status(200).json(response);

    } else if(req.method == "PATCH"){
        
        const req_body = req.body;
        const payload: UpdateTemplateParams = {
            template_type: req_body.template_type,
            template_name: req_body.template_name,
            email_subject: req_body.email_subject,
            email_body: req_body.email_body,
            sms_body: req_body.sms_body,
            template_id: req_body.template_id,
        }

        const response = await temp_service.UpdateTemplateInfo(payload);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
