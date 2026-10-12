// const express = require("express")
// const cookieParser = require("cookie-parser")
// const cors = require("cors")

// const app = express()

// app.use(express.json())
// app.use(cookieParser())
// // app.use(cors({
// //     origin: [
// //         "http://localhost:5173",
// //         "https://gen-ai-project-mu.vercel.app"
// //     ],
// //     credentials: true
// // }))
// // app.use(
// //   cors({
// //     origin: ["http://localhost:5173"],
// //     credentials: true,
// //   }),
// // );

// // app.use(
// //   cors({
// //     origin: ["http://localhost:5173",
// //       "https://gen-ai-project-self.vercel.app"],
// //     credentials: true,
// //   }),
// // );

// const cors = require("cors");

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://gen-ai-project-self.vercel.app",
//       "https://gen-ai-project-owdewiqry-rounit1.vercel.app",
//     ],
//     credentials: true,
//   }),
// );


// /* require all the routes here */
// const authRouter = require("./routes/auth.routes")
// const interviewRouter = require("./routes/interview.routes")


// /* using all the routes here */
// app.use("/api/auth", authRouter)
// app.use("/api/interview", interviewRouter)



// module.exports = app

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://gen-ai-project-self.vercel.app",
  "https://gen-ai-project-owdewiqry-rounit1.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;
