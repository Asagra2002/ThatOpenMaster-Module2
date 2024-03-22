import { IProject, Project } from "./Project.ts"

export class ProjectsManager {
   list: Project[] = []
   ui: HTMLElement

   constructor (container: HTMLElement) {
    this.ui = container
    this.newProject({
        name: "Default Project",
        description: "This is just a default app project",
        status: "pending",
        userRole: "architect",
        finishDate: new Date()
    })
   }

   newProject(data: IProject){
    const projectNames = this.list.map((project) => { 
        return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`The project with the name "${data.name}" already exists`)
    }
    const project = new Project(data)
    project.ui.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      if (!projectsPage || !detailsPage) { return }
      projectsPage.style.display = "none"
      detailsPage.style.display = "flex"
      this.setDetailsPage(project)
    })
    this.ui.append(project.ui)	
    this.list.push(project)
    return project
  }
   private setDetailsPage(project: Project){

    const detailsPage = document.getElementById("project-details")as HTMLDivElement
    if (!detailsPage) return console.warn("Page not found") 
    const name = detailsPage.querySelector("[data-project-info = 'name']")
    if (name) name.textContent = project.name
    const description = detailsPage.querySelector("[data-project-info = 'description']")
    if (description)description.textContent = project.description
    const cardName = detailsPage.querySelector("[data-project-info = 'cardName']")
    if (cardName) cardName.textContent = project.name
    const cardDescription = detailsPage.querySelector("[data-project-info = 'cardDescription']")
    if (cardDescription) cardDescription.textContent = project.description
    const status = detailsPage.querySelector("[data-project-info = 'status']")
    if (status) status.textContent = project.status 
    const userRole = detailsPage.querySelector("[data-project-info = 'userRole']")
    if (userRole) userRole.textContent = project.userRole
    const finishDate = detailsPage.querySelector("[data-project-info = 'finishDate']")
    if (finishDate) {
      let dateString = project.finishDate
      let dateObj = new Date(dateString)
      finishDate.textContent = dateObj.toDateString()
  }
    const cost = detailsPage.querySelector("[data-project-info='cost']")
    if (cost) cost.textContent = '$' + String(project.cost)
    const progress = detailsPage.querySelector( "[data-project-info='progress']")as HTMLDivElement
      if(progress){
        progress.textContent = project.progress * 100 + "%"
        progress.style.width = project.progress * 100 + "%"
      }
   }

   getProject(id:string) {
    const project = this.list.find((project) => {
        return project.id === id
    })
    return project
}

   deleteProject(id:string) {
    const project = this.getProject(id)
    if (!project) { return }
    const remaining = this.list.filter((project) => {
        return project.id !== id
    })
    this.list = remaining
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

   importFromJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const json = reader.result
      if (!json) { return }
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (error) {
          
        }
      }
    })
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) { return }
      reader.readAsText(filesList[0])
    })
    input.click()
  }
}
// comentario para git
const btnProyectos = document.getElementById("projects-btn")
if (btnProyectos) {
  btnProyectos.addEventListener("click", () => {
    const projectsPage = document.getElementById("projects-page")
    const detailsPage = document.getElementById("project-details")

    if(!projectsPage || !detailsPage){ return }
    projectsPage.style.display = "flex"
    detailsPage.style.display = "none"
  })
}