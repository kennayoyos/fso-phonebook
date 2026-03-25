const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as an argument");
  process.exit(1);
}

// Connect to mongodb
const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@fso-phonebook.ya8eyl8.mongodb.net/phonebook?appName=fso-phonebook`;

mongoose.set("strictQuery", false);
mongoose.connect(url, { family: 4 });

// Instantiating the Person model
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  console.log("phonebook");
  Person.find({}).then((result) => {
    result.forEach((person) => console.log(`${person.name} ${person.number}`));
    mongoose.connection.close();
    process.exit(1);
  });
} else if (process.argv.length === 5) {
  // Adding to the phonebook collection
  const newName = process.argv[3];
  const newNumber = process.argv[4];

  const person = new Person({
    name: newName,
    number: newNumber,
  });

  person.save().then((result) => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
    process.exit(1);
  });
} else {
  console.log(
    "Enter either password only or include the full person object ({name, number}) as the argument",
  );
  console.log('If writing full name, enclose it like "John Doe"');
  process.exit(1);
}
