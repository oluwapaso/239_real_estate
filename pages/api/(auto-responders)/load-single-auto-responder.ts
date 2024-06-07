import { MYSQLAutoResponderRepo } from "@/_repo/auto_responder";
import { LoadSingleAutoResponderParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const ar_repo = new MYSQLAutoResponderRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params: LoadSingleAutoResponderParams = {
            search_by: req_body.search_by,
            search_value: req_body.search_value,
        }
        
        const auto_responders = await ar_repo.LoadARInfo(params);
        resp.status(200).json(auto_responders);

    }else{
        resp.status(405).end()
    }

}