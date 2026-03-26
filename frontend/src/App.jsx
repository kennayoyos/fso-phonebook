import { useEffect, useState } from "react";
import personService from "./services/persons";
import Notification from "./components/Notification";

const Filter = ({ searchTerm, handleSearchChange }) => (
  <div>
    filter shown with
    <input value={searchTerm} onChange={handleSearchChange} />
  </div>
);

const PersonForm = ({
  newName,
  newNumber,
  handleSubmit,
  handleNameChange,
  handleNumberChange,
}) => (
  <form onSubmit={handleSubmit}>
    {/* Name Input */}
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    {/* Phone Number Input */}
    <div>
      number: <input value={newNumber} onChange={handleNumberChange} />
    </div>

    {/* Form Submit Button */}
    <div>
      <button type="submit">add</button>
    </div>
  </form>
);

const Persons = ({ persons, setPersons, setNotification, searchTerm }) => {
  const handleDelete = (personToDelete) => {
    return () => {
      // Confirm deletion from user
      const canDelete = window.confirm(`Delete ${personToDelete.name} ?`);

      if (canDelete) {
        // Delete from the server
        personService
          .deleteByID(personToDelete.id)
          .then((response) => {
            // Delete from the state
            if (response.status === 204) {
              const updatedPersons = persons.filter(
                (person) => person.id !== personToDelete.id,
              );
              setPersons(updatedPersons);
            }
          })
          .catch((error) => {
            // notify users
            setNotification({
              message: error.message,
              isError: true,
            });
          });
      }
    };
  };
  return (
    <div>
      {persons
        .filter((person) =>
          person.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((person) => (
          <span key={person.name}>
            {person.name} {person.number}{" "}
            <button onClick={handleDelete(person)}>delete</button>
            <br />
          </span>
        ))}
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({});

  // fetch initial data
  useEffect(() => {
    personService.getAll().then((response) => {
      const initialData = response.data;
      setPersons(initialData);
    });
  }, []);

  useEffect(() => {
    if (!notification.message) return;
    const timeoutID = setTimeout(() => setNotification({}), 3000);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [notification]);

  // event handlers
  const handleSubmit = (event) => {
    event.preventDefault();

    // check for existing names/number
    const nameExists = persons.some((person) => newName === person.name);
    if (!nameExists) {
      // update the data on the server
      personService
        .create({
          name: newName,
          number: newNumber,
        })
        .then((response) => {
          const dataAdded = response.data;

          // add on to the array
          setPersons(persons.concat(dataAdded));

          // notify users
          setNotification({
            message: `Added ${dataAdded.name}`,
            isError: false,
          });
        })
        .catch((error) => {
          const errorMessage = error.response.data.error;
          setNotification({
            message: errorMessage,
            isError: true,
          });
        });
    } else {
      const replaceNumber = window.confirm(
        `${newName} is already added to the phonebook, replace the old number with a new one ?`,
      );

      if (replaceNumber) {
        const personToUpdate = persons.find(
          (person) => person.name === newName,
        );
        const updatedNumber = {
          ...personToUpdate,
          number: newNumber,
        };

        // Update the server
        personService
          .update(personToUpdate.id, updatedNumber)
          .then((response) => {
            const returnedPerson = response.data;

            // Update the state
            const updatedPersons = persons.map((person) =>
              person.id === personToUpdate.id ? returnedPerson : person,
            );
            setPersons(updatedPersons);

            // notify users
            setNotification({
              message: `Changed ${returnedPerson.name}'s number`,
              isError: false,
            });
          })
          .catch((error) => {
            if (error.response && error.response.status === 404) {
              setNotification({
                message: `Information on ${newName} has already been removed from server`,
                isError: true,
              });
            }
          });
      }
    }
    // clear the input
    setNewName("");
    setNewNumber("");
  };

  const handleNameChange = (event) => setNewName(event.target.value);
  const handleNumberChange = (event) => setNewNumber(event.target.value);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  return (
    <div>
      <h2>Phonebook</h2>

      {notification && (
        <Notification
          message={notification.message}
          isError={notification.isError}
        />
      )}

      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />

      <h3>Add a new</h3>

      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        handleSubmit={handleSubmit}
      />

      <h3>Numbers</h3>

      <Persons
        persons={persons}
        setPersons={setPersons}
        setNotification={setNotification}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default App;
