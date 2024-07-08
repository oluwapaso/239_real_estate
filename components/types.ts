
export type NavProps = {
    page: string,
    bg_image?:string
    crumb?: JSX.Element
    max_width?: number
    big_crum?: boolean
}

export type PriceType = {
    value: number
    text :string
}

export type BedsBathsType = {
    value: number
    text :string
}

export type FilterValueTypes = {
    min_price: number,
    max_price: number,
    min_beds: number,
    max_beds: number,
    min_baths: number,
    max_baths: number,
}

export type NeigbourhoodType = {
    name: string
    slug :string
    id: number
    image:string
}

export type CommunityPropertiesFilter = {
    min?: number,
    max?: number
}

export type form_dataProps = {
    user_id: number,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    subject: string,
    message: string,
    mailer: string
    message_type: string
}

export type APIResponseProps = {
  message: string
  data?: any
  success?: boolean
}

export type buying_dataProps = {
    user_id: number,
    first_name: string,
    last_name: string,
    email: string,
    primary_phone: string,
    secondary_phone: string,
    fax: string,
    address: string,
    city: string,
    state: string,
    zip_code: string,
    num_of_beds: string,
    num_of_baths: string,
    square_feet: string,
    mode_of_contact: string,
    price_range: string,
    move_on: string,
    started_looking_in: string,
    own_in: string,
    with_an_agent: string,
    home_description: string,
    mailer: string,
    message_type: string,
}


export type AgentsType = {
    agent_id: number
    name: string
    email: string
    phone: string
    role:string 
    license_number: string
    image: any
    facebook: string
    twitter: string
    instagram: string
    bio: string
    total_records: number
    status?: string
}

export type GetAgentsParams = {
    page: number
    limit: number
}

export type GetSingleAgentParams = {
    search_by: string
    fields: string
    email?: string
}

export type GetSingleAdminParams = {
    search_by: string
    fields: string
    email?: string
}

export type AdminsType = {
    admin_id: number
    username: string
    email: string
    status: string
    token?: string
}

export type User = {
    user_id: number
    email: string
    secondary_email: string
    firstname: string
    lastname: string
    phone_1: string
    phone_2: string
    work_phone: string
    fax: string
    street_address: string
    city: string
    state: string
    zip: string
    country: string
    price_range: string
    spouse_name: string
    profession: string
    birthday: string
    source: string
    date_added: string
    facebook: string
    linkedin: string
    twitter: string
    tictoc: string
    whatsapp: string
    background: string
    sub_to_updates: string
    sub_to_mailing_lists: string
    status: string
    lead_stage: string
    last_seen: string
    token?: string
    total_records?: number
}

export type GetResetTokenParams = {
    search_by: string
    email?: string
    token?: string
}

export type AddTokenParams = {
    email: string
    date: string
    token: string
}

export type UpAdminPasswordParams = {
    account_email: string
    admin_id: number
    password: string
}

export type UpUserPasswordParams = {
    account_email: string
    user_id: number
    password: string
}

export type initialStateProps = {
    admin_id: number | null
    session_id: string
    token: string
    email: string
    status: string
    isLogged: boolean
    isLogginIn: boolean
    showPageLoader: boolean
    error: string
}

export type initialAppSettProps = {
    menu_opened: boolean
}

export type AdminLoginParams = {
    username: string
    password: string
}

export type UserLoginParams = {
    email: string
    password: string
}

export type UserAuthParams = {
    email: string
    name: string
}

export type GetSingleUserParams = {
    search_by: string
    fields: string
    email?: string
    user_id?: string
}

export type UpdateCompanyParams = {
    address_1: string
    address_2: string
    buying_email: string
    selling_req_email: string
    company_id:number
    mls_office_key: string
    company_name: string
    contact_us_email: string
    default_email: string
    facebook: string
    instagram: string
    phone_number: string
    twitter: string 
    youtube: string 
}

export type UpdateAPIParams = {
    google_auth_client_id: string
    google_auth_client_secret: string
    facebook_auth_app_id: string
    facebook_auth_app_secret:number
    google_map_key: string
    facebook_short_token: string
    facebook_long_token: string
    sendgrid_key: string
    sendgrid_mailer: string
    walkscore_api: string
    twillio_account_sid: string
    twillio_auth_token: string
    twillio_twiml_sid: string
    twillio_phone_number: string
}

export type CkEditorProps = {
    data: string
    onDataChange: (data: string) => void
    height?: string
    setEditor?: React.Dispatch<any>
}

export type UpdatePrivacyAndTermsParams = {
    update_type: string
    value: string
}

export type compStateProps = {
    address_1: string
    address_2: string
    buying_email: string
    company_name: string
    contact_us_email: string
    default_email: string
    facebook: string
    instagram: string
    phone_number: string
    twitter: string 
    youtube: string 
    privacy_policy: string 
    terms_of_service: string
    mls_disclaimer: string
    about_us: string
    featured_listings?:any
    lead_stages?: any,
    primary_logo?: any
    secondary_logo?: any
    mls_logo?: any
    home_header?: any
    calculator_header?: any
    blog_header?: any
    error: string,
    menu_opened: boolean,
    showPageLoader: boolean,
}

export type AddAgentParams = { 
    name: string
    email: string
    phone: string
    role: string
    facebook: string
    instagram: string
    twitter: string 
    license_number: string 
    bio: string 
    error: string
}

export type UpdateAgentParams = {
    agent_id: number
    name: string
    email: string
    phone: string
    role: string
    facebook: string
    instagram: string
    twitter: string 
    license_number: string 
    bio: string 
    error: string
}


export type BlogCategories = {
    category_id: number
    name: string
    slug: string
    number_of_posts: number
    total_records: number
}

export type CheckSlugParams = {
    check_by: string
    slug:string
    category_name?: string
    category_id?:number
    post_id?:number
    draft_id?:number
}

export type AddCategoryParams = {
    slug:string
    category_name: string
}

export type UpdateCategoryParams = {
    slug: string
    category_name: string
    category_id: number
}

export type LoadBlogCatsParams = {
    paginated: boolean
    page: number
    limit: number
}

export type LoadBlogPostsParams = {
    paginated: boolean
    post_type: string
    page: number
    limit: number
    category_id?: number
    keyword?: string
}

export type BlogCatLists = { 
    category_id: number
    name: string
    slug: string
    number_of_posts: number
}

export type AddBlogPostParams = {
    draft_id: number
    post_title: string
    slug: string,
    excerpt: string
    post_body: string
    submit_type: string
    header_image: any
    categories: string[]
    menus:any
    date_added?: string
}

export type CommonBlogPostInfoParams = {
    post_title: string
    slug: string
    excerpt: string
    post_body: string
    views: number
    comments: number
    date_added: string
    header_image: any
    show_on_menus: any
    categories: string
}

export type BlogPostInfoParams = {
    draft_id: number
    post_id: number
    info: CommonBlogPostInfoParams
    published: string
    total_records: number
}

export type BlogDraftsInfoParams = {
    post_id: number
    post_draft_id: number
    info: CommonBlogPostInfoParams
    published: string
    header_image: string
    published_header_image: string
}

export type BlogDraftsInfo = {
    post_id: number
    post_draft_id: number
    post_title: string
    slug: string
    excerpt: string
    post_body: string
    views: number
    comments: number
    date_added: string
    show_on_menus: any
    categories: string
    published: string
    header_image: any
    published_header_image: any
}

export type BlogCommentsListsParams = {
    comment_id: number
    post_id: number
    comment_body: string
    comment_parent: string
    name: string
    email: string
    reply_by: string
    date_added: string
}

export type LoadPostCommentsParams = {
    post_id: number
    paginated: boolean
    page: number
    limit: number
}

export type AddPostCommetsParams = {
    draft_id: number
    comments: string
    name:string
    email: string
    reply_by: string
}

export type AddPostReplyParams = {
    comment_id: number
    draft_id: number
    comments: string
    comment_parent?: string
    reply_by: string
    name?:string
    email?: string
}

export type AddCommunityParams = {
    draft_id: number
    city_slug: string
    city_id: string
    mls_name: string
    friendly_name: string
    slug: string,
    excerpt: string
    post_body: string
    submit_type: string
    header_image: any
    menus:any
    date_added?: string
}

export type CommunityDraftsInfo = {
    draft_id: number
    community_id: number
    mls_name: string
    friendly_name: string
    slug: string
    excerpt: string
    post_body: string
    date_added: string
    header_image: any
    published_header_image: any
    show_on_menus: any
    published: string
}

export type CommunityInfo = {
    draft_id: number
    community_id: number
    city_slug?: string
    city_id?: string
    mls_name: string
    friendly_name: string
    slug: string
    excerpt: string
    post_body: string
    date_added: string
    header_image: any
    published_header_image: any
    show_on_menus: any
    published: string
    total_records: number
}

export type CommunityDetails = Omit<CommunityInfo, "total_records">

export type LoadCommunitiesParams = {
    paginated: boolean
    post_type: string
    city_slug?: string
    page: number
    limit: number
}

export type MenuType = {
    menus: BlogDraftsInfo[],
    error: string,
}

export type srchHmType = {
    Any: string,
    House: string,
    Condo: string,
    Townhome: string,
    MultiFamily: string,
    Mobile: string,
    Farm: string,
    Land: string,
}

export type CityInfo = {
    city_id: number
    mls_name: string
    slug: string
    friendly_name: string
    excerpt: string
    draft_content: string
    published_content: string
    is_published: string
    is_dirty: string
    header_image: any
    show_on_menus: any
    total_records: number
}

export type CityDetails = Omit<CityInfo, "total_records">

export type LoadCitiesParams = {
    paginated: boolean
    post_type: string
    page: number
    limit: number
}

export type UpdateCityParams = {
    city_id: number
    mls_name: string
    friendly_name: string
    excerpt: string
    post_body: string
    submit_type: string
    header_image: any
    menus:any
}


export type ServiceLists = {
    draft_id: number
    service_id: number
    friendly_name: string
    slug: string
    excerpt: string
    post_body: string
    date_added: string
    header_image: any
    published_header_image: any
    show_on_menus: any
    published: string
    total_records: number
}

export type ServiceDetails = Omit<ServiceLists, "total_records">

export type LoadServicesParams = {
    paginated: boolean
    post_type: string
    page: number
    limit: number
}

export type AddServiceParams = {
    draft_id: number
    friendly_name: string
    slug: string,
    excerpt: string
    post_body: string
    submit_type: string
    header_image: any
    menus:any
    date_added?: string
}

export type GetTestimonialParams = {
    paginated: boolean
    page: number
    limit: number
}

export type AddTestimonialParams = { 
    fullname: string
    account_type: string
    testimonial: string
}

export type UpdateTestimonialParams = AddTestimonialParams & {
    testimonial_id: number
}

export type Testimonials = UpdateTestimonialParams;

export type LoadTestimonialParams = {
    paginated: boolean
    page: number
    limit: number
}

export type LoadUsersParams = {
    paginated: boolean
    search_type: string
    page: number
    limit: number
    keyword?: string
    lead_stage?: string
}

export type AddTemplateParams = { 
    template_type: string
    template_name: string
    email_subject: string
    email_body: string
    sms_body: string
}

export type UpdateTemplateParams = AddTemplateParams & {
    template_id: number 
}

export type TemplateLists = {
    template_id: number
    template_type: string
    template_name: string
    email_subject: string
    email_body: string
    sms_body: string
    total_records: number
}

export type TemplateDetails = Omit<TemplateLists, "total_records">

export type LoadTemplatesParams = {
    paginated: boolean
    search_type: string
    page: number
    limit: number
    template_type?: string
}

export type LoadSingleTemplateParams = {
    search_by: string
    search_value: string | number
    template_type?: string
}

export type AutoResponderLists = {
    auto_responder_id: number
    name: string
    type: string
    ar_type: string
    email_subject: string
    email_body: string
    sms_body: string
    send_ar: string
    total_records: number
}

export type AutoResponderDetails = Omit<AutoResponderLists, "total_records">

export type LoadSingleAutoResponderParams = {
    search_by: string
    search_value: string | number
    template_type?: string
}

export type UpdateAutoResponderParams = { 
    auto_responder_id: number
    type: string
    send_ar: string
    name: string
    email_subject: string
    email_body: string
    sms_body: string
}

export type AddTaskParams = { 
    user_id: string
    title: string
    date: string
    time: string
}

export type MarkTaskAsDoneParams = {
    task_id: number
}

export type MarkMultiTaskAsDoneParams = {
    task_ids: string[]
}

export type Task = {
    task_id: number
    user_id: number
    title: string
    date: string
    time: string
    status: string
    firstname?: string
    lastname?: string
    completed_tasks: number
    pending_tasks: number
    total_records: number
} 

export type LoadUserTasksParams = {
    user_id: number
}

export type LoadTasksParams = {
    paginated: boolean
    task_type: string
    page: number
    limit: number
}

export type MarkAppointmentAsDoneParams = {
    appointment_id: number
}

export type MarkMultiAppsAsDoneParams = {
    appointment_ids: string[]
}

export type AddAppointmentParams = { 
    user_id: string
    title: string
    date: string
    start_time: string
    end_time: string
    location: string
    notes: string
}

export type Appointment = {
    appointment_id: number
    user_id: number
    title: string
    location: string
    date: string
    start_time: string
    end_time: string
    status: string
    notes: string
    firstname?: string
    lastname?: string
    completed_appointments: number
    pending_appointments: number
    total_records: number
} 

export type LoadAppointmentsParams = {
    paginated: boolean
    appointment_type: string
    page: number
    limit: number
}

export type LoadUserAppointmentParams = {
    user_id: number
}

export type AddNotesParams = { 
    user_id: number
    notes: string
    notes_type?: string
    number_called?: string
    property_id?: string
    property_address?: string
}

export type LoadUserNotesParams = {
    user_id: number
}

export type Note = {
    note_id: number
    user_id: number
    notes: string
    date: string
}

export type DeleteNoteParams = {
    note_id: number
}

export type SendMailParams = {
    user_id: number
    mailer: string
    from_email: string
    to_email: string
    subject: string
    body: string
    message_type: string,
    batch_id?: number
}

export type SentMailParams = Omit<SendMailParams, "mailer">

export type InitialActivities = {
    TotalNotes: number
    TotalCallLog: number
    TotalFavorites: number
    TotalUnfavorites: number
    TotalViewed: number
    TotalSearches: number
    TotalSavedSearches: number
    TotalDeletedSearches: number
    TotalEmails: number
    TotalSMS: number
    TotalSellingRequests: number
    TotalBuyingRequests: number
    TotalInfoRequests: number
    TotalTourRequests: number
    TotalShowingRequests: number
}

export type LoadUsersActivities = {
    user_id: number
    type: string
    skip: number
    limit: number
}

export type Automations = {
    automation_id: number
    name: string
    date_created: string
    parent_id: number
    status: "Inactive" | "Active"
    published_version: "Yes" | "No"
    trigger: any
    last_save: string
    stop_on_comm: "Yes" | "No"
    version_number: number
    total_records?: number
}

export type AutomationDetails = Omit<Automations, 'total_records'>

export type AutomationSeps = {
    step_id: number
    automation_id: number
    step_uid: string
    step_type: string
    parent_id: string
    parent_uid: string
    parent_type: string
    step_position: string
    children: any
    event_info: any
}

export type AutomationInfoAndStep = {
    total_records: number
    automation_id: number
    automation_name: string
    trigger: string
    automation_status: string 
    published_version: string
    steps: any
    versions: any
}

export type CheckedItems = {
    [key: number]: boolean;
};

export type ProperyRequests = {
    request_id: number
    user_id: number
    firstname: string
    lastname: string
    request_type: string
    request_info: string
    status: string
    date_added: string
    total_records?: number
}

export type LoadUserRequestsParams = {
    user_id: number
}

export type LoadRequestsParams = {
    paginated: boolean
    request_type: string
    page: number
    limit: number
}

export type AcknowledgeRequestParams = {
    request_id: number
}

export type AcknowledgeMultiRequestParams = {
    request_ids: string[]
}

export type BatchMessages = {
    batch_id: number
    message_type: string
    template_name: string
    status: string
    total_messages: string
    queued: string
    total_sent: string
    total_errored: string
    unsubscribed: string
    date_sent: string
    total_records?: number
}

export type LoadBatchMessagesParams = {
    paginated: boolean
    message_type: string
    page: number
    limit: number
}

export type LoadBatchMessageStatsParams = {
    paginated: boolean
    batch_id: number
    message_type: string
    page: number
    limit: number
}

export type LoadSingleBatchMessageParams = {
    batch_id: number
}

export type BatchMailErrorsParams = {
    user_id: number
    batch_id: number
    to_email: string
    error: string
}

export type AddBatchMessageParams = {
    type: "Email" | "SMS"
    total_messages: number
    template_name: string
}

export type SetBatchMessageStatsParams = {
    type: "Email" | "SMS"
    batch_id: number
    errored: number
    unsubscribed: number
    queued: number
}

export type BatchSMSErrorsParams = {
    user_id: number
    batch_id: number
    to_phone: string
    error: string
}

export type SendSMSParams = {
    user_id: number
    from_phone: string
    to_phone: string
    body: string
    message_type: string,
    batch_id?: number
}

export type BatchMessageStats = {
    firstname: number
    lastname: string
    email: string
    user_id: string
    to_email: string
    status: string
    error_message: string
    total_records: number
}

export type PendingBatchEmail = {
    queue_id: number
    firstname: number
    lastname: string
    email: string
    to_info: string
    user_id: number
    status: string
    error_message: string
    date_queued: string
    total_records: number
}

export type SentBatchEmail = {
    message_id: number
    firstname: number
    lastname: string
    email: string
    to_info: string
    user_id: number
    date_added: string
    total_records: number
}

export type UnsubscribedBatchEmail = {
    error_id: number
    firstname: number
    lastname: string
    email: string
    to_email: string
    to_phone: string
    user_id: number
    error_message: string
    date_added: string
    total_records: number
}

export type QueueError = {
    queue_id: number
    error_message: string
}