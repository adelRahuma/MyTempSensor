const app = require("./server.js");
const { PORT = 10001 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
