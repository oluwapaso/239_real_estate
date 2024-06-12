import { Helpers } from "@/_lib/helpers";
import { MysqlListingsRepo } from "@/_repo/listings_repo";
import { ListingsFields, ListsindJsonFields } from "@/components/data"; 
import { APIResponseProps } from "@/components/types";
import { NextApiRequest } from "next";
 
export class ListingsService {
    
    listings_repo = new MysqlListingsRepo();
    helpers = new Helpers();

    public async AddNewListing(listings: any): Promise<boolean> {

        if(listings.length > 0){

            await listings.forEach(async (elem: any) => {
                
                const fields: string[] = [];
                const values: any[] = [];
                //let values = "";
                let update_cond = "";
                
                ListingsFields.forEach(field => {
                    
                    //If field exists in data object, then we are game!
                    if(field in elem){

                        fields.push(field);
                        let value = elem[field];
                        //values += `'${value}',`;

                        if(ListsindJsonFields.includes(field)){
                            values.push(JSON.stringify(value));
                        }else{
                            values.push(`${value}`);
                        }
                        
                        
                        /** Build for update **/
                        update_cond += `${field}=VALUES(${field}),`;
                        /** Build for update **/
                        
                    }

                });                

                const field_string = fields.join(",");
                if(field_string && field_string!="" && values && values.length > 0 ){

                    const placeholders = Array.from({length: values.length}, () => "?").join(", ");
                    update_cond = this.helpers.rTrim(update_cond, ",");
                    //values = this.helpers.rTrim(values, ",");
                    
                    const isAdded = this.listings_repo.AddNewListing(field_string, values, placeholders, update_cond);

                }

            });

            console.log("Done");
            return true;

        }else{
            return false;
        }

    }

    public async LoadListings(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const search_by = req_body.search_by;
        
        if(!search_by || search_by == ""){
            default_resp.message = "Invalid search type provided.";
        }else{

            console.log("Host:", process.env.NEXT_PUBLIC_DB_HOST)
            const [search_filter, order_by] = this.helpers.BuildSearchFilter(req);
            if(req_body.log_search == "Yes" && req_body.user_id && req_body.user_id !=""){
                this.listings_repo.LogSearch(req);
            }
            const prop_prms = this.listings_repo.LoadListings(req, search_filter, order_by);
            const properties = await prop_prms;
            default_resp.success = true;
            default_resp.data = {properties: properties};

        }

        return default_resp;

    }

    public async LoadSingleProperty(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const prop_key = req_body.prop_key;
        
        if(!prop_key || prop_key == ""){
            default_resp.message = "Invalid property info provided.";
        }else{
            
            const prop_prms = this.listings_repo.LoadSingleProperty(prop_key);
            const property = await prop_prms;
            default_resp.success = property.found;
            default_resp.data = {property: property};

        }

        return default_resp;

    }

    public async LoadSimilarListings(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const prop_key = req_body.prop_key;
        
        if(!prop_key || prop_key == ""){
            default_resp.message = "Invalid property info provided.";
        }else{
            
            const prop_prms = this.listings_repo.LoadSimilarListings(req);
            const properties = await prop_prms;
            default_resp.success = true;
            default_resp.data = {properties: properties};

        }

        return default_resp;

    }

    public async LiveSearch(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const keyword = req_body.keyword;
        const search_by = req_body.search_by;

        if(!keyword || keyword == "" || !search_by || search_by == ""){
            default_resp.message = "Invalid search term provided.";
        }else{
            
            const srch_prms = this.listings_repo.LiveSearch(keyword, search_by);
            const results = await srch_prms;
            default_resp.success = true;
            default_resp.data = {results: results};

        }

        return default_resp;

    }

    public async UpdateFavorites(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const listing_id = req_body.listing_id;
        const user_id = req_body.user_id;
        const type = req_body.type;
        
        if(!listing_id || listing_id == "" || !user_id || user_id == "" || !type || type == ""){
            default_resp.message = "Fatal error.";
        }else{
            
            const fav_prms = this.listings_repo.UpdateFavorites(req);
            const favorites = await fav_prms;
            default_resp.success = true;
            default_resp.data = {favorites: favorites};

        }

        return default_resp;

    }

    public async SaveSearches(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const req_body = req.body;
        const search_title = req_body.search_title;
        const user_id = req_body.user_id;
        
        if(!search_title || search_title == "" || !user_id || user_id == ""){
            default_resp.message = "Fatal error.";
        }else{
            
            const resp_prms = this.listings_repo.SaveSearches(req);
            const resp = await resp_prms;
            default_resp.success = resp.success as boolean;
            default_resp.message = resp.message;
            default_resp.data = resp.data;

        }

        return default_resp;

    }

    public async LoadSavedSearches(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const srch_prms = this.listings_repo.LoadSavedSearches(req);
        const searches = await srch_prms;
        default_resp.success = true;
        default_resp.data = {searches: searches};

        return default_resp;

    }

    public async DeleteSavedSearches(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const del_prms = this.listings_repo.DeleteSavedSearches(req);
        const response = await del_prms;
        default_resp.success = response;

        return default_resp;

    }
   
   public async UpdateFeaturedListingsSettings(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const up_prms = this.listings_repo.UpdateFeaturedListingsSettings(req);
        const response = await up_prms;

        if(response){
            default_resp.success = true;
            default_resp.message = "Featured listings settings successfully updated";
        }else{
            default_resp.message = "Unable to update featured listings settings";
        }

        return default_resp;

    }

}