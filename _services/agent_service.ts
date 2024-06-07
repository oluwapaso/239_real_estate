import { MYSQLAgentsRepo } from "@/_repo/agents_repo";
import { APIResponseProps, AddAgentParams, UpdateAgentParams } from "@/components/types";

 
export class AgentService {
    
    agent_repo = new MYSQLAgentsRepo();

    public async AddNewAgent(params: AddAgentParams):Promise<APIResponseProps>{

        const name = params.name
        const email = params.email

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!name || !email){
            default_resp.message = "Provide a valid name and email address."
            return default_resp as APIResponseProps
        }

        const resp = await this.agent_repo.AddNewAgent({params})
        return resp;

    }

    public async UpdateAgentInfo(params: UpdateAgentParams):Promise<APIResponseProps>{

        const agent_id = params.agent_id
        const name = params.name
        const email = params.email

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!name || !email){
            default_resp.message = "Provide a valid name and email address."
            return default_resp as APIResponseProps
        }

        if(!agent_id){
            default_resp.message = "Invalid agent info provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.agent_repo.UpdateAgentInfo(params)
        return resp;

    }

    public async DeleteAgentInfo(agent_id: number):Promise<APIResponseProps>{

        const default_resp = {
            message: "",
            data: null,
            success: false,
        }

        if(!agent_id){
            default_resp.message = "Invalid agent info provided."
            return default_resp as APIResponseProps
        }

        const resp = await this.agent_repo.DeleteAgentInfo(agent_id)
        return resp;

    }

}