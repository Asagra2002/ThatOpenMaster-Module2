import * as React from "react"
import * as Router from "react-router-dom"
import { ViewerContext } from "./IFCviewer"
import { TodoCreator } from "../bim_components/TodoCreator"

export function Sidebar() {
  const { viewer } = React.useContext(ViewerContext)
  const createTodo = async () => {
    if (!viewer) { return }
    const todoCreator = await viewer.tools.get(TodoCreator)
    todoCreator.addTodo("My Custom todo", "Normal")
  }
  return (
    <aside id="sidebar">
      <img id="company-logo" src="./assets/company-logo.svg" alt="Construction Company" />
      <ul id="nav-buttons">
        <Router.Link to = "/">
          <li><span className="material-icons-round">apartment</span>Projects</li>
        </Router.Link>
      <li><span className="material-icons-round">people</span>Users</li>
      {/* <li onClick = {createTodo}><span className="material-icons-round">construction</span>Create ToDo</li>   */}
        
      </ul>
    </aside>
  )
}