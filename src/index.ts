import { IProject, ProjectStatus, UserRole } from "./class/Project.ts"
import { ProjectsManager } from "./class/ProjectsManager.ts"

function showModal(id: string) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal();
  } else {
    console.warn("The provided modal wasn't found. ID: ", id);
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close();
  } else {
    console.warn("The provided modal wasn't found. ID: ", id);
  }
}

// Definición de la función toggleModal
function toggleModal(id: string, action: string = "toggle") {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    if (action === "show") {
      modal.showModal();
    } else if (action === "hide") {
      modal.close();
    } else {
      modal.toggle();
    }
  } else {
    console.warn("The provided modal wasn't found. ID: ", id);
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement;
const projectsManager = new ProjectsManager(projectsListUI);

// con esta llamada al objeto, js habilita el boton
const newProjectBtn = document.getElementById("new-project-btn");
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => { showModal("new-project-modal") });
} else {
  console.warn("New projects button was not found");
}

const projectForm = document.getElementById("new-project-form");
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(projectForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    };
    try {
      const project = projectsManager.newProject(projectData);
      projectForm.reset();
      toggleModal("new-project-modal", "hide");
    } catch (err) {
      const errorMessage = document.getElementById("error-message") as HTMLElement;
      errorMessage.innerHTML = `${err}`;
      toggleModal("error-message-modal", "show");
    }
  });

  const errorMessageCheckBTN = document.getElementById("error-message-check-button") as HTMLButtonElement;
  errorMessageCheckBTN.addEventListener("click", () => {
    toggleModal("error-message-modal", "hide");
  });
} else {
  console.warn("The project form was not found. Check the ID!");
}

const exportProjectsBtn = document.getElementById("export-projects-btn")
if(exportProjectsBtn){
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if(importProjectsBtn){
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}
