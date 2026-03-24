import axios from "axios";
const baseURL = "http://localhost:3001/api/persons";

const getAll = () => axios.get(baseURL);

const create = (newPerson) => axios.post(baseURL, newPerson);

const deleteByID = (personToDelete) =>
  axios.delete(baseURL + `/${personToDelete}`);

const update = (id, newPerson) => axios.put(baseURL + `/${id}`, newPerson);

export default { getAll, create, deleteByID, update };
