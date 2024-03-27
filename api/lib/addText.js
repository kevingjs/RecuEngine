import { jsPDF } from "jspdf";

/**
 * @param { string } textLine 
 * @param { jsPDF } doc
 * @param { number } currentX
 * @param { number } y
 * @param { number | undefined } fontSize
 * @param { string } fontName
 * @param { "alphabetic" | "ideographic" | "bottom" | "top" | "middle" | "hanging" | undefined } baseline
 */
const addText = (textLine, doc, currentX = 0, y = 0, fontSize = 12, fontName, baseline = 'alphabetic' ) => {
	const arrayOfNormalAndBoldText = textLine.split('**');
	let x = currentX;

	for (let i = 0; i < arrayOfNormalAndBoldText.length; i++) {
		const text = arrayOfNormalAndBoldText[i];
		
		doc.setFont(`${fontName}-Bold`, "bold");

		if (i % 2 === 0) doc.setFont(`${fontName}-Regular`, "normal"); // every even item is a normal font weight item

		doc.text(text, x, y, { baseline });

		x += doc.getStringUnitWidth(text) * fontSize;
	};
};

export default addText;