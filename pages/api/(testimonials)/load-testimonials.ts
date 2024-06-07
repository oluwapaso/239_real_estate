import { TestimonialService } from "@/_services/testimonial_service";
import { GetTestimonialParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next"

const testi_service = new TestimonialService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const req_body = req.body
        const paginated = req_body.paginated;
        const page = req_body.page;
        const limit = req_body.limit;

        const payload: GetTestimonialParams = {
            paginated: paginated,
            page: page, 
            limit: limit
        }

        const response = await testi_service.GetAllTestimonial(payload);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
