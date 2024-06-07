import { AppointmentService } from "@/_services/appointment_service";
import { AddAppointmentParams, MarkAppointmentAsDoneParams } from "@/components/types";
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
        const payload: MarkAppointmentAsDoneParams = {
            appointment_id: req_body.appointment_id
        }
        console.log("payload:", payload)
        const response = await apps_service.MarkAppointmentAsDone(payload);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
