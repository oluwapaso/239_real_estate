import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { LoadTemplatesParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const temp_repo = new MYSQLTemplateRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params: LoadTemplatesParams = {
            paginated: req_body.paginated,
            search_type: req_body.search_type,
            template_type: req_body.template_type || "any",
            page: req_body.page, 
            limit: req_body.limit
        }
        
        const users = await temp_repo.LoadTemplates(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}