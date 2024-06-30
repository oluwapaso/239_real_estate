import { RootState } from "@/app/(admin)/admin/GlobalRedux/store";
import { APIResponseProps, AgentsType, Appointment, AutoResponderDetails, AutoResponderLists, AutomationDetails, AutomationInfoAndStep, Automations, BlogCategories, BlogCommentsListsParams, 
    BlogPostInfoParams, CityInfo, CommunityInfo, ServiceLists, Task, TemplateDetails, TemplateLists, User } from "@/components/types";
import { NextApiRequest } from "next";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export class Helpers {

    public validateEmail(email: string): boolean {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    public ucwords(str: string): string {
        return str.replace(/\b\w/g, function (char) {
            return char.toUpperCase();
        });
    }

    public GenarateRandomString(len: number = 25): string {
        const characters = 'ABCDEFGHIJKLMN209i2388jwdp8wrh989AS78GWEGAWy9008347bdioapod73623239372382309OPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < len; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        return result;
    }

    public VerifySession() {
        const user = useSelector((state: RootState) => state.user)
        const rounter = useRouter()

        if (!user.isLogged) {
            rounter.push("/admin/login")
        }
    }

    public async FetchCompanyInfo(): Promise<APIResponseProps>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return await fetch(`${apiBaseUrl}/api/get-company-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async FetchAPIInfo(): Promise<APIResponseProps>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return await fetch(`${apiBaseUrl}/api/get-api-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((resp): Promise<APIResponseProps> => {
            return resp.json();
        }).then(data => {
            return data
        })

    }

    public GetAgents = async (payload: {page: string | number | string[], limit: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(agents)/agents`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<AgentsType[]> => {
            if (!resp.ok) {
                throw new Error("Unable to fetch agents.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async FetchAgentInfo(payload :{agent_id: string | number | string[]}):Promise<APIResponseProps>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(agents)/get-agent-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load agent info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadCategories = async (payload: {paginated: boolean, page?: string | number | string[], limit?: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-categories`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<BlogCategories[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load categories.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public flashRedirect(){
        window.history.replaceState("", "", '#/redirecting');
    }

    public GetParsedFieldString(field: string[] | undefined): string{
        if(field){
            return field[0];
        }
        return "";
    }

    public GetParsedFieldArray(field: string[] | undefined): []{
        if(field){
            return JSON.parse(field[0]);
        }
        return [];
    }

    public GetParsedFieldJSON(field: string[] | undefined): any{
        if(field && field[0] != ""){
            return JSON.parse(field[0]);
        }
        return {};
    }

    public async GetBlogPostInfo(slug: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-blog-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load blog info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async GetDraftBlogPostInfo(draft_id: number): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-draft-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({draft_id: draft_id}),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load draft info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

     public async AddBlogView(slug: string, logged_id: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/add-blog-view`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug, logged_id: logged_id}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to add blog view.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }
    
    public LoadBlogPosts = async (payload: {
        paginated: boolean, 
        post_type: string, 
        page?: string | number | string[], 
        limit?: number, 
        category_id?: number, 
        keyword?: string
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-blog-posts`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<BlogPostInfoParams[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load blog posts.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadBlogComments = async (payload: {paginated: boolean, post_id?: string | number | string[], page?: string | number | string[], limit?: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(blogs)/load-blog-comments`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<BlogCommentsListsParams[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load blog comments.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    } 

    public async GetCommunityDraftInfo(draft_id: number): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(communities)/load-draft-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({draft_id: draft_id}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load draft info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadCommunities = async (payload: {paginated: boolean, post_type: string, city_slug?: string, page?: string | number | string[], limit?: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(communities)/load-communities`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<CommunityInfo[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load communities.")
            }

            return resp.json();
        }).then(data => {
            return data
        });

    }

    public async LoadSingleCommunity(slug: string, search_by: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(communities)/load-community-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug, search_by: search_by}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load community info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadCities = async (payload: {paginated: boolean, post_type: string, page?: string | number | string[], limit?: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(cities)/load-cities`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<CityInfo[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load cities.")
            }

            return resp.json();
        }).then(data => {
            return data
        });

    }

    public async GetCityInfo(keyword: number | string, search_by: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(cities)/load-city-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({keyword: keyword, search_by: search_by}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load draft info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async GetCityStats(slug: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(cities)/load-city-stats`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load city stats.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async GetCommunityStats(slug: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(communities)/load-community-stats`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load community stats.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async GetServiceDraftInfo(draft_id: number): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(services)/load-draft-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({draft_id: draft_id}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load draft info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadServices = async (payload: {paginated: boolean, post_type: string, city_slug?: string, page?: string | number | string[], limit?: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(services)/load-services`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<ServiceLists[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load services.")
            }

            return resp.json();
        }).then(data => {
            return data
        });

    }

    public async LoadSingleService(slug: string, search_by: string): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(services)/load-service-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({slug: slug, search_by: search_by}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load service info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadTestimonials = async (payload: {paginated: boolean, page?: string | number | string[], limit?: number}) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(testimonials)/load-testimonials`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<APIResponseProps> => {
            if (!resp.ok) {
                throw new Error("Unable to load testimonials.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async GetTestimonialInfo(testimonial_id: number): Promise<APIResponseProps> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(testimonials)/load-testimonial-info`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({testimonial_id: testimonial_id}),
        }).then((resp): Promise<APIResponseProps> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load draft info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadUsers = async (payload: {
        paginated: boolean;
        search_type: string;
        keyword: string | number;
        page: number;
        limit: number;
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(users)/load-users`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<User[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load users.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadSingleUser(user_id: string): Promise<User> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(users)/load-single-user`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_id: user_id}),
        }).then((resp): Promise<User> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load user info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadTemplates = async (payload: {
        paginated: boolean;
        search_type: string;
        template_type: string;
        page: number;
        limit: number;
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(templates)/load-templates`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<TemplateLists[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load templates.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadSingleTemplate(template_id: string): Promise<TemplateDetails> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(templates)/load-single-template`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({search_by: "Temp Id", search_value: template_id}),
        }).then((resp): Promise<TemplateDetails> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load template info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public LoadAutoResponders = async () => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(auto-responders)/load-auto-responders`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((resp): Promise<AutoResponderLists[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load auto responders.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadAutoResponder(auto_responder_id: string): Promise<AutoResponderDetails> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(auto-responders)/load-single-auto-responder`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({search_by: "AR Id", search_value: auto_responder_id}),
        }).then((resp): Promise<AutoResponderDetails> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load auto responder info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public async LoadUserTasks(user_id: number): Promise<Task[]>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(tasks)/load-tasks`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_id}),
        }).then((resp): Promise<Task[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load user tasks.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async MarkTaskAsDone(task_id: number): Promise<boolean>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(tasks)/manage-tasks`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({task_id}),
        }).then((resp): Promise<boolean> => {
            if (!resp.ok) {
                throw new Error("Unable to load user tasks.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadUserAppointments(user_id: number): Promise<Appointment[]>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(appointments)/load-appointments`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_id}),
        }).then((resp): Promise<Appointment[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load user appointments.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async MarkAppointmentsAsDone(appointment_id: number): Promise<boolean>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(appointments)/manage-appointments`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({appointment_id}),
        }).then((resp): Promise<boolean> => {
            if (!resp.ok) {
                throw new Error("Unable to load user appointments.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadUsersActivities(user_id: number, type: string, skip: number, limit: number): Promise<any>{

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(users)/all-user-activities`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_id, type, skip, limit}),
        }).then((resp): Promise<any> => {
            if (!resp.ok) {
                throw new Error("Unable to load user's activities.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public LoadAutomations = async (payload: {
        paginated: boolean;
        page: number;
        limit: number;
        search_type: string;
    }) => {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(automations)/load-automations`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((resp): Promise<Automations[]> => {
            if (!resp.ok) {
                throw new Error("Unable to load automations.")
            }

            return resp.json();

        }).then(data => {
            return data
        });

    }

    public async LoadAutomationInfoStep(automation_id: number): Promise<AutomationInfoAndStep> {

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        return fetch(`${apiBaseUrl}/api/(automations)/load-automation-info-step`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({automation_id: automation_id }),
        }).then((resp): Promise<AutomationInfoAndStep> => {
            
            if (!resp.ok) {
                throw new Error("Unable to load automation info.")
            }

            return resp.json();
        }).then(data => {
            return data
        })

    }

    public rTrim(hay: string, niddle: string): string {
        if (hay.endsWith(niddle)) {
            return hay.slice(0, -1*niddle.length);
        }
        return hay;
    }

     public lTrim(hay: string, niddle: string): string {
        if (hay.startsWith(niddle)) {
            return hay.slice(1);
        }
        return hay;
    }

    public BuildSearchFilter(req: NextApiRequest): [string, string] {

        const req_body = req.body;
        let qry_loc = "";
        let qry_beds = "";
        let qry_baths = "";
        let qry_price = "";
        let sales_type_query = "";
        let prop_type_query = "";
        let qry_lots = "";
        let qry_sqft = "";
        let year_query = "";
        let parking_query = "";
        let must_have_query = "";
        let hoa_query = "";
        let order_by = "";

        if(req_body.mls_name && req_body.mls_name !=""){
            qry_loc = ` AND LOWER(City)=LOWER('${req_body.mls_name}') `;
        }

        if(req_body.mls_county_name && req_body.mls_county_name !=""){
            qry_loc = ` AND LOWER(CountyOrParish)=LOWER('${req_body.mls_county_name}') `;
        }

        if(req_body.location && req_body.location !=""){
            qry_loc = ` AND ( City LIKE '%${req_body.location}%' OR PostalCode LIKE '%${req_body.location}%' OR CountyOrParish LIKE '%${req_body.location}%' OR FullAddress LIKE '%${req_body.location}%' ) `;
        }

        if((req_body.min_bed && req_body.min_bed !='0' && req_body.min_bed!='') || (req_body.max_bed && req_body.max_bed !='0' && req_body.max_bed!='')){

            if((req_body.min_bed!='0' && req_body.min_bed!='') && (req_body.max_bed=='0' || req_body.max_bed=='')){
                qry_beds = ` AND (BedsTotal >= ${req_body.min_bed}) `; // AND BedsTotal > 0
            }else if((req_body.min_bed=='0' || req_body.min_bed=='') && (req_body.max_bed!='0' && req_body.max_bed!='')){
                qry_beds = ` AND (BedsTotal <= ${req_body.max_bed}) `; // AND BedsTotal > 0
            }else if((req_body.min_bed!='0' && req_body.min_bed!='') && (req_body.max_bed!='0' && req_body.max_bed!='')){
                qry_beds = ` AND (BedsTotal >= ${req_body.min_bed} AND BedsTotal <= ${req_body.max_bed}) `; // AND BedsTotal > 0
            }  
        
        }

        if((req_body.min_bath && req_body.min_bath!='0' && req_body.min_bath!='') || (req_body.max_bath && req_body.max_bath!='0' && req_body.max_bath!='')){

            if((req_body.min_bath!='0' && req_body.min_bath!='') && (req_body.max_bath=='0' || req_body.max_bath=='')){
                qry_baths = ` AND (BathsTotal >= ${req_body.min_bath}) `; // AND BathsTotal > 0
            }else if((req_body.min_bath=='0' || req_body.min_bath=='') && (req_body.max_bath!='0' && req_body.max_bath!='')){
                qry_baths = ` AND (BathsTotal <= ${req_body.max_bath}) `; // AND BathsTotal > 0
            }else if((req_body.min_bath!='0' && req_body.min_bath!='') && (req_body.max_bath!='0' && req_body.max_bath!='')){
                qry_baths = ` AND (BathsTotal >= ${req_body.min_bath} AND BathsTotal <= ${req_body.max_bath}) `; // AND BathsTotal > 0   
            }  
        
        }

        if((req_body.min_price!='0' && req_body.min_price!='') || (req_body.max_price!='0' && req_body.max_price!='')){

            if((req_body.min_price!='0' && req_body.min_price!='') && (req_body.max_price=='0' || req_body.max_price=='')){
                qry_price = ` AND (ListPrice >= ${req_body.min_price} AND ListPrice > 0) `; 
            }else if((req_body.min_price=='0' || req_body.min_price=='') && (req_body.max_price!='0' && req_body.max_price!='')){
                qry_price = ` AND (ListPrice <= ${req_body.max_price} AND ListPrice > 0) `; 
            }else if((req_body.min_price!='0' && req_body.min_price!='') && (req_body.max_price!='0' && req_body.max_price!='')){
                qry_price = ` AND (ListPrice >= ${req_body.min_price} AND ListPrice <= ${req_body.max_price} AND ListPrice > 0) `;   
            }  
        
        }else{
            qry_price = " AND ListPrice > 0";
        }

        if(req_body.sales_type!=''){

            if(req_body.sales_type == 'For Sale'){
                //sales_type_query = ` AND (RAN_ForSaleRent='For Sale' AND Status='Active') `; 
            }else if(req_body.sales_type == 'For Rent'){
                req_body.home_type = "";
                req_body.max_hoa = null;
                sales_type_query = ` AND (PropertyClass='RNT' AND Status='Active') `;
            }else if(req_body.sales_type == "Sold"){
                sales_type_query = ` AND (Status='Closed' OR Status='Sold') `;   
            } 

        }
        
        if(req_body.home_type && req_body.home_type !=""){
             
            if(req_body.home_type.Any != 'Yes'){
                
                if(req_body.home_type.House == 'Yes' || req_body.home_type.Residential == 'Yes'){
                    prop_type_query += ` PropertyType='Residential' OR `;
                }

                if(req_body.home_type.Commercial == 'Yes'){
                    prop_type_query += ` PropertyType='Commercial' OR `;
                }
                
                if(req_body.home_type.Dock == "Yes"){
                    prop_type_query += ` PropertyType='Boat Dock' OR`;   
                } 
                
                if(req_body.home_type.Land == "Yes"){
                    prop_type_query += ` PropertyType='Lot & Land' OR`;   
                }

                if(req_body.home_type.SingleFamily == 'Yes'){
                    prop_type_query += ` OwnershipDesc='Single Family' OR`;
                }
                
                if(req_body.home_type.Condo == 'Yes'){
                    prop_type_query += ` OwnershipDesc='Condo' OR`;
                }
                
                if(req_body.home_type.CoOp == 'Yes'){
                    prop_type_query += ` OwnershipDesc='Co-Op' OR `;
                }

                prop_type_query = this.rTrim(prop_type_query, "OR");
                if(prop_type_query!=""){
                    prop_type_query = ` AND (${prop_type_query})`;
                }
            }
        } 

        if((req_body.min_lot && req_body.min_lot!='0' && req_body.min_lot!='') || (req_body.max_lot && req_body.max_lot!='0' && req_body.max_lot!='')){

            const min_lot_acres = (req_body.min_lot/43560).toFixed(2);
            const max_lot_acres = (req_body.max_lot/43560).toFixed(2);

            if((req_body.min_lot!='0' && req_body.min_lot!='') && (req_body.max_lot=='0' || req_body.max_lot=='')){
                qry_lots = ` AND (TotalArea >= ${min_lot_acres}) `;
            }else if((req_body.min_lot=='0' || req_body.min_lot=='') && (req_body.max_lot!='0' && req_body.max_lot!='')){
                qry_lots = ` AND (TotalArea <= ${max_lot_acres}) `;
            }else if((req_body.min_lot!='0' && req_body.min_lot!='') && (req_body.max_lot!='0' && req_body.max_lot!='')){
                qry_lots = ` AND (TotalArea >= ${min_lot_acres} AND TotalArea <= ${max_lot_acres}) `; 
            }  
        
        }

        if((req_body.min_square_feet && req_body.min_square_feet!='0' && req_body.min_square_feet!='') 
        || (req_body.max_square_feet && req_body.max_square_feet!='0' && req_body.max_square_feet!='')){

            if((req_body.min_square_feet!='0' && req_body.min_square_feet!='') && (req_body.max_square_feet=='0' || req_body.max_square_feet=='')){
                qry_sqft = ` AND (CAST(ApproxLivingArea AS DECIMAL) >= ${req_body.min_square_feet} AND ApproxLivingArea IS NOT NULL) `;
            }else if((req_body.min_square_feet=='0' || req_body.min_square_feet=='') && (req_body.max_square_feet!='0' && req_body.max_square_feet!='')){
                qry_sqft = ` AND (CAST(ApproxLivingArea AS DECIMAL) <= ${req_body.min_square_feet} AND ApproxLivingArea IS NOT NULL) `;
            }else if((req_body.min_square_feet!='0' && req_body.min_square_feet!='') && (req_body.max_square_feet!='0' && req_body.max_square_feet!='')){
                qry_sqft = ` AND (CAST(ApproxLivingArea AS DECIMAL) >= ${req_body.min_square_feet} AND CAST(ApproxLivingArea AS DECIMAL) <= ${req_body.max_square_feet} AND LivingArea IS NOT NULL) `; 
            }  
        
        }

        if((req_body.min_year && req_body.min_year !="") || (req_body.max_year && req_body.max_year!='')){

            if((req_body.min_year && req_body.min_year!='') && (!req_body.max_year || req_body.max_year=='')){
                year_query = ` AND (CAST(YearBuilt AS SIGNED) >= ${req_body.min_year}) `;
            }else if((!req_body.min_year || req_body.min_year=='') && (req_body.max_year && req_body.max_year!='')){
                year_query = ` AND (CAST(YearBuilt AS SIGNED) <= ${req_body.max_year}) `;
            }else if((req_body.min_year && req_body.min_year!='') && (req_body.max_year && req_body.max_year!='')){
                year_query = ` AND (CAST(YearBuilt AS SIGNED) >= ${req_body.min_year} AND CAST(YearBuilt AS SIGNED) <= ${req_body.max_year}) `;
            }  
        
        }

        if(req_body.parking_spots > 0 ){
            //parking_query = ` AND (CAST(GarageSpaces AS SIGNED) >= ${req_body.parking_spots}) `;
        }
        
        if(req_body.virtual_tour ){
            must_have_query += ` AND (VirtualTourURL!='' OR VirtualTourURL2!='') `;
        }

        if(req_body.garage){
            must_have_query += ` AND CAST(GarageSpaces AS SIGNED) > 0 `;
        }

        if(req_body.basement){
            must_have_query += ` AND AdditionalRooms LIKE '%basement%' `;
        }

        if(req_body.pool){
            must_have_query += ` AND (PrivatePoolYN='1' OR Amenities LIKE '%Pool%') `;
        }

        if(req_body.view){
            must_have_query += ` AND (View!='' AND View IS NOT NULL AND View!='None') `;
        }

        if(req_body.waterfront){
            must_have_query += ` AND WaterfrontYN='1' `;
        }

        if(req_body.photos){
            must_have_query += ` AND (DefaultPic!='' AND DefaultPic IS NOT NULL) OR (Images!='' AND Images!='[]' AND Images IS NOT NULL) `;
        }
        console.log("must_have_query:", must_have_query)
        if(req_body.max_hoa && req_body.max_hoa > 0){

            if(req_body.include_incomp_hoa_data){
                hoa_query = ` AND ( (CAST(HOAFee AS SIGNED) <='${req_body.max_hoa}' AND MandatoryHOAYN='1') OR (MandatoryHOAYN='0') ) `;
            }else{
                hoa_query = ` AND (CAST(HOAFee AS SIGNED) <='${req_body.max_hoa}' AND MandatoryHOAYN='1') `;
            }
            
        }else if(req_body.max_hoa && req_body.max_hoa =="0"){

            hoa_query = ` AND MandatoryHOAYN='0' `;

        }

        if(req_body.sort_by=="SQFT-ASC"){
            order_by = "CAST(TotalArea AS SIGNED) ASC";   
        }else if(req_body.sort_by=="SQFT-DESC"){
            order_by="CAST(TotalArea AS SIGNED) DESC";   
        }else if(req_body.sort_by=="Baths-ASC"){
            order_by="CAST(BathsTotal AS SIGNED) ASC";    
        }else if(req_body.sort_by=="Baths-DESC"){
            order_by="CAST(BathsTotal AS SIGNED) DESC";    
        }else if(req_body.sort_by=="Beds-ASC"){
            order_by="CAST(BedsTotal AS SIGNED) ASC";    
        }else if(req_body.sort_by=="Beds-DESC"){
            order_by="CAST(BedsTotal AS SIGNED) DESC";    
        }else if(req_body.sort_by=="Parking-ASC"){
            order_by="CAST(GarageSpaces AS SIGNED) ASC";    
        }else if(req_body.sort_by=="Parking-DESC"){
            order_by="CAST(GarageSpaces AS SIGNED) DESC";    
        }else if(req_body.sort_by=="Price-ASC"){
            order_by="CAST(ListPrice AS SIGNED) ASC";   
        }else if(req_body.sort_by=="Price-DESC"){
            order_by="CAST(ListPrice AS SIGNED) DESC";   
        }else if(req_body.sort_by=="Built-ASC"){
            order_by="CAST(YearBuilt AS SIGNED) ASC";   
        }else if(req_body.sort_by=="Built-DESC"){
            order_by="CAST(YearBuilt AS SIGNED) DESC";   
        }else if(req_body.sort_by=="Date-ASC"){
            order_by="MatrixModifiedDT ASC";   
        }else if(req_body.sort_by=="Date-DESC"){
            order_by="MatrixModifiedDT DESC";   
        }else{ /** not set **/
            order_by="MatrixModifiedDT DESC";  
        }
        
        return [`${qry_loc} ${qry_beds} ${qry_baths} ${qry_price} ${sales_type_query} ${prop_type_query} ${qry_lots} ${qry_sqft} 
        ${year_query} ${parking_query} ${must_have_query} ${hoa_query}`, order_by];
    }

    public formatPrice(price: number): string {
        if (price >= 1000000) {
            let val = (price / 1000000).toFixed(1);
            val = val.replace(".0","");
            return val+ 'M';
        } else if (price >= 1000) {
            let val = (price / 1000).toFixed(1);
            val = val.replace(".0","");
            return val+ 'K';
        } else {
            return price.toString();
        }
    }

    public stringToBoolean(value: string): boolean | undefined {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return undefined;
    }

}
