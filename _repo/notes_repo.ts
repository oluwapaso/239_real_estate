import pool from "@/_lib/db_conn";
import { AddNotesParams, DeleteNoteParams, LoadUserNotesParams, Note } from "@/components/types";
import moment from "moment";
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { PoolConnection } from "mysql2/promise";

export interface NotesRepo { 
    AddNewNote(params: AddNotesParams): Promise<[boolean, number]>
    LoadUserNotes(params: LoadUserNotesParams): Promise<Note[] | null>
    DeleteNote(params: DeleteNoteParams): Promise<boolean>
}

export class MYSQLNotesRepo implements NotesRepo {

    public async AddNewNote(params: AddNotesParams): Promise<[boolean, number]>{

        let connection: PoolConnection | null = null;
        try{

            const user_id = params.user_id;
            const notes = params.notes;
            const notes_type = params.notes_type || "Notes";
            const number_called = params.number_called || "";
            const property_id = params.property_id || "";
            const property_address = params.property_address || "";
            const date = moment().format("YYYY-MM-DD H:m:s");
            connection = await pool.getConnection();

            const [result] = await connection.query<ResultSetHeader>(` 
                INSERT INTO notes(user_id, notes, notes_type, number_called, property_id, property_address, date_added) 
                VALUES(?, ?, ?, ?, ?, ?, ?) `, [user_id, notes, notes_type, number_called, property_id, property_address, date]
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

    public async LoadUserNotes(params: LoadUserNotesParams): Promise<Note[] | null> {

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const user_id = params.user_id;
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM notes WHERE user_id=?`, [user_id]);

            if(rows.length){
                const formattedRows = rows.map((row) => {
                    return {
                        ...row,
                    } as Note
                });
                return formattedRows;
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

    public async DeleteNote(params: DeleteNoteParams): Promise<boolean>{

        let connection: PoolConnection | null = null;
        try{

            connection = await pool.getConnection();
            const note_id = params.note_id;
            const [result] = await connection.query<ResultSetHeader>(`DELETE FROM notes WHERE note_id=? `, [note_id]);
            
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