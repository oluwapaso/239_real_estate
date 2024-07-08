import { BatchSMSErrorsParams, SendSMSParams } from "@/components/types";
import pool from "@/_lib/db_conn";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";
import { Helpers } from "@/_lib/helpers";

export interface SMS_Repo { 
    Add_SMS_ToQueue(params: SendSMSParams): Promise<boolean>
    LogBatchSMSErrors(params: BatchSMSErrorsParams[]): Promise<boolean>
}

export class MYSQL_SMS_Repo implements SMS_Repo {

    public async Add_SMS_ToQueue(params: SendSMSParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const message_body = params.body;
            const from_phone = params.from_phone;
            const to_phone = params.to_phone;
            const message_type = params.message_type;
            const batch_id = params.batch_id;
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();

            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO queue_messages(user_id, message_type, message_kind, from_info, to_info, email_body, batch_id, date_queued) 
                VALUES(?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, message_type, "SMS", from_phone, to_phone, message_body, batch_id, date]
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

    public async LogBatchSMSErrors(params: BatchSMSErrorsParams[]): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            let values: any[] = []
            let placeholders = ""
            if(params && params.length > 0){

                const now = moment().format("YYYY-MM-DD HH:mm:ss")
                params.forEach((err)=> {
                    placeholders += "?, ";
                    values.push([err.user_id, err.batch_id, err.to_phone, err.error, now])
                });

            }else{
                return false;
            }
 
            const flatten_values = values.flat(); 
            placeholders = values.map(() => `(?, ?, ?, ?, ?)`).join(", ") 

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO batch_message_errors(user_id, batch_id, to_phone, error_message, date_added) VALUES${placeholders} `, flatten_values);
            
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

}