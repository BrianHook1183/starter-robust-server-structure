const express = require("express");
const app = express();

const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

/* 
* express.json()
  is a built-in middleware that adds a body property to the request (req.body). req.body will contain the parsed data—or it will return an empty object ({}) if there was no body to parse, the Content-Type was not matched, or an error occurred.
*/
app.use(express.json());
/* 
* Note:
  This middleware must come before any handlers that will make use of the JSON in the body of the request.
*/

app.use("/counts/:countId", (request, response, next) => {
  const { countId } = request.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next(`Count id not found: ${countId}`);
  } else {
    response.json({ data: foundCount });
  }
});

app.use("/counts", (request, response) => {
  response.json({ data: counts });
});

app.use("/flips/:flipId", (request, response, next) => {
  const { flipId } = request.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));

  if (foundFlip) {
    response.json({ data: foundFlip });
  } else {
    next(`Flip id not found: ${flipId}`);
  }
});

// this handler will only be called if the HTTP method of the incoming request is GET.
app.get("/flips", (request, response) => {
  response.json({ data: flips });
});

// Variable to hold the next id.
// Since some ID's may already be used, you find the largest assigned id.
let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0)

app.post("/flips", (request, response, next) => {
  // next line may look a bit strange, but it is still standard destructuring. This way, if the body does not contain a data property, the destructuring will still succeed because you have supplied a default value of {} for the data property.
  const { data: { result } = {} } = request.body;
  if (result) {
    const newFlip = {
      id: ++lastFlipId, // Increment last id then assign as the current ID
      result,
    };
    flips.push(newFlip);
    counts[result] = counts[result] + 1; // Increment the counts
    //  returns 201 when the flip is successfully created.
    response.status(201).json({ data: newFlip });
    // The code above added a chained method call to .status(201) to change the status code from 200 (the default for success) to 201.
  } else {
    // return 400 if the result property is missing or empty.
    // call sendStatus() on the response to quickly set the response HTTP status code and send its string representation as the response body.
    response.sendStatus(400);
  }
});

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  response.send(error);
});

module.exports = app;
