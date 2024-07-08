import pool from "@/_lib/db_conn";
import { AcknowledgeRequestParams,LoadRequestsParams,ProperyRequests } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface RequestRepo { 
    LoadRequests(params: LoadRequestsParams): Promise<ProperyRequests[] | null>
    AcknowledgeRequest(params: AcknowledgeRequestParams) : Promise<boolean>
    AcknowledgeMultiRequests(request_ids: string) : Promise<boolean>
}

export class MYSQLRequestRepo implements RequestRepo {
 

    public async LoadRequests(params: LoadRequestsParams): Promise<ProperyRequests[] | null> {

        const paginated = params.paginated;
        let request_type = params.request_type;
        let rows: RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            if(paginated){
            
                const page = params.page;
                const limit = params.limit;
                const start_from = (page - 1) * limit;
                request_type = request_type.replace("Requests", "Request"); //replace the s

                [rows] = await connection.query<RowDataPacket[]>(`SELECT r.*, u.firstname, u.lastname, (SELECT COUNT(*) AS total_records 
                FROM property_requests WHERE request_type='${request_type}') AS total_records FROM property_requests AS r JOIN users AS u 
                ON r.user_id=u.user_id WHERE r.request_type='${request_type}' ORDER BY r.date_added ASC LIMIT ${start_from}, ${limit}`);
                
            }else{
                [rows] = await connection.query<RowDataPacket[]>(`SELECT r.*, u.firstname, u.lastname FROM property_requests AS r 
                JOIN users AS u ON r.user_id=u.user_id WHERE r.request_type='${request_type}' ORDER BY t.date_added ASC `);

            }
    
            const formattedRows = rows.map((row) => {
    
                return {
                    ...row,
                }

            });

            return formattedRows as ProperyRequests[] | null;

        }catch(e: any){
            console.log(e.sqlMessage)
            return null; 
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }  

    public async AcknowledgeRequest(params: AcknowledgeRequestParams) : Promise<boolean>{

        const request_id = params.request_id;
        let connection: PoolConnection | null = null;

        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE property_requests SET status=? WHERE request_id=? `, ["Done", request_id]);
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

    public async AcknowledgeMultiRequests(request_ids: string) : Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE property_requests SET status=? WHERE request_id IN(${request_ids}) `, ["Done"]);
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