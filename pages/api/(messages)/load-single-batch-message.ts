import { MYSQLMessagesRepo } from "@/_repo/messages_repo";
import { LoadBatchMessagesParams, LoadSingleBatchMessageParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const msg_repo = new MYSQLMessagesRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;
        const params: LoadSingleBatchMessageParams = {
            batch_id: parseInt(req_body.batch_id)
        }

        const messages = await msg_repo.LoadSingleBatchMessage(params);
        resp.status(200).json(messages);

    }else{
        resp.status(405).end()
    }

}