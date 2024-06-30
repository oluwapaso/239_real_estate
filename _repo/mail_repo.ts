import { SentMailParams } from "@/components/types";
import pool from "@/_lib/db_conn";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface MailRepo { 
    AddSentMail(params: SentMailParams): Promise<boolean>
    AddMailToQueue(params: SentMailParams): Promise<boolean>
    GetQueuedEmails(): Promise<any>
    DeleteQueue(ids: any[]): Promise<boolean>
    MarkAsErrored(ids: any[]): Promise<boolean>
}

export class MYSQLMailRepo implements MailRepo {

    public async AddSentMail(params: SentMailParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const message_body = params.body;
            const from_email = params.from_email;
            const to_email = params.to_email;
            const subject = params.subject;
            const message_type = params.message_type;
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();
            
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO logged_messages(user_id, from_info, to_info, subject, message_body, message_kind, message_type, date_added) 
                VALUES(?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, from_email, to_email, subject, message_body, "Email", message_type, date]
            );
            
            if(result.affectedRows>0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddMailToQueue(params: SentMailParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const message_body = params.body;
            const from_email = params.from_email;
            const to_email = params.to_email;
            const subject = params.subject;
            const message_type = params.message_type;
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();

            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO queue_messages(user_id, message_type, message_kind, from_info, to_info, subject, email_body, date_queued) 
                VALUES(?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, message_type, "Email", from_email, to_email, subject, message_body, date]
            );
            
            if(result.affectedRows>0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetQueuedEmails(): Promise<any> {

        let connection: PoolConnection | null = null;
        try{
        
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM queue_messages WHERE status='Pending' ORDER BY date_queued ASC LIMIT 10`);

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    }
                });
                return formattedRows;
            }else{
                return [];
            }

        }catch(e:any){
            console.log(e.message);
            return [];
        }finally{
            if (connection) { 
                connection.release();
            }
        }
    
    }

    public async DeleteQueue(ids: any[]): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const implodedString = ids.join("', '");
            const [del_result] = await connection.query<ResultSetHeader>(`DELETE FROM queue_messages WHERE queue_id IN('${implodedString}')`);
            
            if(del_result.affectedRows>0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async MarkAsErrored(ids: any[]): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const implodedString = ids.join("', '");
            const [up_result] = await connection.query<ResultSetHeader>(`UPDATE queue_messages SET status='Errored' WHERE queue_id IN('${implodedString}')`);
            
            if(up_result.affectedRows >= 0){
                return true;
            } else{
                return false;
            }

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}