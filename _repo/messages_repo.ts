import pool from "@/_lib/db_conn";
import { BatchMessages, BatchMessageStats, LoadBatchMessagesParams,LoadBatchMessageStatsParams,LoadSingleBatchMessageParams, PendingBatchEmail, SentBatchEmail, UnsubscribedBatchEmail } from "@/components/types";
import { RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface MessagesRepo { 
    LoadBatchMessages(params: LoadBatchMessagesParams): Promise<BatchMessages[] | null>
    LoadSingleBatchMessage(params: LoadSingleBatchMessageParams): Promise<BatchMessages | null>
    LoadBatchMessageStats(params: LoadBatchMessageStatsParams): Promise<BatchMessageStats[] | PendingBatchEmail[] | SentBatchEmail[] |
    UnsubscribedBatchEmail[] | null>
}

export class MYSQLMessagesRepo implements MessagesRepo {
 

    public async LoadBatchMessages(params: LoadBatchMessagesParams): Promise<BatchMessages[] | null> {

        const paginated = params.paginated;
        let message_type = params.message_type;
        let rows: RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;

                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM batch_messages 
                WHERE message_type='${message_type}') AS total_records FROM batch_messages WHERE message_type='${message_type}' 
                ORDER BY date_sent ASC LIMIT ${start_from}, ${limit}`);
                
            }else{
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM batch_messages WHERE message_type='${message_type}' 
                ORDER BY date_sent ASC `);

            }
    
            const formattedRows = rows.map((row) => {
    
                return {
                    ...row,
                }

            });

            return formattedRows as BatchMessages[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadSingleBatchMessage(params: LoadSingleBatchMessageParams): Promise<BatchMessages | null> {

        const batch_id = params.batch_id;

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM batch_messages WHERE batch_id='${batch_id}'`);

            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                }
            });

            return formattedRows[0] as BatchMessages | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async LoadBatchMessageStats(params: LoadBatchMessageStatsParams): 
    Promise<BatchMessageStats[] | PendingBatchEmail[] | SentBatchEmail[] | UnsubscribedBatchEmail[] | null> {

        const batch_id = params.batch_id;
        let message_type = params.message_type;
        const page = params.page;
        const limit = params.limit;
        const start_from = (page - 1) * limit;

        let rows: RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            if(message_type == "Pending"){

                [rows] = await connection.query<RowDataPacket[]>(`SELECT q.queue_id, q.to_info, q.status, q.error_message, q.date_queued, 
                u.firstname, u.lastname, u.email, (SELECT COUNT(*) AS total_records FROM queue_messages WHERE batch_id=?) AS total_records 
                FROM queue_messages AS q JOIN users AS u ON q.user_id=u.user_id WHERE q.batch_id=? ORDER BY q.date_queued ASC 
                LIMIT ${start_from}, ${limit}`, [batch_id, batch_id]);

                const formattedRows = rows.map((row) => {
    
                    return {
                        ...row,
                    };

                })

                return formattedRows  as PendingBatchEmail[] | null;
            
            } else if(message_type == "Sent"){

                [rows] = await connection.query<RowDataPacket[]>(`SELECT m.message_id, m.to_info, m.date_added, u.firstname, u.lastname, 
                u.email, (SELECT COUNT(*) AS total_records FROM logged_messages WHERE batch_id=?) AS total_records FROM logged_messages AS m 
                JOIN users AS u ON m.user_id=u.user_id WHERE m.batch_id=? ORDER BY m.date_added ASC LIMIT ${start_from}, ${limit}`, 
                [batch_id, batch_id]);

                const formattedRows = rows.map((row) => {
    
                    return {
                        ...row,
                    };

                })

                return formattedRows  as SentBatchEmail[] | null;
            
            } else if(message_type == "Unsubscribed"){

                const filter_1 = "User unsubscribed from receiving mass email. You can still contact them individually";
                const filter_2 = "User unsubscribed from receiving mass sms. You can still contact them individually";

                [rows] = await connection.query<RowDataPacket[]>(`SELECT m.error_id, m.to_email, m.to_phone, m.date_added, u.firstname, 
                u.lastname, u.email, (SELECT COUNT(*) AS total_records FROM batch_message_errors WHERE batch_id=? 
                AND (error_message=? OR error_message=?)) AS total_records FROM batch_message_errors AS m JOIN users AS u 
                ON m.user_id=u.user_id WHERE m.batch_id=? AND (m.error_message=? OR m.error_message=?) ORDER BY m.date_added ASC 
                LIMIT ${start_from}, ${limit}`, [batch_id, filter_1, filter_2, batch_id, filter_1, filter_2]);

                const formattedRows = rows.map((row) => {
    
                    return {
                        ...row,
                    };

                })

                return formattedRows  as UnsubscribedBatchEmail[] | null;
            
            }else {
                return null;
            }

            
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