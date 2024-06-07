import { Helpers } from "@/_lib/helpers";
import { MYSQLTemplateRepo } from "@/_repo/templates_repo";
import { APIResponseProps, AddTemplateParams, UpdateTemplateParams } from "@/components/types";

export class TemplatesService {

    testi_repo = new MYSQLTemplateRepo();
    helpers = new Helpers();

    // public async GetAllTemplate(params: GetTestimonialParams):Promise<APIResponseProps>{

    //     const resp = await this.testi_repo.GetAllTestimonial({params})
    //     return resp;

    // }

    // public async GetTestimonialInfo(params: number):Promise<APIResponseProps>{
    //     const resp = await this.testi_repo.GetTestimonialInfo(params)
    //     return resp;
    // }

    public async AddNewTemplalte(params: AddTemplateParams):Promise<APIResponseProps>{

        const template_type = params.template_type;
        const template_name = params.template_name;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!template_type || !template_name){
            default_resp.message = "Template type and name are required."
            return default_resp as APIResponseProps
        }

        const [is_added, temp_id, message] = await this.testi_repo.AddNewTemplate(params);
        default_resp.success = is_added;
        default_resp.data = {"temp_id":temp_id};
        default_resp.message = message;
        return default_resp;

    }

    public async UpdateTemplateInfo(params: UpdateTemplateParams):Promise<APIResponseProps>{

        const template_type = params.template_type;
        const template_name = params.template_name;
        const template_id = params.template_id;

        const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        if(!template_id){
            default_resp.message = "Fatal error."
            return default_resp as APIResponseProps
        }

        if(!template_type || !template_name){
            default_resp.message = "Template type and name are required."
            return default_resp as APIResponseProps
        }

        const is_updated = await this.testi_repo.UpdateTemplateInfo(params);
        default_resp.success = is_updated;
        default_resp.data = {"template_id":template_id};
        if(is_updated){
            default_resp.message = "Template succesfully updated";
        }else{
            default_resp.message = "Unable to update template";
        }
        return default_resp;

    }

    // public async DeleteTemplate(testimonial_id: number):Promise<APIResponseProps>{

    //     const default_resp = {
    //         message: "",
    //         data: null,
    //         success: false,
    //     }

    //     if(!testimonial_id){
    //         default_resp.message = "Invalid testimonial info provided."
    //         return default_resp as APIResponseProps
    //     }

    //     const resp = await this.testi_repo.DeleteTestimonial(testimonial_id)
    //     return resp;

    // }

}
