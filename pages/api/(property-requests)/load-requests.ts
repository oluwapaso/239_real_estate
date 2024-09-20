import { MYSQLRequestRepo } from "@/_repo/property_request";
import { LoadRequestsParams, LoadUserRequestsParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const req_repo = new MYSQLRequestRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;
        const search_type = req_body.search_type;
        let tasks;

        if(search_type == "Requests Lists"){
            const params: LoadRequestsParams = {
                paginated: req_body.paginated,
                request_type: req_body.request_type,
                page: req_body.page, 
                limit: req_body.limit
            }
            tasks = await req_repo.LoadRequests(params);
        }else if(search_type == "User Requests"){

            const params: LoadUserRequestsParams = {
                user_id: req_body.user_id,
            }
            //tasks = await req_repo.LoadUserRequests(params);
        }

        resp.status(200).json(tasks);

    }else{
        resp.status(405).end()
    }

}