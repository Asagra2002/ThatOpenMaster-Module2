// Import the functions you need from the SDKs you need
import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app";
import { IProject } from "../class/Project";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzfdQ2BycVvR_ea6c_1k0p_JwdsYheLiE",
  authDomain: "bim-dev-app.firebaseapp.com",
  projectId: "bim-dev-app",
  storageBucket: "bim-dev-app.appspot.com",
  messagingSenderId: "989909983763",
  appId: "1:989909983763:web:0f4963dca3daa9927bd5e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestoreDB = Firestore.getFirestore()

export function getCollection<T>(path:string) {
  return Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>
}

export async function deleteDocument( collectionPath: string, id: string) {
  const doc = Firestore.doc(firestoreDB,`${collectionPath}/${id}`)
  await Firestore.deleteDoc(doc)

}


export function updateDocument<T extends Record<string, any>>(collectionPath: string, id: string, data: T) {
  const doc = Firestore.doc(firestoreDB, `${collectionPath}/${id}`)
  Firestore.updateDoc(doc, data)
}
export async function addDocument<T extends Record<string, any>>(collectionPath: string, data: T) {
  const result = await Firestore.addDoc(getCollection(collectionPath),data)
  console.log(result)
  return result.id
}
