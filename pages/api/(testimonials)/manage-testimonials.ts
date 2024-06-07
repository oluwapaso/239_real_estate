import { TestimonialService } from "@/_services/testimonial_service";
import { NextApiRequest, NextApiResponse } from "next"

const comm_service = new TestimonialService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const req_body = req.body;
        const payload = {
            fullname: req_body.fullname,
            account_type: req_body.account_type,
            testimonial: req_body.testimonial,
        }

        const response = await comm_service.AddNewTestimonial(payload);
        resp.status(200).json(response);

    } else if(req.method == "PATCH"){
        
        const req_body = req.body;
        const payload = {
            testimonial_id: req_body.testimonial_id,
            fullname: req_body.fullname,
            account_type: req_body.account_type,
            testimonial: req_body.testimonial,
        }

        const response = await comm_service.UpdateTestimonialInfo(payload);
        resp.status(200).json(response);

    }else if(req.method == "DELETE"){
        
        const req_body = req.body;
        const response = await comm_service.DeleteTestimonialInfo(req_body.testimonial_id);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
