import pool from "@/_lib/db_conn";
import { AddAppointmentParams, AddTaskParams, Appointment, AutoResponderDetails, AutoResponderLists, LoadAppointmentsParams, LoadSingleAutoResponderParams,LoadUserAppointmentParams,LoadUserTasksParams,MarkAppointmentAsDoneParams,MarkTaskAsDoneParams,Task,UpdateAutoResponderParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface AppointmentRepo { 
    AddNewAppointment(params: AddAppointmentParams): Promise<[boolean, number]>
    LoadAppointments(params: LoadAppointmentsParams): Promise<Task[] | null>
    LoadUserAppointments(params: LoadUserAppointmentParams): Promise<Appointment[] | null>
    MarkAppointmentAsDone(params: MarkAppointmentAsDoneParams) : Promise<boolean>
    MarkMultiAppsAsDone(appointment_ids: string) : Promise<boolean>
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

    public async LoadAppointments(params: LoadAppointmentsParams): Promise<Task[] | null> {

        const paginated = params.paginated;
        const app_type = params.appointment_type;
        let rows: RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            let type_filter = "";
            if(app_type == "Upcoming Appointments"){
                type_filter = ` WHERE a.status='Pending' AND a.date > CURDATE() `;
            }else if(app_type == "Overdue Appointments"){
                type_filter = ` WHERE a.status='Pending' AND a.date < CURDATE() `;
            }else if(app_type == "Completed Appointments"){
                type_filter = ` WHERE a.status='Done' `;
            }else{
                 return []; 
            }

            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT a.*, u.firstname, u.lastname, (SELECT COUNT(*) AS total_records 
                FROM appointments ${type_filter}) AS total_records FROM appointments AS a JOIN users AS u ON a.user_id=u.user_id ${type_filter} 
                ORDER BY a.date ASC LIMIT ${start_from}, ${limit}`);
                
            }else{
                [rows] = await connection.query<RowDataPacket[]>(`SELECT a.*, u.firstname, u.lastname FROM appointments AS a JOIN users AS u 
                ON a.user_id=u.user_id ${type_filter} ORDER BY a.date ASC `);

            }
    
            const formattedRows = rows.map((row) => {
    
                return {
                    ...row,
                }

            });

            return formattedRows as Task[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null; 
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

    public async MarkMultiAppsAsDone(appointment_ids: string) : Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE appointments SET status=? WHERE appointment_id IN(${appointment_ids}) `, ["Done"]);
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