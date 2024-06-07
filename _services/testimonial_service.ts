import { Helpers } from "@/_lib/helpers";
import { MYSQLTestimonialRepo } from "@/_repo/testimonial_repo";
import { APIResponseProps, AddTestimonialParams, GetTestimonialParams, UpdateTestimonialParams } from "@/components/types";

export class TestimonialService {

    testi_repo = new MYSQLTestimonialRepo();
    helpers = new Helpers();

    public async GetAllTestimonial(params: GetTestimonialParams):Promise<APIResponseProps>{

        const resp = await this.testi_repo.GetAllTestimonial({params})
        return resp;

    }

    public async GetTestimonialInfo(params: number):Promise<APIResponseProps>{
        const resp = await this.testi_repo.GetTestimonialInfo(params)
        return resp;
    }

    public async AddNewTestimonial(params: AddTestimonialParams):Promise<APIResponseProps>{

        const fullname = params.fullname;
        const account_type = params.account_type;
        const testimonial = params.testimonial;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!fullname || !account_type || !testimonial){
            default_resp.message = "All fields are required."
            return default_resp as APIResponseProps
        }

        const resp = await this.testi_repo.AddNewTestimonial({params})
        return resp;

    }

    public async UpdateTestimonialInfo(params: UpdateTestimonialParams):Promise<APIResponseProps>{

        const testimonial_id = params.testimonial_id;
        const fullname = params.fullname;
        const account_type = params.account_type;
        const testimonial = params.testimonial;

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!account_type || !fullname || !testimonial){
            default_resp.message = "All fields are required."
            return default_resp as APIResponseProps
        }

        if(!testimonial_id){
            default_resp.message = "Invalid testimonial info provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.testi_repo.UpdateTestimonial(params)
        return resp;

    }

    public async DeleteTestimonialInfo(testimonial_id: number):Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!testimonial_id){
            default_resp.message = "Invalid testimonial info provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.testi_repo.DeleteTestimonial(testimonial_id)
        return resp;

    }

}
