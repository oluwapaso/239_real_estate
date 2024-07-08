import { MYSQLMessagesRepo } from "@/_repo/messages_repo";
import { LoadBatchMessagesParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const msg_repo = new MYSQLMessagesRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;
        const params: LoadBatchMessagesParams = {
            paginated: req_body.paginated,
            message_type: req_body.message_type,
            page: req_body.page, 
            limit: req_body.limit
        }

        const messages = await msg_repo.LoadBatchMessages(params);
        resp.status(200).json(messages);

    }else{
        resp.status(405).end()
    }

}