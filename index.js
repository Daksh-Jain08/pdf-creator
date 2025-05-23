const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { form, form1 } = require("controllers");
dotenv.config();

const upload = multer({ dest: "uploads/" });

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/form", (req, res) => {
	try {
		const options = {
			root: path.join(__dirname),
		};
		const filename = "home.html";
		res.sendFile(filename, options);
	} catch (err) {
		res.status(500).send("INTERNAL SERVER ERROR");
	}
});

app.get("/form1", (req, res) => {
	try {
		const options = {
			root: path.join(__dirname),
		};
		const filename = "home1.html";
		res.sendFile(filename, options);
	} catch (err) {
		res.status(500).send("INTERNAL SERVER ERROR");
	}
});

app.post("/form", upload.single("photo"), form);
app.post("/form1", upload.any(), form1);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`App is listening on ${PORT}...`);
});
