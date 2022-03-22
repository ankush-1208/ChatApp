const express = require('express');
const path = require('path');
const app = express();

// Setting the static folder
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000 || process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));