import { BatchMailErrorsParams, BatchSMSErrorsParams, QueueError, SendSMSParams, SentSMSParams } from "@/components/types";
import pool from "@/_lib/db_conn";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";
import { Helpers } from "@/_lib/helpers";
import { MYSQLMailRepo } from "./mail_repo";

export interface SMS_Repo { 
    AddSentSMS(params: SentSMSParams): Promise<boolean>
    Add_SMS_ToQueue(params: SendSMSParams): Promise<boolean>
    LogBatchSMSErrors(params: BatchSMSErrorsParams[]): Promise<boolean>
    GetQueuedSMS(): Promise<any>
    DeleteQueue(ids: any[]): Promise<boolean>
    MarkAsErrored(error_info: QueueError[]): Promise<boolean>
    UpdateBatchMessageStats(ids: any[]): Promise<boolean>
    CountBatchMessageStats(ids: any[]): Promise<boolean>
}

export class MYSQL_SMS_Repo implements SMS_Repo {

    public async AddSentSMS(params: SentSMSParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const message_body = params.body;
            const form_number = params.form_number;
            const to_number = params.to_number;
            const message_type = params.message_type;
            const batch_id = params.batch_id;
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();
            
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO logged_messages(user_id, from_info, to_info, message_body, message_kind, message_type, batch_id, 
                date_added) VALUES(?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, form_number, to_number, message_body, "SMS", message_type, 
                batch_id, date]
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
                INSERT INTO queue_messages(user_id, message_type, message_kind, from_info, to_info, sms_body, batch_id, date_queued) 
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
    
    public async GetQueuedSMS(): Promise<any> {

        let connection: PoolConnection | null = null;
        try{
        
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM queue_messages WHERE message_kind='SMS' 
            AND status='Pending' ORDER BY date_queued ASC LIMIT 10`);

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

    public async MarkAsErrored(error_info: QueueError[]): Promise<boolean>{
        
        const connection = await pool.getConnection();
        try{

            if (!connection) {
                return false;
            }

            if(error_info && error_info.length > 0){

                await Promise.all(error_info.map(async (err) => {
                    await connection.query<ResultSetHeader>(`UPDATE queue_messages SET status='Errored', error_message=? WHERE queue_id=?`, 
                    [err.error_message, err.queue_id]);
                }))

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
    
    public async UpdateBatchMessageStats(ids: any[]): Promise<boolean>{

        let connection = await pool.getConnection();
        try{

            let queue_to_delete: any[] = [];
            let batch_email_errors: BatchMailErrorsParams[] = [];
            let batch_sms_errors: BatchSMSErrorsParams[] = [];

            await Promise.all(ids.map(async (batchId) => {
                
                const [queueRow] = await connection.query<RowDataPacket[]>(`SELECT queue_id, batch_id, user_id, message_kind, to_info, error_message FROM queue_messages WHERE batch_id=? AND status='Errored'`, [batchId]);
                if(queueRow.length){
                    const formattedRows = queueRow.map((row) => {
                        return {
                            ...row,
                        }
                    });

                    if(formattedRows && formattedRows.length > 0){
                        formattedRows.forEach((row) => {

                            let batchErr = {
                                user_id: row["user_id"], 
                                batch_id: row["batch_id"],  
                                error: row["error_message"],
                                to_email: "",
                                to_phone: "",
                            }

                            if(row["message_kind"] == "Email"){

                                batchErr.to_email = row["to_info"];
                                batch_email_errors.push(batchErr);

                            }else if(row["message_kind"] == "SMS"){

                                batchErr.to_phone = row["to_info"]
                                batch_sms_errors.push(batchErr);

                            }

                            queue_to_delete.push(row["queue_id"]);

                        })
                    }
                }

            }))

            //Log batch email errors 
            if(batch_email_errors.length > 0){
                const email_repo = new MYSQLMailRepo();
                const isEmlErrAdded = await email_repo.LogBatchMailErrors(batch_email_errors);
                 console.log("isEmlErrAdded in sms_repo:", isEmlErrAdded);
            }

            //Log batch email errors 
            if(batch_sms_errors.length > 0){
                const isSMSErrAdded = await this.LogBatchSMSErrors(batch_sms_errors);
                console.log("isSMSErrAdded in sms_repo:", isSMSErrAdded);
            }

            //Delete queues
            if(queue_to_delete && queue_to_delete.length > 0){
                const delQueue = await this.DeleteQueue(queue_to_delete);
                console.log("DelQueue in sms_repo:", delQueue);
            }

            return true;

        }catch(e:any){
            console.log(e.message);
            return false;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async CountBatchMessageStats(ids: any[]): Promise<boolean>{

        let connection = await pool.getConnection();
        try{

            const uniqueIds = Array.from(new Set(ids));
            await Promise.all(uniqueIds.map(async (batchId) => {
                
                const filter_1 = "User unsubscribed from receiving mass email. You can still contact them individually";
                const filter_2 = "User unsubscribed from receiving mass sms. You can still contact them individually";

                const [queueRow] = await connection.query<RowDataPacket[]>(`SELECT
                (SELECT COUNT(*) FROM batch_message_errors WHERE batch_id='${batchId}' AND (error_message!='${filter_1}' 
                AND error_message!='${filter_2}')) as Errors,
                (SELECT total_messages FROM batch_messages WHERE batch_id='${batchId}') as TotalMessages,
                (SELECT unsubscribed FROM batch_messages WHERE batch_id='${batchId}') as Unsubscribe,
                (SELECT COUNT(*) FROM queue_messages WHERE batch_id='${batchId}' AND status='Pending') as Pending,
                (SELECT COUNT(*) FROM logged_messages WHERE batch_id='${batchId}') as Sent`);

                if(queueRow.length){
                    const formattedRows = queueRow.map((row) => {
                        return {
                            ...row,
                        }
                    });

                    if(formattedRows && formattedRows.length > 0){

                        const Pending = parseInt(formattedRows[0]["Pending"]);
                        const Sent = parseInt(formattedRows[0]["Sent"]);
                        const Errors = parseInt(formattedRows[0]["Errors"]);
                        const Unsubscribe = parseInt(formattedRows[0]["Unsubscribe"]);
                        const TotalMessages = parseInt(formattedRows[0]["TotalMessages"]);
                        const total_processed = Unsubscribe +Sent + Errors;

                        let status = "Pending";
                        if(total_processed>=TotalMessages){
                            status = "Done";
                        }

                        await connection.query<ResultSetHeader>(`UPDATE batch_messages SET queued=?, total_sent=?, total_errored=?, status=? 
                        WHERE batch_id=?`, [Pending, Sent, Errors, status, batchId]);
                    }
                }

            }))

            return true;

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