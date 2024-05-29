import * as OBC from "openbim-components";
import { TodoCard } from "./TodoCard";
import * as THREE from "three";
import { v4 as uuidv4 } from 'uuid';
import { Status } from "../../../types/types";
import { parseFragmentIdMap, showModal } from "../../../utils/utils";
import { updateDocument } from "../../../firebase";
import TWEEN from '@tweenjs/tween.js';

export type ToDoPriority = "Low" | "Medium" | "High";

interface TodoCamera {
    position: THREE.Vector3;
    target: THREE.Vector3;
}

interface TodoConstructorArgs {
    description: string;
    date: Date;
    status: Status;
    priority: ToDoPriority;
    projectId: string;
    fragmentMap?: OBC.FragmentIdMap;
    todoCamera?: TodoCamera;
    id?: string;
}

export class Todo extends OBC.Component<null> {
    onEditConfirm = new OBC.Event();
    description: string;
    date: Date;
    fragmentMap: OBC.FragmentIdMap;
    camera: OBC.OrthoPerspectiveCamera;
    todoCamera: TodoCamera;
    status: Status;
    priority: ToDoPriority;
    id: string;
    private _components: OBC.Components;
    enabled = true;
    projectId: string;
    TodoCard: TodoCard;
    highlighter: OBC.FragmentHighlighter;

    constructor(components: OBC.Components, {
        description,
        date,
        status,
        priority,
        projectId,
        fragmentMap,
        todoCamera,
        id
    }: TodoConstructorArgs) {
        super(components);
        this._components = components;
        this.fragmentMap = fragmentMap ?? {}; // Handle case when fragmentMap is not provided
        this.id = id ?? uuidv4();
        this.status = status;
        this.projectId = projectId;

        const camera = this._components.camera;
        if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("TodoCreator needs the Ortho Perspective Camera in order to work!");
        }

        const position = new THREE.Vector3();
        camera.controls.getPosition(position);
        const target = new THREE.Vector3();
        camera.controls.getTarget(target);
        this.camera = camera;

        this.todoCamera = todoCamera ?? { position, target };
        this.description = description;
        this.date = date;
        this.priority = priority;

        this.TodoCard = new TodoCard(components);
        this.TodoCard.priority = this.priority;
        this.TodoCard.status = this.status;
        this.TodoCard.description = this.description;
        this.TodoCard.date = this.date;
    }

    get(...args: any[]): null {
        return null;
    }

    editTodo(editForm: any): void {
        this.description = editForm.slots.content.children[0].value;
        this.priority = editForm.slots.content.children[1].value;
        this.status = editForm.slots.content.children[2].value;

        this.TodoCard.description = this.description;
        this.TodoCard.priority = this.priority;
        this.TodoCard.status = this.status;
        this.TodoCard.date = this.date;

        this.updateDatabase();
        editForm.visible = false;
        editForm.slots.content.children[0].value = "";
        editForm.slots.content.children[1].value = "";
        editForm.slots.content.children[2].value = "";
    }

    updateDatabase(): void {
        updateDocument("/todos", this.id, {
            description: this.description,
            status: this.status,
            priority: this.priority
        });
    }

    setupEditForm(editForm: any): void {
        editForm.visible = true;
        editForm.slots.content.children[0].value = this.description;
        editForm.slots.content.children[1].value = this.priority;
        editForm.slots.content.children[2].value = this.status;
    }

    async setupOnClick(editForm: any): Promise<void> {
        this.highlighter = await this._components.tools.get(OBC.FragmentHighlighter);

        if (!this.fragmentMap) {
            this.fragmentMap = this.highlighter.selection.select;
        }
        this.TodoCard.count = this.fragmentMap[Object.keys(this.fragmentMap)[0]].size;

        this.TodoCard.onEdit.add(() => {
            this.setupEditForm(editForm);
        });

        this.TodoCard.onCardClick.add(() => {
            const position = new THREE.Vector3();
            this.camera.controls.getPosition(position);
            const startPosition = {
                x: position.x,
                y: position.y,
                z: position.z
            };

            const targetPosition = {
                x: this.todoCamera.position.x,
                y: this.todoCamera.position.y,
                z: this.todoCamera.position.z
            };

            new TWEEN.Tween(startPosition)
                .to(targetPosition, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    this.camera.controls.setLookAt(
                        startPosition.x,
                        startPosition.y,
                        startPosition.z,
                        this.todoCamera.target.x,
                        this.todoCamera.target.y,
                        this.todoCamera.target.z
                    );
                })
                .onComplete(() => {
                    console.log("Tween complete!");
                })
                .start();

            const fragmentMapLength = Object.keys(this.fragmentMap).length;
            if (fragmentMapLength === 0) { return; }
            this.highlighter.highlightByID("select", this.fragmentMap);
        });
    }

    async setupSelection(): Promise<void> {
        this.highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
        this.fragmentMap = this.highlighter.selection.select;
    }
}
