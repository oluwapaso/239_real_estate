import { TestimonialService } from "@/_services/testimonial_service";
import { NextApiRequest, NextApiResponse } from "next"

const testi_service = new TestimonialService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const req_body = req.body;

        const response = await testi_service.GetTestimonialInfo(req_body.testimonial_id);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
