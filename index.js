const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { form, form1, form2, form3 } = require("./controllers");
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

app.get("/form2", (req, res) => {
	try {
		const options = {
			root: path.join(__dirname),
		};
		const filename = "home2.html";
		res.sendFile(filename, options);
	} catch (err) {
		res.status(500).send("INTERNAL SERVER ERROR");
	}
});

app.get("/form3", (req, res) => {
	try {
		const options = {
			root: path.join(__dirname),
		};
		const filename = "home3.html";
		res.sendFile(filename, options);
	} catch (err) {
		res.status(500).send("INTERNAL SERVER ERROR");
	}
});

app.post("/form", upload.single("photo"), form);
app.post("/form1", upload.any(), form1);
app.post("/form2", upload.any(), form2);
app.post("/form3", upload.any(), form3);

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
	console.log(`App is listening on ${PORT}...`);
});
