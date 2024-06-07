import { NotesService } from "@/_services/notes_services";
import { AddNotesParams, DeleteNoteParams, MarkTaskAsDoneParams } from "@/components/types";
import { NextApiRequest, NextApiResponse } from "next"

const note_service = new NotesService();

export default async function handler(req: NextApiRequest, resp: NextApiResponse<any>){

    if(req.method == "OPTIONS"){
        resp.status(200)
    } else if(req.method == "POST"){
        
        const req_body = req.body;
        const payload: AddNotesParams = {
            user_id: req_body.user_id,
            notes: req_body.notes,
            notes_type: req_body.notes_type,
            number_called: req_body.number_called
        }

        const response = await note_service.AddNewNote(payload);
        resp.status(200).json(response);

    } else if(req.method == "DELETE"){
        
        const req_body = req.body;
        const payload: DeleteNoteParams = {
            note_id: req_body.note_id
        }
        
        const response = await note_service.DeleteNote(payload);
        resp.status(200).json(response);

    } else{
        resp.status(405).end();
    }

}
