import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//-----Basic Configuration-------//
app.use(express.json({ limit: "16kb" })); //tells that we support json data and we dont need unlimited JSON data so we can put a limit on amount of data.
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //This allows your server to accept form data (like when submitting an HTML form). Extended: true allows you to handle nested objects in the form data.
app.use(express.static("public")); //here we keep our static assets. Now public forlder is available and we can serve images through it directly.
app.use(cookieParser()); //gives us access to cookies.
//-------------------------------//

//-----CORS Configuration-------//
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "https://localhost:5137", //Specifies which domains are allowed to access your API.
    credentials: true, //allows cookies and authentication headers to be sent in cross-origin requests.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"], //defines which headers the browser is allowed to send (e.g., Authorization for tokens, Content-Type for body format).
  })
);
//This middleware sets CORS policies, which control who is allowed to talk to your backend.
//-------------------------------//

//import the routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authrouter from "./routes/auth.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authrouter);

app.get("/", (req, res) => {
  res.send("Welcome to Project Camp!");
});
////A GET request is a type of HTTP request used by the client (like your browser or frontend app) to ask the server for some information — usually to retrieve data, not to send or modify it.

export default app;
