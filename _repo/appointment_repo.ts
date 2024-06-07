import pool from "@/_lib/db_conn";
import { AddAppointmentParams, AddTaskParams, Appointment, AutoResponderDetails, AutoResponderLists, LoadSingleAutoResponderParams,LoadUserAppointmentParams,LoadUserTasksParams,MarkAppointmentAsDoneParams,MarkTaskAsDoneParams,Task,UpdateAutoResponderParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 

export interface AppointmentRepo { 
    AddNewAppointment(params: AddAppointmentParams): Promise<[boolean, number]>
    LoadAppointments(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null>
    LoadUserAppointments(params: LoadUserAppointmentParams): Promise<Appointment[] | null>
    MarkAppointmentAsDone(params: MarkAppointmentAsDoneParams) : Promise<boolean>
}

export class MYSQLAppointmentRepo implements AppointmentRepo {

    public async AddNewAppointment(params: AddAppointmentParams): Promise<[boolean, number]>{

        try{

            const user_id = params.user_id;
            const title = params.title;
            const date = params.date;
            const start_time = params.start_time;
            const end_time = params.end_time;
            const location = params.location;
            const notes = params.notes;

            const [result] = await pool.query<ResultSetHeader>(` 
                INSERT INTO appointments(user_id, title, location, date, start_time, end_time, notes) VALUES(?, ?, ?, ?, ?, ?, ?) `, 
                [user_id, title, location, date, start_time, end_time, notes]
            );
            
            if(result.affectedRows>0){
                return [true, result.insertId];
            } else{
                return [false, 0];
            }

        }catch(e:any){
            console.log(e.message);
            return [false, 0];
        }

    }

    public async LoadAppointments(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null> {

        try{

            let rows: RowDataPacket[] = []
            const search_by = params.search_by;
            const value = params.search_value;
            const type = params.template_type;

            if(!type || type == ''){
                if(search_by == "AR Type"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE ar_type=? `, [value]);
                }else if(search_by == "AR Id"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE auto_responder_id=? `, [value]);
                }
            }else{
                if(search_by == "AR Type"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE ar_type=? AND type=? `, [value, type]);
                }else if(search_by == "AR Id"){
                    [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE auto_responder_id=? AND type=? `, [value, type]);
                }
            }

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    } as AutoResponderDetails
                });
                return formattedRows[0];
            }else{
                return null
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return e.sqlMessage
        }

    } 

    public async LoadUserAppointments(params: LoadUserAppointmentParams): Promise<Appointment[] | null> {

        try{

            const user_id = params.user_id;
            const [rows] = await pool.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) as completed FROM appointments WHERE user_id=? 
            AND status='Done') AS completed_appointments, (SELECT COUNT(*) as pending FROM appointments WHERE user_id=? AND status='Pending') 
            AS pending_appointments FROM appointments WHERE user_id=?`, [user_id, user_id, user_id]);

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    } as Appointment
                });
                return formattedRows;
            }else{
                return null
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return e.sqlMessage
        }

    }

    public async MarkAppointmentAsDone(params: MarkAppointmentAsDoneParams) : Promise<boolean>{

        const appointment_id = params.appointment_id;

        try{
            
            const [result] = await pool.query<ResultSetHeader>(`UPDATE appointments SET status=? WHERE appointment_id=? `, ["Done", appointment_id]);
            return result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false; 
        }

    }

}