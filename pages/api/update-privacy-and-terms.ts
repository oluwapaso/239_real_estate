import { APIResponseProps, UpdateCompanyParams, UpdatePrivacyAndTermsParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";
import { CompanyService } from "@/_services/company_service";

const comp_service = new CompanyService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<APIResponseProps>){
    
    if(req.method == "OPTIONS") {

        resp.status(200)
    
    }else if(req.method == "POST") {
        
        const req_body = req.body

        const response = await comp_service.UpdatePrivacyAndTerms(req_body as UpdatePrivacyAndTermsParams) 
        if(response.success){

            resp.status(200).json(response)

        }else{
            resp.status(400).json({"message":response.message, "success": false})
        }
    
    }else{
    
        resp.status(400).json({"message":"Bad request", "success": false})
    
    }

}