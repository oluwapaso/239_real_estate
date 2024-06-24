import pool from "@/_lib/db_conn";
import { AddAppointmentParams, AddTaskParams, Appointment, AutoResponderDetails, AutoResponderLists, LoadSingleAutoResponderParams,LoadUserAppointmentParams,LoadUserTasksParams,MarkAppointmentAsDoneParams,MarkTaskAsDoneParams,Task,UpdateAutoResponderParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface AppointmentRepo { 
    AddNewAppointment(params: AddAppointmentParams): Promise<[boolean, number]>
    LoadAppointments(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null>
    LoadUserAppointments(params: LoadUserAppointmentParams): Promise<Appointment[] | null>
    MarkAppointmentAsDone(params: MarkAppointmentAsDoneParams) : Promise<boolean>
}

export class MYSQLAppointmentRepo implements AppointmentRepo {

    public async AddNewAppointment(params: AddAppointmentParams): Promise<[boolean, number]>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const title = params.title;
            const date = params.date;
            const start_time = params.start_time;
            const end_time = params.end_time;
            const location = params.location;
            const notes = params.notes;

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(` 
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
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadAppointments(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null> {
        
        let connection: PoolConnection | null = null;
        try{

            let rows: RowDataPacket[] = []
            const search_by = params.search_by;
            const value = params.search_value;
            const type = params.template_type;
            connection = await pool.getConnection();

            if(!type || type == ''){
                if(search_by == "AR Type"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE ar_type=? `, [value]);
                }else if(search_by == "AR Id"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE auto_responder_id=? `, [value]);
                }
            }else{
                if(search_by == "AR Type"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE ar_type=? AND type=? `, [value, type]);
                }else if(search_by == "AR Id"){
                    [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM auto_responders WHERE auto_responder_id=? AND type=? `, [value, type]);
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
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    } 

    public async LoadUserAppointments(params: LoadUserAppointmentParams): Promise<Appointment[] | null> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const user_id = params.user_id;
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) as completed FROM appointments WHERE user_id=? 
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
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async MarkAppointmentAsDone(params: MarkAppointmentAsDoneParams) : Promise<boolean>{

        const appointment_id = params.appointment_id;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE appointments SET status=? WHERE appointment_id=? `, ["Done", appointment_id]);
            return result.affectedRows > 0;

        }catch(e: any){
            console.log(e.sqlMessage)
            return false; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}