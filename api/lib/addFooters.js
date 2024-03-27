import { jsPDF } from "jspdf";

/**
 * @param { jsPDF } doc 
 * @param { number } pWidth 
 * @param {{
 *   left: number;
 *   top: number;
 *   right: number;
 *   bottom: number;
 * }} margins 
 */
const addFooters = (doc, margins) => {
	const { width: pWidth} = doc.internal.pageSize;
	const pageCount = doc.getNumberOfPages();
	const date = new Date().toLocaleString('es-VE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
		timeZone: 'America/Caracas'
	}).replace(',', '');
	
	const totalPages = doc.internal.getNumberOfPages();

	doc.setFontSize(7);
	doc.setFont('GeistMono', 'bold');

	for (let i = 0; i < pageCount; i++) {
		doc.setPage(i);
		const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
		doc.text(`RecuEngine ${date} Página ${currentPage} de ${totalPages}`, pWidth / 2, margins.bottom, { align: 'center' });
	};
};

export default addFooters;