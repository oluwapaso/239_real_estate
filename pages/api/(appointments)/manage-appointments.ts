import { AppointmentService } from "@/_services/appointment_service";
import { APIResponseProps, AddAppointmentParams, MarkAppointmentAsDoneParams, MarkMultiAppsAsDoneParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next"

const apps_service = new AppointmentService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const req_body = req.body;
        const payload: AddAppointmentParams = {
            user_id: req_body.user_id,
            title: req_body.title,
            date: req_body.date,
            start_time: req_body.start_time,
            end_time:  req_body.end_time,
            location:  req_body.location,
            notes:  req_body.notes,
        }

        const response = await apps_service.AddNewAppointment(payload);
        resp.status(200).json(response);

    } else if(req.method == "PATCH"){

        const req_body = req.body;
        const type = req_body.type;
        let response: APIResponseProps | null = null ; 

        if(type == "Single"){

            const payload: MarkAppointmentAsDoneParams = {
                appointment_id: req_body.appointment_id
            }
            
            response = await apps_service.MarkAppointmentAsDone(payload);

        }else if(type == "Multiple"){
            
            const payload: MarkMultiAppsAsDoneParams = {
                appointment_ids: req_body.appointment_ids
            }
            
            response = await apps_service.MarkMultiAppsAsDone(payload);

        }

        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
