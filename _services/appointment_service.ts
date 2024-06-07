import { Helpers } from "@/_lib/helpers";
import { MYSQLAppointmentRepo } from "@/_repo/appointment_repo";
import { APIResponseProps, AddAppointmentParams, AddTaskParams, MarkAppointmentAsDoneParams, MarkTaskAsDoneParams } from "@/components/types";

export class AppointmentService {

    app_repo = new MYSQLAppointmentRepo();
    helpers = new Helpers();

    public async AddNewAppointment(params: AddAppointmentParams):Promise<APIResponseProps>{

        const user_id = params.user_id;
        const title = params.title;
        const date = params.date;
        const start_time = params.start_time;
        const end_time = params.end_time;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!user_id || user_id == ""){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        if(!date || !start_time || !end_time || !title){
            default_resp.message = "All fields are required."
            return default_resp as APIResponseProps
        }

        const [is_added, appointment_id] = await this.app_repo.AddNewAppointment(params);
        default_resp.success = is_added;
        
        if(is_added){
            default_resp.message = "Appointment succesfully added";
            default_resp.data = {appointment_id:appointment_id};
        }else{
            default_resp.message = "Unable to add new appointment";
        }
        return default_resp;

    }

    public async MarkAppointmentAsDone(params: MarkAppointmentAsDoneParams):Promise<APIResponseProps>{

        const appointment_id = params.appointment_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!appointment_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        console.log("params:", params)
        const is_updated = await this.app_repo.MarkAppointmentAsDone(params);
        default_resp.success = is_updated;
        
        if(is_updated){
            default_resp.message = "Appointment succesfully updated";
        }else{
            default_resp.message = "Unable to update appointment status";
        }
        return default_resp;

    }

}
