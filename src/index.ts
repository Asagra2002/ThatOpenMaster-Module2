import * as THREE from "three"
import * as OBC from "openbim-components"
import { FragmentsGroup } from "bim-fragment"
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { IProject, ProjectStatus, UserRole } from "./class/Project.ts";
import { ProjectManager } from "./class/ProjectManager.ts";
import { cameraNormalMatrix, modelNormalMatrix } from "three/examples/jsm/nodes/Nodes.js"
import { createMeshesFromInstancedMesh } from "three/examples/jsm/utils/SceneUtils.js"
import { TodoCreator } from "./bim_components/TodoCreator"
import { SimpleQto } from "./bim_components/SimpleQTO"

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
    console.warn("New projects button not found projects");
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

function formatDate(date: Date): string {
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    return `${weekday},  ${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}



//OpenBIM-Components viewer
const viewer = new OBC.Components()

const sceneComponent = new OBC.SimpleScene(viewer)
viewer.scene = sceneComponent
const scene = sceneComponent.get()
sceneComponent.setup()
scene.background = null

const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement
const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
viewer.renderer = rendererComponent

const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
viewer.camera = cameraComponent

const raycasterComponent = new OBC.SimpleRaycaster(viewer)
viewer.raycaster = raycasterComponent

viewer.init()
cameraComponent.updateAspect()
rendererComponent.postproduction.enabled = true

const fragmentManager = new OBC.FragmentManager(viewer)
function exportFragments(model: FragmentsGroup) {
    const fragmentBinary = fragmentManager.export (model)
    const blob = new Blob([fragmentBinary])
    const url =  URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${model.name.replace(".ifc", "")}.frag`
    a.click()
    URL.revokeObjectURL(url)
    
    const json = JSON.stringify(model.properties, null, 2)
    const jsonblob = new Blob([json], { type: 'application/json' })
    const jsonUrl =  URL.createObjectURL(jsonblob)
    const jsona = document.createElement('a')
    jsona.href = jsonUrl
    jsona.download = `${model.name.replace(".ifc", "")}`
    jsona.click ()
    URL.revokeObjectURL(jsonUrl)
}

const ifcLoader = new OBC.FragmentIfcLoader(viewer)
ifcLoader.settings.wasm = {
  path: "https://unpkg.com/web-ifc@0.0.44/",
  absolute: true
}

const highlighter = new OBC.FragmentHighlighter(viewer)
highlighter.setup()

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList()
})

const classifier = new OBC.FragmentClassifier(viewer)
const classificationWindow = new OBC.FloatingWindow(viewer)
classificationWindow.visible = false
viewer.ui.add(classificationWindow)
classificationWindow.title = "Model Groups"

const classificationsBtn = new OBC.Button(viewer)
classificationsBtn.materialIcon = "account_tree"

classificationsBtn.onClick.add(() => {
    classificationWindow.visible = !classificationWindow.visible
    classificationWindow.active = classificationWindow.visible
})

async function createModelTree() {
    const fragmentTree = new OBC.FragmentTree(viewer)
    await fragmentTree.init()
    await fragmentTree.update(["storeys", "entities"])
    fragmentTree.onHovered.add((fragmentMap) => {
      highlighter.highlightByID("hover", fragmentMap)
    })
    fragmentTree.onSelected.add((fragmentMap) => {
      highlighter.highlightByID("select", fragmentMap)
    })
    const tree = fragmentTree.get().uiElement.get("tree")
    return tree
}

const culler = new OBC.ScreenCuller(viewer)
cameraComponent.controls.addEventListener("sleep", () => {
  culler.needsUpdate = true
  
})
async function onModelLoaded(model: FragmentsGroup) {
    highlighter.update()
    for (const fragment of model.items) {culler.add(fragment.mesh)}
    culler.needsUpdate = true

    try {
        classifier.byStorey(model)
        classifier.byEntity(model)
        const tree = await createModelTree()
        await classificationWindow.slots.content.dispose(true)
        classificationWindow.addChild(tree)

        propertiesProcessor.process(model)
        highlighter.events.select.onHighlight.add((fragmentMap) => {
            const expressID = [...Object.values(fragmentMap)[0]][0]
            propertiesProcessor.renderProperties(model, Number (expressID))
        })   
    } catch (error) {
        console.error("Error when grouping by floor:", error)
    }
}

function importPropertiesJSON(model: FragmentsGroup) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener("load", () => {
        const json = reader.result
        if (!json) { return }
        model.properties = JSON.parse(json as string)
        onModelLoaded(model)
    })
    input.addEventListener('change', () => {
        const filesList = input.files
        if (!filesList) {return}
        const file = filesList[0]
        reader.readAsText(file)
    })
    input.click()

}

ifcLoader.onIfcLoaded.add(async(model) => {
  exportFragments(model)
  onModelLoaded(model)
})

fragmentManager.onFragmentsLoaded.add((model) => {
    importPropertiesJSON(model)
    if(!fragmentManager.baseCoordinationModel) {
        fragmentManager.baseCoordinationModel = fragmentManager.groups[0].uuid
    }
    onModelLoaded(model)
})

const importFragmentBtn = new OBC.Button(viewer)
importFragmentBtn.materialIcon = "upload"
importFragmentBtn.tooltip = "Load FRAG"

importFragmentBtn.onClick.add(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.frag'
    const reader = new FileReader()
    reader.addEventListener("load", async () => {
      const binary = reader.result
      if (!(binary instanceof ArrayBuffer)) { return }
      const fragmentBinary = new Uint8Array(binary)
      await fragmentManager.load(fragmentBinary)
    })
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) { return }
      reader.readAsArrayBuffer(filesList[0])
    })
    input.click()
  })

  const todoCreator = new TodoCreator(viewer)
  await todoCreator.setup()

  const simpleQto = new SimpleQto(viewer)
  await simpleQto.setup()

  const propsFinder = new OBC.IfcPropertiesFinder(viewer)
  await propsFinder.init()
  propsFinder.onFound.add((FragmentIDMap) => {
      highlighter.highlightByID("select", FragmentIDMap)
  })

  todoCreator.onProjectCreated.add((todo) => {
    console.log(todo)
  }) 
  
  const toolbar = new OBC.Toolbar(viewer)
  toolbar.addChild(
    ifcLoader.uiElement.get("main"),
    importFragmentBtn,
    classificationsBtn,
    propertiesProcessor.uiElement.get("main"),
    propsFinder.uiElement.get("main"),
    fragmentManager.uiElement.get("main"),
    todoCreator.uiElement.get("activationButton"),
    simpleQto.uiElement.get("activationBtn")
  )
  viewer.ui.addToolbar(toolbar)