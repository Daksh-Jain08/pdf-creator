const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
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

app.post("/form", upload.single("photo"), (req, res) => {
	const {
		name,
		age,
		gender,
		remarks,
		tests,
		medicines = [],
		dosages = [],
	} = req.body;

	const doc = new PDFDocument();

	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", "attachment; filename=prescription.pdf");

	doc.pipe(res);

	// --- Header Section ---
	const currentDate = new Date().toLocaleDateString();
	doc.fontSize(20).text("Doctor's Prescription", { align: "center" });
	doc.fontSize(12).text(`Date: ${currentDate}`, {
		align: "right",
	});
	doc.moveDown();

	if (req.file) {
		const imagePath = path.join(__dirname, req.file.path);
		try {
			doc.image(imagePath, {
				fit: [100, 100],
				align: "left",
				valign: "top",
			});
		} catch (err) {
			console.error("Image failed to load:", err);
		}
		doc.moveDown();
	}

	// --- Patient Details (Same Line) ---
	doc.fontSize(12);
	const infoLine = `Name: ${name}      Age: ${age}      Gender: ${gender}`;
	doc.text(infoLine, { align: "left" });
	doc.moveDown();

	// --- Remarks Section ---
	doc.fontSize(14).text("Doctor's Remarks:", { underline: true });
	doc.fontSize(12);
	remarks.split(/\r?\n/).forEach((line) => doc.text(line));
	doc.moveDown();

	// --- Tests Section ---
	doc.fontSize(14).text("Prescribed Tests:", { underline: true });
	doc.fontSize(12);
	tests.split(/\r?\n/).forEach((line) => doc.text(line));
	doc.moveDown();

	// --- Medicines Section ---
	doc.fontSize(14).text("Medicines & Dosage:", { underline: true });
	doc.fontSize(12);
	if (Array.isArray(medicines) && Array.isArray(dosages)) {
		medicines.forEach((med, index) => {
			const dose = dosages[index] || "";
			doc.text(`- ${med}: ${dose}`);
		});
	}

	doc.end();

	fs.unlink(req.file.path, () => { });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`App is listening on ${PORT}...`);
});
