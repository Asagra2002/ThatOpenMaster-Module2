import{v4 as uuidv4} from 'uuid'

export type ProjectStatus= "Pending"|"Active"|"Finished"
export type UserRole= 'Architect'|'Engineer'|'Developer'

export interface IProject{
        name: string
        description: string
        status:ProjectStatus
        userRole: UserRole
        finishDate: Date  

}


export class Project implements IProject{
        name: string
        description: string
        status: "Pending"|"Active"|"Finished"                      
        userRole: "Architect"|"Engineer"|"Developer"
        finishDate: Date
        
        ui:HTMLDivElement
        cost: number=0
        progress: number=0
        id:string



        constructor(data: IProject){
                // for(const key in data){
                //         this[key]=data[key]
                // }
                this.name=data.name
                this.description=data.description
                this.status=data.status
                this.userRole=data.userRole
                this.finishDate=data.finishDate
                this.id=uuidv4()
                this.setUI()
        }

        setUI(){
                
                this.ui=document.createElement("div")
                this.ui.className="project-card"
                this.ui.setAttribute('data-project-id', this.id); 
                this.ui.innerHTML=`
        
                <div class="card-header">
                <p style="background-color: ${getRandomColor()}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">${this.name.slice(0, 2).toUpperCase()}</p>

                        <div>
                                <h5>${this.name}</h5>
                                <p id="descriptionCard">${this.description}</p>
                        </div>
                </div>
                <div class="card-content">
                        <div class="card-property">
                                <p style="color:darkgrey">Status</p>
                                <p>${this.status}</p>
                        </div>
                        <div class="card-property">
                                <p style="color:darkgrey">Role</p>
                                <p>${this.userRole}</p>
                        </div>
                        <div class="card-property">
                                <p style="color:darkgrey">Cost</p>
                                <p>${this.cost}</p>
                        </div>
                        <div class="card-property">
                                <p style="color:darkgrey">Estimated Progress</p>
                                <p>${this.progress*100}%</p>
                        </div>
                </div>
                `;
        }
                

        updateUI() {
                
                const nameElement = this.ui.querySelector(".card-header h5");
                if (nameElement) {
                        nameElement.textContent = this.name;
                }
                const descriptionElement = this.ui.querySelector("#descriptionCard");
                if (descriptionElement) {
                        descriptionElement.textContent = this.description;
                }
                const statusElement = this.ui.querySelector(".card-content .card-property p:nth-child(2)");
                if (statusElement) {
                        statusElement.textContent = this.status;
                }
                const roleElement = this.ui.querySelector(".card-content .card-property:nth-child(2) p:nth-child(2)");
                if (roleElement) {
                        roleElement.textContent = this.userRole;
                }
                const costElement = this.ui.querySelector(".card-content .card-property:nth-child(3) p:nth-child(2)");
                if (costElement) {
                        costElement.textContent = this.cost.toString();
                }
                const progressElement = this.ui.querySelector(".card-content .card-property:nth-child(4) p:nth-child(2)");
                if (progressElement) {
                        progressElement.textContent = `${this.progress * 100}%`;
                }
        }

        getEditData(): IProject {
                return {
                        name: this.name,
                        description: this.description,
                        userRole: this.userRole,
                        status: this.status,
                        finishDate: this.finishDate,
                 
                };
        }

}


function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
}

