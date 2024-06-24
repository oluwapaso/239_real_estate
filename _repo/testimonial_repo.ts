import pool from "@/_lib/db_conn";
import { APIResponseProps, AddTestimonialParams, AgentsType, GetTestimonialParams, Testimonials, UpdateTestimonialParams } from "@/components/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";

export interface TestimonialRepo {
    GetAllTestimonial({params}:{params: GetTestimonialParams}): Promise<APIResponseProps>
    AddNewTestimonial({params}:{params: AddTestimonialParams}): Promise<APIResponseProps>
    UpdateTestimonial(params: UpdateTestimonialParams): Promise<APIResponseProps>
    DeleteTestimonial(testimonial_id: number): Promise<APIResponseProps>
}

export class MYSQLTestimonialRepo implements TestimonialRepo {

    public async GetAllTestimonial({params}:{params: GetTestimonialParams}): Promise<APIResponseProps>{

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        const paginated = params.paginated
        const page = params.page
        const limit = params.limit
        const start_from = (page - 1) * limit
        let rows: RowDataPacket[] = [];

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            if(paginated){
                [rows] = await connection.query<RowDataPacket[]>(`SELECT *, (SELECT COUNT(*) AS total_records FROM testimonials) AS total_records 
                FROM testimonials LIMIT ${start_from}, ${limit}`); 
            }else{
                [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM testimonials`);  
            }

            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                } as Testimonials
            });
            
            default_rep.data = formattedRows;
            default_rep.success = true;

            return default_rep;

        }catch(e: any){
            console.log(e.message);
            return default_rep;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async GetTestimonialInfo(testimonial_id: number): Promise<APIResponseProps>{

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM testimonials WHERE testimonial_id=?`, [testimonial_id]); 

            const formattedRows = rows.map((row) => {
                return {
                    ...row,
                } as Testimonials
            });
            
            default_rep.data = formattedRows[0];
            default_rep.success = true;

            return default_rep;

        }catch(e: any){
            console.log(e.message);
            return default_rep;
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async AddNewTestimonial({params}:{params: AddTestimonialParams}): Promise<APIResponseProps> {

        const default_resp:APIResponseProps = {
            message:"",
            success:false,
            data: null
        }

        let connection: PoolConnection | null = null;
        const p = params;
        try{

            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO testimonials(fullname, account_type, testimonial) 
            VALUES (?, ?, ?) `, [p.fullname, p.account_type, p.testimonial]);
            
            default_resp.success = true;
            default_resp.message = "New testimonial successfully added";
            default_resp.data = {"testimonial_id":result.insertId}

        }catch(e: any){
            default_resp.message = e.sqlMessage
        }finally{
            if (connection) { 
                connection.release();
            }
        }

        return default_resp
    
    }

    public async UpdateTestimonial(params: UpdateTestimonialParams): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        const p = params;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`UPDATE testimonials SET fullname=?, account_type=?, testimonial=? 
            WHERE testimonial_id=?`, [p.fullname, p.account_type, p.testimonial, p.testimonial_id]);
            if(result.affectedRows >= 0){
                
                default_rep.success = true
                default_rep.message = "Testimonial info successfully updated."
                return default_rep

            }else{
                default_rep.message = "Unable to update testimonial."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

    public async DeleteTestimonial(testimonial_id: number): Promise<APIResponseProps> {

        const default_rep: APIResponseProps = {
            message: "",
            data: null,
            success: false,
        }

        let connection: PoolConnection | null = null;
        try{
            
            connection = await pool.getConnection();
            const [result] = await connection.query<ResultSetHeader>(`DELETE FROM testimonials WHERE testimonial_id=?`, [testimonial_id]);
            if(result.affectedRows > 0){
                
                default_rep.success = true
                default_rep.message = "Testimonial successfully deleted."
                return default_rep

            }else{
                default_rep.message = "Unable to delete testimonial."
                return default_rep
            }

        }catch(e: any){
            default_rep.message = e.sqlMessage
            return default_rep
        }finally{
            if (connection) { 
                connection.release();
            }
        }

    }

}  