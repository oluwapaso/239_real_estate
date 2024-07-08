import { AddBatchMessageParams, BatchMailErrorsParams, BatchSMSErrorsParams, QueueError, SentMailParams, SetBatchMessageStatsParams } from "@/components/types";
import pool from "@/_lib/db_conn";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";
import { MYSQL_SMS_Repo } from "./sms_repo";

export interface MailRepo { 
    AddSentMail(params: SentMailParams): Promise<boolean>
    AddMailToQueue(params: SentMailParams): Promise<boolean>
    GetQueuedEmails(): Promise<any>
    DeleteQueue(ids: any[]): Promise<boolean>
    MarkAsErrored(ids: any[]): Promise<boolean>
    AddBatchMessage(params: AddBatchMessageParams): Promise<[boolean, number]>
    SetBatchMessageStats(params: SetBatchMessageStatsParams): Promise<boolean>
    LogBatchMailErrors(params: BatchMailErrorsParams[]): Promise<boolean>
    UpdateBatchMessageStats(ids: any[]): Promise<boolean>
    CountBatchMessageStats(ids: any[]): Promise<boolean>
}

export class MYSQLMailRepo implements MailRepo {

    sms_repo = new MYSQL_SMS_Repo();
    public async AddSentMail(params: SentMailParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const message_body = params.body;
            const from_email = params.from_email;
            const to_email = params.to_email;
            const subject = params.subject;
            const message_type = params.message_type;
            const batch_id = params.batch_id;
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();
            
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO logged_messages(user_id, from_info, to_info, subject, message_body, message_kind, message_type, batch_id, 
                date_added) VALUES(?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, from_email, to_email, subject, message_body, "Email", message_type, 
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

    public async AddMailToQueue(params: SentMailParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const message_body = params.body;
            const from_email = params.from_email;
            const to_email = params.to_email;
            const subject = params.subject;
            const message_type = params.message_type;
            const batch_id = params.batch_id;
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();

            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO queue_messages(user_id, message_type, message_kind, from_info, to_info, subject, email_body, batch_id, date_queued) 
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?) `, [user_id, message_type, "Email", from_email, to_email, subject, message_body, batch_id, date]
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
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM queue_messages WHERE message_kind='Email' 
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

    public async AddBatchMessage(params: AddBatchMessageParams): Promise<[boolean, number]>{

        let connection: PoolConnection | null = null;
        try{

            const type = params.type;
            const total_messages = params.total_messages;
            const temp_name  = params.template_name;
            const now = moment().format("YYYY-MM-DD HH:mm:ss");

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO batch_messages(message_type, template_name, total_messages, date_sent) VALUES(?, ?, ?, ?) `, 
                [type, temp_name, total_messages, now]
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

    public async SetBatchMessageStats(params: SetBatchMessageStatsParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{
 
            const errored = params.errored;
            const unsubscribed  = params.unsubscribed;
            const queued  = params.queued;
            const batch_id  = params.batch_id;
            let status = "Pending";
            
            if(queued < 1){
                status = "Done";
            }

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(` 
                UPDATE batch_messages SET status=?, queued=?, total_errored=?, unsubscribed=? WHERE batch_id=?`, 
                [status, queued, errored, unsubscribed, batch_id]
            );
            
            if(result.affectedRows>=0){
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

    public async LogBatchMailErrors(params: BatchMailErrorsParams[]): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            let values: any[] = []
            let placeholders = ""
            if(params && params.length > 0){

                const now = moment().format("YYYY-MM-DD HH:mm:ss")
                params.forEach((err)=> {
                    placeholders += "?, ";
                    values.push([err.user_id, err.batch_id, err.to_email, err.error, now])
                });

            }else{
                return false;
            }

            const flatten_values = values.flat();
            placeholders = values.map(() => `(?, ?, ?, ?, ?)`).join(", ")

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO batch_message_errors(user_id, batch_id, to_email, error_message, date_added) VALUES${placeholders} `, flatten_values);
            
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
                const isEmlErrAdded = await this.LogBatchMailErrors(batch_email_errors);
                 console.log("isEmlErrAdded in mail_repo:", isEmlErrAdded);
            }

            //Log batch email errors 
            if(batch_sms_errors.length > 0){
                const isSMSErrAdded = await this.sms_repo.LogBatchSMSErrors(batch_sms_errors);
                console.log("isSMSErrAdded in mail_repo:", isSMSErrAdded);
            }

            //Delete queues
            if(queue_to_delete && queue_to_delete.length > 0){
                const delQueue = await this.DeleteQueue(queue_to_delete);
                console.log("DelQueue in mail_repo:", delQueue);
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