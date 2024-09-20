import pool from "@/_lib/db_conn";
import { APIResponseProps } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface SystemRepo { 
    GetDashboardData(): Promise<APIResponseProps>
}

export class MYSQLSystemRepo implements SystemRepo {

    public async GetDashboardData(): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<RowDataPacket[]>(`SELECT 
                (SELECT COUNT(*) AS total_users FROM users) AS Users, 
                (SELECT COUNT(*) AS pending_tasks FROM tasks WHERE status='Pending') AS Tasks, 
                (SELECT COUNT(*) AS pending_appointments FROM appointments WHERE status='Pending') AS Appointments, 
                (SELECT COUNT(*) AS buying_requests FROM property_requests WHERE request_type='Buying Request' AND status='Pending') AS BuyingRequest,
                (SELECT COUNT(*) AS selling_requests FROM property_requests WHERE request_type='Selling Request' AND status='Pending') AS SellingRequest,
                (SELECT COUNT(*) AS tour_requests FROM property_requests WHERE request_type='Tour Request' AND status='Pending') AS TourRequest,
                (SELECT COUNT(*) AS showing_requests FROM property_requests WHERE request_type='Showing Request' AND status='Pending') AS ShowingRequest,
                (SELECT COUNT(*) AS info_requests FROM property_requests WHERE request_type='Info Request' AND status='Pending') AS InfoRequest`);

            const formattedRows = result.map((row) => {
                return {
                    ...row,
                }
            });

            default_rep.success = true;
            default_rep.message = "Success.";
            default_rep.data = formattedRows[0];
            return default_rep;

        }catch(e: any){
            default_rep.message = e.sqlMessage;
            return default_rep;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}