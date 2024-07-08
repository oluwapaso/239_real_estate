import { MYSQLAppointmentRepo } from "@/_repo/appointment_repo";
import { LoadAppointmentsParams, LoadUserAppointmentParams, LoadUserTasksParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next";

const apps_repo = new MYSQLAppointmentRepo();
export default async function handler(req: NextApiRequest, resp:NextApiResponse) {

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){

        const req_body = req.body;
        const search_type = req_body.search_type;
        let appointments;
        
        if(search_type == "Appointments Lists"){
            const params: LoadAppointmentsParams = {
                paginated: req_body.paginated,
                appointment_type: req_body.appointment_type,
                page: req_body.page, 
                limit: req_body.limit
            }
            appointments = await apps_repo.LoadAppointments(params);
        }else if(search_type == "User Appointments"){

            const params: LoadUserAppointmentParams = {
            user_id: req_body.user_id,
        }
            appointments = await apps_repo.LoadUserAppointments(params);
        }

        resp.status(200).json(appointments);

    }else{
        resp.status(405).end()
    }

}