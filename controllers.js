const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const upload = multer({dest: "uploads/"});

const form = async (req, res) => {
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
};

const form1 = async (req, res) => {
	try {
		const fields = req.body.sections || {};
		const files = req.files || [];

		const doc = new PDFDocument({ margin: 50 });
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=prescription.pdf",
		);
		doc.pipe(res);

		// Helper to find file field by field name
		const getFile = (fieldName) => files.find((f) => f.fieldname === fieldName);

		Object.entries(fields).forEach(([sectionId, section]) => {
			const sectionName = section.name;
			const sectionFields = section.fields || [];

			doc.fontSize(18).text(sectionName, { underline: true });
			doc.moveDown(0.5);

			Object.entries(sectionFields).forEach(([fieldIndex, field]) => {
				const { label, value, type } = field;

				if (type === "image") {
					const file = getFile(
						`sections[${sectionId}][fields][${fieldIndex}][value]`,
					);
					if (file) {
						const imagePath = path.resolve(file.path);
						try {
							doc.image(imagePath, { fit: [150, 150] });
							fs.unlink(imagePath, () => { }); // cleanup
						} catch (err) {
							doc.fontSize(12).text("[Invalid Image]");
						}
					} else {
						doc.fontSize(12).text("[No image uploaded]");
					}
				} else if (type === "textarea") {
					doc.fontSize(14).text(`${label}:`, { continued: false });
					const cleanText = value.replace(/\r/g, "").split("\n");
					cleanText.forEach((line) => {
						doc.fontSize(12).text(`   ${line}`);
					});
				} else {
					doc.fontSize(12).text(`${label}: ${value}`);
				}
				doc.moveDown(0.5);
			});

			doc.moveDown(1.5);
		});

		doc.end();
	} catch (error) {
		console.error(error);
		res.status(500).send("Something went wrong");
	}
};

module.exports = {form, form1};
