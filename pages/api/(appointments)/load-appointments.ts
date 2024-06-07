import { MYSQLAppointmentRepo } from "@/_repo/appointment_repo";
import { LoadUserAppointmentParams, LoadUserTasksParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const apps_repo = new MYSQLAppointmentRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;

        const params: LoadUserAppointmentParams = {
            user_id: req_body.user_id,
        }
        
        const users = await apps_repo.LoadUserAppointments(params);
        resp.status(200).json(users);

    }else{
        resp.status(405).end()
    }

}