import * as React from "react"
import * as OBC from "openbim-components"
import { FragmentsGroup } from "bim-fragment"
import { Project, TodoCreator } from "../bim_components/TodoCreator/index.ts"
import { SimpleQto } from "../bim_components/SimpleQTO/index.ts"
import { IProject } from "../class/Project.ts"


interface IViewerContext {
  viewer: OBC.Components | null
  setViewer: (viewer: OBC.Components | null) => void
}

export const ViewerContext =React.createContext<IViewerContext>(
  { viewer: null, setViewer: () => {} }
)
export function ViewerProvider (props: {children: React.ReactNode}) {
  const [ viewer, setViewer ] = React.useState<OBC.Components | null>(null)
  return (
    <ViewerContext.Provider value = {{viewer, setViewer}}>
      {props.children}
    </ViewerContext.Provider>
  )
}

export function IFCviewer() {
  const { setViewer } = React.useContext (ViewerContext)
  let viewer: OBC.Components

  const createViewer = async() => {
    viewer = new OBC.Components()
    setViewer (viewer)

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

  highlighter.events.select.onHighlight.add(fragmentIdMap => {
    const fragmentID = Object.keys(fragmentIdMap)[0]
    const fragment = fragmentManager.list[fragmentID]
    if (!(fragment && fragment.group)) {return}
    const model = fragment.group
    if (!model) return
    const expressID = [...fragmentIdMap[fragmentID]][0]
    propertiesProcessor.renderProperties(model, Number(expressID))
    
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
      input.click();
    });

    // Provide the required data for the Project constructor
    const projectData: IProject = {
      // populate with appropriate values
      name: "Sample Project",
      cost: undefined,
      progress: undefined,
      description: "",
      status: "Pending",
      userRole: "Architect",
      finishDate: new Date(),
    };
    const setupProject: Project = new Project(projectData);
    const todoCreator = new TodoCreator(viewer);
    await todoCreator.setup(setupProject);

    const simpleQto = new SimpleQto(viewer);
    await simpleQto.setup();

    const propsFinder = new OBC.IfcPropertiesFinder(viewer);
    await propsFinder.init();
    propsFinder.onFound.add((FragmentIDMap) => {
      highlighter.highlightByID("select", FragmentIDMap);
    });

    todoCreator.onProjectCreated.add((todo) => {
      console.log(todo);
    });

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
  }

React.useEffect(() => {
  createViewer()
  return () => {viewer.dispose()
    setViewer(null)
  }
}, [])

    return (
        <div
          id="viewer-container"
          className="dashboard-card"
          style={{ minWidth: 0, position: "relative" }}
          />
    )
}