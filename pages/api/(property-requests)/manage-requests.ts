import { RequestsService } from "@/_services/requests_service";
import { APIResponseProps, AcknowledgeMultiRequestParams, AcknowledgeRequestParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next"

const req_service = new RequestsService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    }  else if(req.method == "PATCH"){
        
        const req_body = req.body;
        const type = req_body.type;
        let response: APIResponseProps | null = null ; 

        if(type == "Single"){

            const payload: AcknowledgeRequestParams = {
                request_id: req_body.request_id
            }
            
            response = await req_service.AcknowledgeRequest(payload);

        }else if(type == "Multiple"){
            
            const payload: AcknowledgeMultiRequestParams = {
                request_ids: req_body.request_ids
            }
            
            response = await req_service.AcknowledgeMultiRequest(payload);

        }

        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
