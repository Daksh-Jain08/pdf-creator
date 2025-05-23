const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

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

const form3 = async (req, res) => {
	const doc = new PDFDocument({ size: "A4" });
	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
	doc.pipe(res);

	const fields = req.body.fields || {};
	const files = req.files || [];

	for (const key in fields) {
		const field = fields[key];

		const label = field.label;
		const type = field.type;
		const value = field.value;
		const xCoord = parseInt(field.x, 10);
		const yCoord = parseInt(field.y, 10);
		console.log(fields[key]);

		if (type === "image") {
			const uploadedFile = files.find(
				(f) => f.fieldname === `fields[${key}][value]`,
			);
			if (uploadedFile) {
				doc.image(uploadedFile.path, xCoord, yCoord, { fit: [100, 100] });

				// Optional: cleanup temp file after use
				fs.unlink(uploadedFile.path, () => { });
			} else {
				doc
					.fontSize(12)
					.fillColor("red")
					.text(`${label}: [Missing Image]`, xCoord, yCoord);
			}
		} else {
			doc
				.fontSize(12)
				.fillColor("black")
				.text(`${label}: ${value}`, xCoord, yCoord);
		}
	}

	doc.end();
};

const form2 = async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const files = req.files || [];

    const doc = new PDFDocument({ size: "A4", margin: 20 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
    doc.pipe(res);

    // Optional background grid styling (like frontend)
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    doc.save();
    doc.lineWidth(0.2).strokeColor("#eee");

    // Vertical lines
    for (let x = 20; x < pageWidth; x += 20) {
      doc.moveTo(x, 0).lineTo(x, pageHeight).stroke();
    }

    // Horizontal lines
    for (let y = 20; y < pageHeight; y += 20) {
      doc.moveTo(0, y).lineTo(pageWidth, y).stroke();
    }
    doc.restore();

    // Process each section
    for (const section of payload.sections) {
      const {
        title,
        x,
        y,
        width,
        height,
        fields
      } = section;

			console.log(section);

      // Draw section border
      doc
        .lineWidth(1)
        .strokeColor("#337ab7")
        .fillColor("#fdfdfd")
        .rect(x, y, width, height)
        .stroke();

      // Section header
      doc
        .fillColor("white")
        .rect(x, y - 20, width, 18)
        .fill("#337ab7")
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(title, x + 5, y - 18, { continued: false });

      // Render fields in this section
      for (const field of fields) {
        const {
          label,
          type,
          x: fieldX,
          y: fieldY,
          width: fieldWidth,
          height: fieldHeight
        } = field;

        const absoluteX = fieldX;
        const absoluteY = fieldY;
				console.log(absoluteX);
				console.log(absoluteY);

        // Draw field box (optional)
        doc
          .lineWidth(0.5)
          .strokeColor("#999")
          .rect(absoluteX, absoluteY, fieldWidth, fieldHeight)
          .stroke();

        // Field label
        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor("black")
          .text(`${label}:`, absoluteX + 2, absoluteY + 2, {
            width: fieldWidth - 4,
            height: fieldHeight - 4,
          });

        // Field value
        if (type === "image") {
        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor("black")
          .text(`${label}:`, absoluteX + 2, absoluteY + 2, {
            width: fieldWidth - 4,
            height: fieldHeight - 4,
          });
          const uploadedFile = files.find(
            (f) => f.fieldname === `fields[${field.id}][value]`
          );
          if (uploadedFile) {
            doc.image(uploadedFile.path, absoluteX + 2, absoluteY + 14, {
              fit: [fieldWidth - 4, fieldHeight - 16],
              align: "center",
              valign: "center"
            });

            fs.unlink(uploadedFile.path, () => {});
          } else {
            doc
              .font("Helvetica")
              .fontSize(8)
              .fillColor("red")
              .text("[Missing Image]", absoluteX + 2, absoluteY + 14);
          }
        } else {
          const value = req.body[`fields[${field.id}][value]`] || "[No Value]";
          doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor("black")
            .text(value, absoluteX + 2, absoluteY + 14, {
              width: fieldWidth - 4,
              height: fieldHeight - 16
            });
        }
      }
    }

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Failed to generate PDF");
  }
};

module.exports = { form, form1, form2, form3 };
