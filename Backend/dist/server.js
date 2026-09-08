import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app.js";
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
async function main() {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log("Database connected successfully");
        app.listen(PORT, () => {
            console.log(`Example app listening on port ${PORT}`);
        });
    }
    catch (err) {
        console.log("Database connection failed:", err);
    }
}
main();
//# sourceMappingURL=server.js.map