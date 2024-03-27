import { v4 as uuidv4 } from 'uuid'

export type ProjectStatus = "pending" | "active" | "finished"
export type UserRole = "architect" | "engineer" | "developer"

export interface IProject {
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date
    todos: IToDo[]
}

export class Project implements IProject {
    name: string
    description: string
    status: "pending" | "active" | "finished"
    userRole: "architect" | "engineer" | "developer"
    finishDate: Date

    ui: HTMLDivElement
    cost: number = 0
    progress: number = 0
    id: string
    todos: IToDo[] = []

    constructor(data: IProject) {
        this.id = uuidv4();
        for (const key in data) {
            if (key === "ui") {
                continue
            }
            this[key] = data[key]
        }
        this.setUI()
    }

    setUI() {
        if (this.ui) {
            return
        }
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        this.ui.innerHTML = `
            <div class="card-header">
                <p style="background-color: ${getRandomColor()}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">HC</p>
                <div>
                    <h5>${this.name}</h5>
                    <p>${this.description}</p>
                </div>
            </div>
            <div class="card-content">
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.status}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Role</p>
                    <p>${this.userRole}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Cost</p>
                    <p>$${this.cost}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Estimated Progress</p>
                    <p>${this.progress * 100}%</p>
                </div>
            </div>`
    }

    updateUI() {
        const nameElement = this.ui.querySelector(".card-header h5")
        if (nameElement) {
            nameElement.textContent = this.name
        }
        const descriptionElement = this.ui.querySelector("#descriptionCard")
        if (descriptionElement) {
            descriptionElement.textContent = this.description
        }
        const statusElement = this.ui.querySelector(".card-content .card-property p:nth-child(2)")
        if (statusElement) {
            statusElement.textContent = this.status
        }
        const roleElement = this.ui.querySelector(".card-content .card-property:nth-child(2) p:nth-child(2)")
        if (roleElement) {
            roleElement.textContent = this.userRole
        }
        const costElement = this.ui.querySelector(".card-content .card-property:nth-child(3) p:nth-child(2)")
        if (costElement) {
            costElement.textContent = this.cost.toString()
        }
        const progressElement = this.ui.querySelector(".card-content .card-property:nth-child(4) p:nth-child(2)")
        if (progressElement) {
            progressElement.textContent = `${this.progress * 100}%`
        }
    }

    // getEditData(): IProject {
    //     return {
    //         name: this.name,
    //         description: this.description,
    //         userRole: this.userRole,
    //         status: this.status,
    //         finishDate: this.finishDate,
    //     };
    // }

    addTodo(description: string): void {
        const todo: IToDo = {
            id: uuidv4(),
            description: description,
            completed: false,
        }
        this.todos.push(todo)
        this.updateUI()
    }

    deleteTodo(todoId: string): void {
        this.todos = this.todos.filter((todo) => todo.id !== todoId)
        this.updateUI()
    }

    updateTodoStatus(todoId: string, completed: boolean): void {
        const todo = this.todos.find((todo) => todo.id === todoId);
        if (todo) {
            todo.completed = completed
            this.updateUI()
        }
    }
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color;
}

export interface IToDo {
    id: string
    description: string
    completed: boolean
}
