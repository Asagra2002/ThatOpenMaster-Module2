import * as THREE from "three"
import * as OBC from "openbim-components"
import { IProject, ProjectStatus, UserRole } from "./class/Project"
import { ProjectsManager } from "./class/ProjectsManager"
import { TodoCreator } from "./bim_components/TodoCreator"

function showModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

// This document object is provided by the browser, and its main purpose is to help us interact with the DOM.
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
} else {
  console.warn("New projects button was not found")
}

const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(projectForm)
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    }
    try {
      const project = projectsManager.newProject(projectData)
      console.log(project)
      projectForm.reset()
      closeModal("new-project-modal")
    } catch (err) {
      alert(err)
    }
  })
} else {
	console.warn("The project form was not found. Check the ID!")
}

const exportProjectsBtn= document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

// OpenBIM Components Viewer
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

const ifcLoader = new OBC.FragmentIfcLoader(viewer)
ifcLoader.settings.wasm = {
  path: "https://unpkg.com/web-ifc@0.0.43/",
  absolute: true
}

const highlighter = new OBC.FragmentHighlighter(viewer)
highlighter.setup()

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList()
})

const classifier = new OBC.FragmentClassifier(viewer)

const classificationsWindow = new OBC.FloatingWindow(viewer)
viewer.ui.add(classificationsWindow)
classificationsWindow.title = "Model Groups"
classificationsWindow.visible = false

const classificationsBtn = new OBC.Button(viewer)
classificationsBtn.materialIcon = "account_tree"
classificationsBtn.onClick.add(() => {
  classificationsWindow.visible = !classificationsWindow.visible
  classificationsBtn.active = classificationsWindow.visible
})

async function createModelTree() {
  const fragmentTree = new OBC.FragmentTree(viewer)
  await fragmentTree.init()
  await fragmentTree.update(["model", "storeys", "entities"])
  const tree = fragmentTree.get().uiElement.get("tree")
  fragmentTree.onHovered.add((fragmentMap) => {
    highlighter.highlightByID("hover", fragmentMap)
  })
  fragmentTree.onSelected.add((fragmentMap) => {
    highlighter.highlightByID("select", fragmentMap)
  })
  return tree
}

ifcLoader.onIfcLoaded.add(async (model) => {
  highlighter.update()

  classifier.byStorey(model)
  classifier.byEntity(model)
  classifier.byModel(model.name, model)
  console.log(classifier)
  const tree = await createModelTree()
  await classificationsWindow.slots.content.dispose(true)
  classificationsWindow.addChild(tree)

  propertiesProcessor.process(model)
  highlighter.events.select.onHighlight.add((fragmentMap) => {
    const expressID = [...Object.values(fragmentMap)[0]][0]
    propertiesProcessor.renderProperties(model, Number(expressID))
  })
})

const todoCreator = new TodoCreator(viewer)
await todoCreator.setup()

const toolbar = new OBC.Toolbar(viewer)
toolbar.addChild(
  ifcLoader.uiElement.get("main"),
  classificationsBtn,
  propertiesProcessor.uiElement.get("main"),
  todoCreator.uiElement.get("activationButton")
)
viewer.ui.addToolbar(toolbar)