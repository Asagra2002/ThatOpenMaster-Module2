import { IProject, Project } from "./Project";
import { updateTodoList } from '../index';

export interface ExportedProject {
    project: IProject;
    todos: IToDo[];
}

export class ProjectManager {
    list: Project[] = [];
    ui: HTMLElement;

    constructor(container: HTMLElement) {
        this.ui = container;
    }
    
    newProject(data: IProject): Project {
        const projectNames = this.list.map((project) => project.name);
        const nameInUse = projectNames.includes(data.name);
    
        if (nameInUse) {
            throw new Error(`The project "${data.name}" it already exists.`);
        }
    
        const project = new Project(data);
    
        project.ui.addEventListener("click",()=>{
            const projectsPage=document.getElementById("project-page")
            const detailsPage=document.getElementById("project-details")
            if(!projectsPage|| !detailsPage){
                return
            }
            projectsPage.style.display="none"
            detailsPage.style.display="flex"
            this.setDetailsPage(project)
            
        })

        this.ui.append(project.ui);
        this.list.push(project);
    
        return project;
    }


    getTotalCost() {
        let totalCost = 0;
        this.list.forEach((project) => {
            totalCost += project.cost;
        });

        console.log("Total project cost: "+totalCost)
    }

    getNameProject(name:string){
        const project=this.list.find((project)=>{
            return project.name===name;
        })
        console.log("The name is: "+project)
    }
    

    private setDetailsPage(project:Project){
        const detailsPage=document.getElementById("project-details")
        if(!detailsPage){return}

        const nameHeader = detailsPage.querySelector("[data-project-info='name']");
        const descriptionHeader = detailsPage.querySelector("[data-project-info='description']");

        if (nameHeader) {
            nameHeader.textContent = project.name;
        }

        if (descriptionHeader) {
            descriptionHeader.textContent = project.description;
        }

        const name=detailsPage.querySelector("[data-project-info='name2']") 
        if(name) {name.textContent=project.name}

        const description=detailsPage.querySelector("[data-project-info='description2']") 
        if(description) {description.textContent=project.description}

        const status=detailsPage.querySelector("[data-project-info='status2']") 
        if(status) {status.textContent=project.status}

        const cost = detailsPage.querySelector("[data-project-info='cost2']");
        if (cost) {cost.textContent = project.cost.toString();}

        const role=detailsPage.querySelector("[data-project-info='role2']") 
        if(role) {role.textContent=project.userRole}

        const fechafin = detailsPage.querySelector("[data-project-info='finishDate2']");
        if (fechafin) {
            let fechaObjeto = new Date(project.finishDate);
            fechafin.textContent = fechaObjeto.toDateString();
        }

        const progress = detailsPage.querySelector("[data-project-info='progress']") as HTMLElement;
        if (progress) {
            progress.style.width=project.progress+"%"
            progress.textContent=project.progress+"%"
        }

        const iniciales= detailsPage.querySelector("[data-project-info='iniciales']");
        if(iniciales){iniciales.textContent=project.name.slice(0, 2).toUpperCase()}

        const todoListElement = detailsPage.querySelector("#todo-list");

        if (todoListElement) {
            updateTodoList(project.todos, todoListElement);
        }
    }

    getProject(id: string): Project | undefined {
        const project = this.list.find((project) => project.id === id);
        return project;
    }

    getProjectName(name: string): Project | undefined {
        const project = this.list.find((project) => project.name === name);
        return project;
    }

    deleteProject(id: string): void {
        const project = this.getProject(id);
    
        if (!project) {
            return;
        }
    
        project.ui.remove();
    
        const remaining = this.list.filter((project) => project.id !== id);
    
        this.list = remaining;
    }

    
    exportToJSON(fileName: string = "projects") {
        function replacer (key, value) {
          if (key !== "ui"){
            return value;
          }
        }
      const json = JSON.stringify(this.list, replacer, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url =  URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
     }

    
    importToJSON(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
    
        const reader = new FileReader();
    
        reader.addEventListener("load", () => {
            const json = reader.result;
    
            if (!json) {
                return;
            }
            const projects: IProject[] = JSON.parse(json as string);
            for (const project of projects) {
                try {
                    this.newProject(project);
                } catch (error) {
                    
                }
            }
        });

        input.addEventListener('change', () => {
            const fileList = input.files;
    
            if (!fileList) {
            return;
            }
    
            reader.readAsText(fileList[0]);
        });

        input.click();
    }

    editProject(id: string, newData: IProject): void {
        const project = this.getProject(id);

        if (!project) {
            console.error(`No project found with ID ${id}`);
            return;
        }

        project.name = newData.name;
        project.description = newData.description;
        project.status = newData.status;
        project.userRole = newData.userRole;
        project.finishDate = newData.finishDate;

        this.updateProjectUI(project);
    }

    updateProjectUI(project: Project): void {
        this.setDetailsPage(project);
    
        const projectCard = this.findProjectCard(project.id);
        if (projectCard) {
            console.log(projectCard)
            project.updateUI();
        }
    }
    
    private findProjectCard(projectId: string): HTMLElement | null {
    const projectCards = this.ui.querySelectorAll('.project-card');
    for (const card of projectCards) {
        const projectIdAttribute = card.getAttribute('data-project-id');
        if (projectIdAttribute === projectId) {
            return card as HTMLElement;
        }
    }
    return null;
}
   

}


