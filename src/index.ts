import { IProject, ProjectStatus, UserRole, IToDo } from "./class/Project.ts";
import { ProjectManager } from "./class/ProjectManager.ts";

function showModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
        modal.showModal();
    } else {
        console.warn("The provided modal was not found. ID: ", id);
    }
}
       
function closeModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
        modal.close();
    } else {
        console.warn("The provided modal was not found. ID: ", id);
    }
}

const projectListUI = document.getElementById("project-list") as HTMLElement;
const projectManager = new ProjectManager(projectListUI);

const newProjectBtn = document.getElementById("new-project-btn");
if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => { showModal("new-project-modal"); });
} else {
    console.warn("New projects button not found proyectos");
}

const projectForm = document.getElementById("new-project-form");
if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(projectForm);

        const projectName = formData.get("name") as string;
        if (projectName.length < 5) {
            const mensaje = document.getElementById("err") as HTMLElement;
            mensaje.textContent = "Project name must be at least 5 characters.";
            toggleModal("error");
            return;
        }
        const projectDate = formData.get("finishDate") as string;
        let finishDate;
        if (projectDate) {
            finishDate = new Date(projectDate);
        } else {
            finishDate = new Date();
        }

        const projectData: IProject = {
            name: projectName,
            description: formData.get("description") as string,
            userRole: formData.get("userRole") as UserRole,
            status: formData.get("status") as ProjectStatus,
            finishDate: finishDate,
            todos: []
        };
        try {
            const project = projectManager.newProject(projectData);
            projectForm.reset();
            toggleModal("new-project-modal");
            projectManager.getNameProject(projectData.name);
        } catch (error) {
            const mensaje = document.getElementById("err") as HTMLElement;
            mensaje.textContent = error;
            toggleModal("error");
        }
        projectManager.getTotalCost();
    });
} else {
    console.warn("The project form was not found. Check the ID!");
}

const exportProjectsBtn = document.getElementById("export-projects-btn");
if (exportProjectsBtn) {
    exportProjectsBtn.addEventListener("click", () => {
        projectManager.exportToJSON();
    });
}

const importProjectsBtn = document.getElementById("import-projects-btn");
if (importProjectsBtn) {
    importProjectsBtn.addEventListener("click", () => {
        projectManager.importToJSON();
    });
}

const btnProjects = document.getElementById("btn-projects");
if (btnProjects) {
    btnProjects.addEventListener("click", () => {
        const projectsPage = document.getElementById("project-page");
        const detailsPage = document.getElementById("project-details");

        if (!projectsPage || !detailsPage) { return; }
        projectsPage.style.display = "flex";
        detailsPage.style.display = "none";
    });
}

const btnError = document.getElementById("btnError");
if (btnError) {
    btnError.addEventListener("click", () => {
        toggleModal("error");
    });
}

const cancelBtn = document.getElementById("cancela-btn");
if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        toggleModal("new-project-modal");
    });
}

function toggleModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
        if (modal.open) {
            modal.close();
        } else {
            modal.showModal();
        }
    } else {
        console.warn("Id is not found", id);
    }
}

var projectList = document.getElementById("project-list");

if (projectList) {
    var firstCard = projectList.querySelector('.project-card');

    if (firstCard) {
        firstCard.remove();
    } else {
        console.warn("No card found to delete.");
    }
} else {
    console.warn("The element with the ID was not found 'project-list'.");
}

const btnEdit = document.getElementById('btnEdit');
const editProjectModal = document.getElementById('edit-project-modal');

if (btnEdit && editProjectModal) {
    btnEdit.addEventListener('click', () => {
        const projectNameElement = document.querySelector('[data-project-info="name2"]');
        const projectName = projectNameElement?.textContent || "";

        const project = projectManager.getProjectName(projectName);

        if (project) {
            const editProjectNameInput = document.querySelector('[name="nameEdit"]') as HTMLInputElement;
            const editProjectDescriptionInput = document.querySelector('[name="descriptionEdit"]') as HTMLInputElement;
            const editProjectStatusInput = document.querySelector('[name="statusEdit"]') as HTMLSelectElement;
            const editProjectRoleInput = document.querySelector('[name="userRoleEdit"]') as HTMLSelectElement;
            const editProjectFinishdateInput = document.querySelector('[name="finishDate"]') as HTMLInputElement;
            const editProjectCostInput = document.querySelector('[name="cost"]') as HTMLInputElement;

            if (editProjectNameInput && editProjectDescriptionInput &&
                editProjectStatusInput && editProjectRoleInput &&
                editProjectFinishdateInput && editProjectCostInput) {

                editProjectNameInput.value = project.name;
                editProjectDescriptionInput.value = project.description;
                editProjectRoleInput.value = project.userRole;
                editProjectStatusInput.value = project.status;

                const formattedDate = `${project.finishDate.getFullYear()}-${(project.finishDate.getMonth() + 1).toString().padStart(2, '0')}-${project.finishDate.getDate().toString().padStart(2, '0')}`;
                editProjectFinishdateInput.value = formattedDate;

                editProjectCostInput.value = project.cost.toString();

                showModal('edit-project-modal');
            } else {
                console.error('Edit form items not found.');
            }
        } else {
            console.error(`No project found with the name ${projectName}`);
        }
    });
}

const btnCancelEdit = document.getElementById("cancelEdit");
const btnAcceptEdit = document.getElementById("acceptEdit");

if (btnCancelEdit && btnAcceptEdit) {
    btnCancelEdit.addEventListener("click", () => {
        closeModal("edit-project-modal");
    });
    btnAcceptEdit.addEventListener("click", () => {
        const projectNameElement = document.querySelector('[data-project-info="name2"]');
        const projectName = projectNameElement?.textContent || "";
        const currentProject = projectManager.getProjectName(projectName);

        if (currentProject) {
            const editProjectNameInput = document.querySelector('[name="nameEdit"]') as HTMLInputElement;
            const editProjectDescriptionInput = document.querySelector('[name="descriptionEdit"]') as HTMLInputElement;
            const editProjectStatusInput = document.querySelector('[name="statusEdit"]') as HTMLSelectElement;
            const editProjectRoleInput = document.querySelector('[name="userRoleEdit"]') as HTMLSelectElement;
            const editProjectFinishdateInput = document.querySelector('[name="finishDate"]') as HTMLInputElement;
            const editProjectCostInput = document.querySelector('[name="cost"]') as HTMLInputElement;

            if (editProjectNameInput && editProjectDescriptionInput &&
                editProjectStatusInput && editProjectRoleInput &&
                editProjectFinishdateInput && editProjectCostInput) {

                currentProject.name = editProjectNameInput.value;
                currentProject.description = editProjectDescriptionInput.value;
                currentProject.status = editProjectStatusInput.value as ProjectStatus;
                currentProject.userRole = editProjectRoleInput.value as UserRole;
                currentProject.finishDate = new Date(editProjectFinishdateInput.value);
                currentProject.cost = parseFloat(editProjectCostInput.value);
                closeModal("edit-project-modal");
                projectManager.updateProjectUI(currentProject);
            } else {
                console.error('Edit form items not found.');
            }
        } else {
            console.error(`No project found with the name ${projectName}`);
        }
    });
}

const btnAddTodo = document.getElementById('add-todo-btn');

if (btnAddTodo) {
    btnAddTodo.addEventListener('click', () => {
        const todoDescriptionInput = document.getElementById("todo-description") as HTMLInputElement;
        const todoListElement = document.getElementById("todo-list");

        if (todoDescriptionInput && todoListElement) {
            const todoDescription = todoDescriptionInput.value;

            const projectNameElement = document.querySelector('[data-project-info="name2"]');
            const projectName = projectNameElement?.textContent || "";

            const currentProject = projectManager.getProjectName(projectName);

            if (currentProject) {
                const newTodo = {
                    description: todoDescription,
                    completed: false,
                };

                currentProject.addTodo(newTodo.description);

                todoDescriptionInput.value = "";

                updateTodoList(currentProject.todos, todoListElement);

                projectManager.updateProjectUI(currentProject);
            }
        }
    });
}

export { updateTodoList };

function updateTodoList(todos: IToDo[], todoListElement: HTMLElement): void {

    todoListElement.innerHTML = "";

    todos.forEach((todo) => {
        const todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");

        const todoContent = document.createElement("div");
        todoContent.style.display = "flex";
        todoContent.style.justifyContent = "space-between";
        todoContent.style.alignItems = "center";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                todoItem.classList.add('checked');
            } else {
                todoItem.classList.remove('checked');
            }
        });

        const description = document.createElement("p");
        description.textContent = todo.description;

        const date = document.createElement("p");
        date.style.marginLeft = "10px";
        date.textContent = formatDate(new Date());

        const deleteIcon = document.createElement("span");
        deleteIcon.innerHTML = "&#128465;";
        deleteIcon.style.cursor = "pointer";

        deleteIcon.addEventListener("click", () => {
            const projectNameElement = document.querySelector('[data-project-info="name2"]');
            const projectName = projectNameElement?.textContent || "";
            const currentProject = projectManager.getProjectName(projectName);

            if (currentProject) {
                currentProject.deleteTodo(todo.id);
                updateTodoList(currentProject.todos, todoListElement);
                projectManager.updateProjectUI(currentProject);
            }
        });

        todoContent.appendChild(checkbox);
        todoContent.appendChild(description);
        todoContent.appendChild(date);
        todoContent.appendChild(deleteIcon);

        todoItem.appendChild(todoContent);

        todoListElement.appendChild(todoItem);
    });
}

function formatDate(date: Date): string {
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    return `${weekday},  ${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}
