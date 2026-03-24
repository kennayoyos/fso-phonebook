const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

// Helper functions
const generateID = (maxNum = 1_000_000) => {
  const idsUsed = new Set(persons.map((person) => person.id));

  let id = -1;
  do {
    id = Math.floor(Math.random() * maxNum);
  } while (idsUsed.has(id));

  return id;
};

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

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(customLogging());

// Data
let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// API Routes
app.get("/", (req, res) => res.send("<h1>Hello World!</h1>"));
app.get("/api/persons", (req, res) => res.json(persons));
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.statusMessage = "Given ID does not exist in the phonebook";
    res.status(404).end();
  }
});

app.get("/info", (req, res) =>
  res.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date().toString()}</p>
  `),
);

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

  // dupicate check
  const nameExists = persons.some((person) => person.name === personToAdd.name);

  if (nameExists) {
    res.statusMessage = "Name already exists in the phonebook";
    return res.status(409).json({ error: "name must be unique" });
  }

  const newPerson = {
    id: generateID(),
    ...personToAdd,
  };

  persons = persons.concat(newPerson);

  res.status(201).json(newPerson);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

// Starting the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
