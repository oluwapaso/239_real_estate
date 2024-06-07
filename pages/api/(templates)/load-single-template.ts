import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { LoadSingleTemplateParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const temp_repo = new MYSQLTemplateRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params: LoadSingleTemplateParams = {
            search_by: req_body.search_by,
            search_value: req_body.search_value,
        }
        
        const users = await temp_repo.LoadTemplateInfo(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}