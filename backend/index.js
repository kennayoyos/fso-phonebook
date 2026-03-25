require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const Person = require("./models/person");

const app = express();

// Helper functions
const customLogging = () =>
  morgan((tokens, req, res) => {
    const finalLog = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ];

    if (req.method === "POST") finalLog.push(JSON.stringify(req.body));

    return finalLog.join(" ");
  });
const errorHandler = (error, request, response, next) => {
  console.error(error);

  if (error.name === "CastError")
    return response.status(400).send({ error: "malformatted id" });

  next(error);
};
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// Middlewares
app.use(express.static("dist"));
app.use(express.json());
app.use(customLogging());

// API Routes
app.get("/", (req, res) => res.send("<h1>Hello World!</h1>"));
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});
app.get("/api/persons/:id", (req, res) => {
  const idToFind = req.params.id;
  Person.findById(idToFind)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => {
      console.log("Error finding person by id:", error.message);
      res.statusMessage = "Error finding person";
      res.status(404).end();
    });
});

app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    res.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date().toString()}</p>
  `);
  });
});

app.post("/api/persons", (req, res) => {
  const personToAdd = req.body;

  // null checks
  if (!personToAdd.name) {
    res.statusMessage = "Person's name is missing";
    return res.status(400).end();
  }
  if (!personToAdd.number) {
    res.statusMessage = "Person's number is missing";
    return res.status(400).end();
  }

  // WIP: dupicate check
  // const nameExists = persons.some((person) => person.name === personToAdd.name);
  // if (nameExists) {
  //   res.statusMessage = "Name already exists in the phonebook";
  //   return res.status(409).json({ error: "name must be unique" });
  // }

  const newPerson = new Person({
    ...personToAdd,
  });
  newPerson.save().then((result) => {
    res.status(201).json(result);
  });
});

app.delete("/api/persons/:id", (req, res, next) => {
  const idToDelete = req.params.id;
  Person.findByIdAndDelete(idToDelete)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// Post-Routes middlewares
app.use(unknownEndpoint);
app.use(errorHandler);

// Starting the server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
