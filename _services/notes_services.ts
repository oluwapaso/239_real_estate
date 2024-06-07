import { Helpers } from "@/_lib/helpers";
import { MYSQLNotesRepo } from "@/_repo/notes_repo";
import { APIResponseProps, AddNotesParams, DeleteNoteParams } from "@/components/types";

export class NotesService {

    note_repo = new MYSQLNotesRepo();
    helpers = new Helpers();

    public async AddNewNote(params: AddNotesParams):Promise<APIResponseProps>{

        const user_id = params.user_id;
        const notes = params.notes;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }
 
        if(!user_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        if(!notes || notes == ""){
            default_resp.message = "All fields are required."
            return default_resp as APIResponseProps
        }

        const [is_added, note_id] = await this.note_repo.AddNewNote(params);
        default_resp.success = is_added;
        
        if(is_added){
            default_resp.message = "Note succesfully added";
            default_resp.data = {note_id:note_id};
        }else{
            default_resp.message = "Unable to add new note";
        }
        return default_resp;

    }

    public async DeleteNote(params: DeleteNoteParams):Promise<APIResponseProps>{

        const note_id = params.note_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!note_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        const is_deleted = await this.note_repo.DeleteNote(params);
        default_resp.success = is_deleted;
        
        if(is_deleted){
            default_resp.message = "Note succesfully deleted";
        }else{
            default_resp.message = "Unable to delete note";
        }
        return default_resp;

    }

}