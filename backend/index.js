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

  if (error.name === "ValidationError")
    return response.status(400).json({ error: error.message });

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
app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});
app.get("/api/persons/:id", (req, res, next) => {
  const idToFind = req.params.id;
  Person.findById(idToFind)
    .then((person) => {
      if (!person) return res.status(404).end();

      res.json(person);
    })
    .catch((error) => next(error));
});
app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    res.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date().toString()}</p>
  `);
  });
});

app.post("/api/persons", (req, res, next) => {
  const personToAdd = req.body;

  const newPerson = new Person({
    ...personToAdd,
  });
  newPerson
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { number: numberToUpdate } = req.body;
  const idToUpdate = req.params.id;

  Person.findById(idToUpdate)
    .then((person) => {
      if (!person) return res.status(404).end();

      person.number = numberToUpdate;

      return person.save().then((updatedPerson) => res.json(updatedPerson));
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const idToDelete = req.params.id;
  Person.findByIdAndDelete(idToDelete)
    .then(() => {
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
