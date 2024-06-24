import pool from "@/_lib/db_conn";
import { AddTaskParams, AutoResponderDetails, AutoResponderLists, LoadSingleAutoResponderParams,LoadUserTasksParams,MarkTaskAsDoneParams,Task,UpdateAutoResponderParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface TaskRepo { 
    AddNewTask(params: AddTaskParams): Promise<[boolean, number]>
    LoadTasks(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null>
    LoadUserTasks(params: LoadUserTasksParams): Promise<Task[] | null>
    MarktaskAsDone(params: MarkTaskAsDoneParams) : Promise<boolean>
    LoadAutoResponders(): Promise<AutoResponderLists[] | null>
}

export class MYSQLTaskRepo implements TaskRepo {

    public async AddNewTask(params: AddTaskParams): Promise<[boolean, number]>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const title = params.title;
            const date = params.date;
            const time = params.time;
            connection = await pool.getConnection();

            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO tasks(user_id, title, date, time) VALUES(?, ?, ?, ?) `, [user_id, title, date, time]
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

    public async LoadTasks(params: LoadSingleAutoResponderParams): Promise<AutoResponderDetails | null> {

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

    public async LoadUserTasks(params: LoadUserTasksParams): Promise<Task[] | null> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const user_id = params.user_id;
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) as completed FROM tasks WHERE user_id=? 
            AND status='Done') AS completed_tasks, (SELECT COUNT(*) as pending FROM tasks WHERE user_id=? AND status='Pending') 
            AS pending_tasks FROM tasks WHERE user_id=?`, [user_id, user_id, user_id]);

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    } as Task
                });
                return formattedRows;
            }else{
                return null
            }

        }catch(e: any){
            console.log(e.sqlMessage);
            return e.sqlMessage;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async MarktaskAsDone(params: MarkTaskAsDoneParams) : Promise<boolean>{

        const task_id = params.task_id;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE tasks SET status=? WHERE task_id=? `, ["Done", task_id]);
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

    public async LoadAutoResponders(): Promise<AutoResponderLists[] | null> {
         
        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM auto_responders ORDER BY name ASC `);
            const formattedRows = rows.map((row) => {
    
                return {
                    ...row,
                }

            });

            return formattedRows as AutoResponderLists[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}