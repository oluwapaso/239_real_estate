import pool from "@/_lib/db_conn";
import { AddTaskParams, AutoResponderDetails, AutoResponderLists, LoadSingleAutoResponderParams,LoadTasksParams,LoadUserTasksParams,MarkTaskAsDoneParams,Task,UpdateAutoResponderParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface TaskRepo { 
    AddNewTask(params: AddTaskParams): Promise<[boolean, number]>
    LoadTasks(params: LoadTasksParams): Promise<Task[] | null>
    LoadUserTasks(params: LoadUserTasksParams): Promise<Task[] | null>
    MarkTaskAsDone(params: MarkTaskAsDoneParams) : Promise<boolean>
    MarkMultiTaskAsDone(task_ids: string) : Promise<boolean>
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

    public async LoadTasks(params: LoadTasksParams): Promise<Task[] | null> {

        const paginated = params.paginated;
        const task_type = params.task_type;
        let rows: RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            let type_filter = "";
            if(task_type == "Upcoming Tasks"){
                type_filter = ` WHERE t.status='Pending' AND t.date > CURDATE() `;
            }else if(task_type == "Overdue Tasks"){
                type_filter = ` WHERE t.status='Pending' AND t.date < CURDATE() `;
            }else if(task_type == "Completed Tasks"){
                type_filter = ` WHERE t.status='Done' `;
            }else{
                 return []; 
            }

            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT t.*, u.firstname, u.lastname, (SELECT COUNT(*) AS total_records 
                FROM tasks ${type_filter}) AS total_records FROM tasks AS t JOIN users AS u ON t.user_id=u.user_id ${type_filter} 
                ORDER BY t.date ASC LIMIT ${start_from}, ${limit}`);
                
            }else{
                [rows] = await connection.query<RowDataPacket[]>(`SELECT t.*, u.firstname, u.lastname FROM tasks AS t JOIN users AS u 
                ON t.user_id=u.user_id ${type_filter} ORDER BY t.date ASC `);

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

    public async MarkTaskAsDone(params: MarkTaskAsDoneParams) : Promise<boolean>{

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

    public async MarkMultiTaskAsDone(task_ids: string) : Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE tasks SET status=? WHERE task_id IN(${task_ids}) `, ["Done"]);
            return result.affectedRows >= 0;

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