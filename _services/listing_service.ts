import { Helpers } from "@/_lib/helpers";
import { MYSQLCompanyRepo } from "@/_repo/company_repo";
import { MysqlListingsRepo } from "@/_repo/listings_repo";
import { ListingsFields, ListingsJsonFields } from "@/components/data"; 
import { APIResponseProps } from "@/components/types";
import { NextApiRequest } from "next";
import numeral from "numeral";
 
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

                        if(ListingsJsonFields.includes(field)){
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
                    
                    const isAdded = this.listings_repo.AddNewListing("defaultClass", field_string, values, placeholders, 
                    update_cond, "{}");

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

            const [search_filter, order_by] = this.helpers.BuildSearchFilter(req);
            if(req_body.log_search == "Yes" && req_body.user_id && req_body.user_id !=""){
                this.listings_repo.LogSearch(req);
            }
            const prop_prms = this.listings_repo.LoadListings(req, search_filter, order_by);
            const properties = await prop_prms;
            default_resp.success = true;
            default_resp.data = {properties: properties, search_filter: search_filter};

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

    public async PostToFacebook(req: NextApiRequest): Promise<APIResponseProps>{

         const default_resp = {
            message: "",
            data: {},
            success: false,
        }

        const social_prms = this.listings_repo.GetSocialListings();
        const social = await social_prms;
 
        const com_repo = new MYSQLCompanyRepo();
        const api_info_prms = com_repo.GetApiInfo();
        const api_info = await api_info_prms

        // Get the page access token
        const pageAccessTokenResponse = await fetch(
        `https://graph.facebook.com/v15.0/me/accounts?access_token=${api_info.data.facebook_long_token}`
        );
        const pageAccessTokenData = await pageAccessTokenResponse.json();

        if (pageAccessTokenData.error) {
            default_resp.message = `Error: ${pageAccessTokenData.error.message}`;
            return default_resp;
        }

        const pageAccessToken = pageAccessTokenData.data[0].access_token;
        if (!pageAccessToken) {
            default_resp.message = `Page access token is missing`;
            return default_resp;
        }
        
        if(social.length){

            const sc = social[0];
             const address = this.helpers.ucwords(sc.FullAddress || sc.MLSAreaMajor || "new-lane").replace(/[^a-zA-Z0-9]+/g, "-") + "-" + sc.StateOrProvince + "-" + sc.PostalCode;
            const message = `
🏡 𝗡𝗲𝘄 𝗟𝗶𝘀𝘁𝗶𝗻𝗴 𝗶𝗻 ${sc.City}, ${sc.StateOrProvince} ${sc.PostalCode} !
🛏️ 𝗕𝗲𝗱𝗿𝗼𝗼𝗺𝘀: ${numeral(sc.BedsTotal).format("0,0")}
🛁 𝗧𝗼𝘁𝗮𝗹 𝗕𝗮𝘁𝗵𝗿𝗼𝗼𝗺𝘀: ${numeral(sc.BathsTotal).format("0,0")}
${sc.View ? `🌄 𝗩𝗶𝗲𝘄: ${sc.View}` : ''}
🏞️ 𝗟𝗼𝘁 𝗦𝗶𝘇𝗲: ${numeral(sc.TotalArea).format("0,0")} sqft 
🏠 𝗔𝗽𝗽𝗿𝗼𝘅 𝗟𝗶𝘃𝗶𝗻𝗴 𝗔𝗿𝗲𝗮: ${numeral(sc.ApproxLivingArea).format("0,0")} sqft 
${sc.Amenities ? `🎯 𝗔𝗺𝗲𝗻𝗶𝘁𝗶𝗲𝘀: ${sc.Amenities}` : ''}

👉 𝗙𝗼𝗿 𝗺𝗼𝗿𝗲 𝗱𝗲𝘁𝗮𝗶𝗹𝘀, 𝘃𝗶𝘀𝗶𝘁: ${process.env.NEXT_PUBLIC_BASE_URL}/listings/${sc.MLSNumber}/${address}`;

            let Images = [];
            if(sc.Images && typeof sc.Images == "string"){
                Images = JSON.parse(sc.Images);
            }

            let post_images = Images;
            if(Images.length>0){
                post_images = [Images[0], Images[1], Images[2], Images[3]];
            }

            await this.postPropertyWithImages(pageAccessToken, message, sc.facebook_page_id, post_images); 
            await com_repo.UpdateLast_FB_Post(sc.MatrixModifiedDT);

            default_resp.success = true;
            default_resp.message = "New property found";


        }else{
            default_resp.message = "No new property to post to facebook";
        }

        return default_resp;

    }

    // Function to upload an image from a URL and return its ID
    public uploadImageFromUrl: any = async (imageUrl: string, pageId: string, accessToken: string) => {
 
        try {

            const response = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: imageUrl,
                    published: false, // Prevent publishing each image separately
                    access_token: accessToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error.message);
            }

            return data.id; // Return the uploaded image ID

        } catch (error: any) {
            console.error('Error uploading image:', error);//error.response.data
        }
    };

    // Function to upload images and create a post with those images
    public postPropertyWithImages = async (accessToken: string, message: string, pageId: string, imageUrls: any[]) => {
        try {
            
            // Upload all images and get their IDs
            //const imageIds = await Promise.all(imageUrls.map(this.uploadImageFromUrl));

            // Bind `this` properly by using an arrow function or call `uploadImageFromUrl` with all parameters explicitly
            const imageIds = await Promise.all(
                imageUrls.map(imageUrl => this.uploadImageFromUrl(imageUrl, pageId, accessToken))
            );

            // Create an array of attached media objects
            const attachedMedia = imageIds.map(id => ({ media_fbid: id }));

            // Create the post with attached images and message
            const postResponse = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    attached_media: attachedMedia,
                    access_token: accessToken
                })
            });

            const postData = await postResponse.json();

            if (!postResponse.ok) {
                throw new Error(postData.error.message);
            }

            console.log('Post created successfully:', postData);
        } catch (error: any) {
            console.error('Error creating post:', error.message);
        }
    };

}