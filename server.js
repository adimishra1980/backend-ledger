import dotenv from "dotenv"
dotenv.config()

import { app } from "./src/app.js";
import { connectToDB } from "./src/config/db.js";

connectToDB()

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})