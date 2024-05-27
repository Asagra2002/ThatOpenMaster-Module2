import * as THREE from "three"
import * as OBC from "openbim-components"
import * as React from "react"
import * as ReactDOM from "react-dom/client"
import * as Router from "react-router-dom"
import { Sidebar } from "./react-components/Sidebar.tsx"
import { ProjectsPage } from "./react-components/ProjectsPage.tsx"
import { ProjectDetailsPage } from "./react-components/ProjectDetailsPage.tsx"
import { FragmentsGroup } from "bim-fragment"
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { IProject, ProjectStatus, UserRole } from "./class/Project.ts";
import { ProjectsManager } from "./class/ProjectsManager.ts";
import { cameraNormalMatrix, modelNormalMatrix } from "three/examples/jsm/nodes/Nodes.js"
import { createMeshesFromInstancedMesh } from "three/examples/jsm/utils/SceneUtils.js"
import { TodoCreator } from "./bim_components/TodoCreator/index.ts"
import { SimpleQto } from "./bim_components/SimpleQTO/index.ts"
import { ViewerProvider } from "./react-components/IFCviewer.tsx"

const projectsManager = new ProjectsManager()

const rootElement = document.getElementById("app") as HTMLDivElement
const appRoot =ReactDOM.createRoot(rootElement)
appRoot.render(
    <>
      <Router.BrowserRouter>
        <ViewerProvider>
          <Sidebar />
          <Router.Routes>
            <Router.Route path="/" element={ <ProjectsPage projectsManager={projectsManager} /> }></Router.Route>
            <Router.Route path="/project/:id" element={ <ProjectDetailsPage projectsManager={projectsManager} /> }></Router.Route>
          </Router.Routes>   
        </ViewerProvider>
      </Router.BrowserRouter>

    </>
    
)
