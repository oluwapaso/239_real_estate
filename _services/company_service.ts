import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { APIResponseProps, UpdateAPIParams, UpdateCompanyParams, UpdatePrivacyAndTermsParams } from "@/components/types";

 
export class CompanyService {
    
    comp_repo = new MYSQLCompanyRepo();

    public async UpdateCompanyInfo(params: UpdateCompanyParams):Promise<APIResponseProps>{

        const company_id = params.company_id
        const company_name = params.company_name
        const default_email = params.default_email
        const contact_us_email = params.contact_us_email
        const buying_email = params.buying_email
        const selling_req_email = params.selling_req_email

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!company_name || !default_email || !contact_us_email || !buying_email  || !selling_req_email){
            default_resp.message = "Company name, buying email, selling email, contact us email and default email are required"
            return default_resp as APIResponseProps
        }

        if(company_id != 1){
            default_resp.message = "Invalid account info provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.comp_repo.UpdateCompayInfo(params)
        return resp;

    }

    public async UpdateApiInfo(params: UpdateAPIParams):Promise<APIResponseProps>{

        const resp = await this.comp_repo.UpdateApiInfo(params);
        return resp;

    }

    public async UpdateleadStages(lead_stages: any):Promise<APIResponseProps>{

        const resp = await this.comp_repo.UpdateLeadStages(lead_stages);
        return resp;

    }

    public async UpdatePrivacyAndTerms(params: UpdatePrivacyAndTermsParams):Promise<APIResponseProps>{

        const update_type = params.update_type
        const value = params.value

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!value){
            default_resp.message = "Content can not be empty."
            return default_resp as APIResponseProps
        }

        if(update_type != "Privacy" && update_type != "Terms" && update_type != "Disclaimer" && update_type != "About Us"){
            default_resp.message = "Invalid update type provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.comp_repo.UpdatePrivacyAndTerms(params)
        return resp;

    }

}