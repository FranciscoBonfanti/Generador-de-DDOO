const { jsPDF } = window.jspdf;
const form = document.getElementById('agreementForm');
const agreementTypeSelect = document.getElementById('agreementType');

// --- Helper function for date formatting ---
function getFormattedDate(dateInput) {
    let date = { day: ' ', month: ' ', year: ' ' };
    if (dateInput) {
        const d = new Date(dateInput + 'T00:00:00'); // Ensures correct date without timezone issues
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        date = { day: d.getDate(), month: meses[d.getMonth()], year: d.getFullYear() };
    }
    return date;
}

// Helper function to generate the common header
function getCommonHeader() {
    return `
        <div style="font-weight: bold; font-size: 0.9em;">MINISTERIO DE DESARROLLO PRODUCTIVO</div>
        <div style="font-size: 0.9em;">Secretaría de Comercio Interior y Servicios</div>
    `;
}

// --- Document Templates ---
const documentTemplates = {
    acuerdoConciliatorio: {
        formFields: ['seccionEmpresa', 'seccionConsumidor', 'seccionClausulas', 'campoConsumidorDenunciante', 'campoConciliador'],
        intro: (data) => `En la ciudad de ${data.ciudadAcuerdo || '[Ciudad]'}, a los ${data.fecha.day} días del mes de ${data.fecha.month} de ${data.fecha.year}, entre el Sr. ${data.empresa.apoderado || '[Apoderado]'}, DNI ${data.empresa.dni || '[DNI Apoderado]'}, en su carácter de apoderado de ${data.empresa.nombre || '[Razón Social]'}, CUIT ${data.empresa.cuit || '[CUIT]'}, con domicilio en calle ${data.empresa.domicilio || '[Domicilio Empresa]'} de la ciudad de ${data.empresa.ciudad || '[Ciudad Empresa]'}, por una parte, en adelante LA EMPRESA; y por la otra, el Sr. ${data.consumidor.nombre || '[Nombre Consumidor]'}, DNI ${data.consumidor.dni || '[DNI Consumidor]'}, con domicilio en calle ${data.consumidor.domicilio || '[Domicilio Consumidor]'} de la ciudad de ${data.consumidor.ciudad || '[Ciudad Consumidor]'}, en las actuaciones caratuladas “VUF ${data.expediente || '[Expediente]'} “XXX c/ YYY s/ Presunta Infracción a la Ley 24240”, convienen en celebrar el presente ACUERDO CONCILIATORIO, sujeto a las siguientes cláusulas:`,
        title: 'ACUERDO CONCILIATORIO',
        header: getCommonHeader(),
        footer: `De plena conformidad, siendo el presente fiel reflejo de la voluntad de las partes, se perfecciona el presente acuerdo en el lugar y fecha arriba indicados.----------------------------`,
        clauses: [
            { id: 'primera', title: 'PRIMERA', editable: true, placeholder: 'La EMPRESA ofrece, y el CONSUMIDOR acepta, ....', defaultText: (data) => data.clausulas.primera || 'La EMPRESA ofrece, y el CONSUMIDOR acepta, ....' },
            { id: 'segunda', title: 'SEGUNDA', editable: true, placeholder: 'Detalles adicionales...', defaultText: (data) => data.clausulas.segunda || '...' },
            { id: 'tercera', title: 'TERCERA', editable: false, defaultText: 'Cumplido en tiempo y forma el presente acuerdo, nada tendrán que reclamarse recíprocamente las partes por ningún concepto vinculado a lo que fuera materia de la denuncia tramitada por ante la Dirección General de Comercio Interior y Servicios, Ministerio de Desarrollo Productivo, de la Provincia de Santa Fe.-------------------------------' },
            { id: 'cuarta', title: 'CUARTA', editable: false, defaultText: (data) => `Las partes, de común acuerdo, solicitan a la autoridad de aplicación proceda a la homologación del presente acuerdo y, oportunamente, al archivo de las actuaciones caratuladas “VUF ${data.expediente || '[Expediente]'} “XXX c/ YYY s/ Presunta Infracción a la Ley 24240”.-----------------` }
        ]
    },
    primeraProvidencia: {
        formFields: ['campoConsumidorDenunciante', 'campoConciliador'], // Only these fields are relevant
        intro: (data) => `Ref. VUF N.º ${data.expediente || '[Expediente]'} “XXX c/ YYY s/ Presunta Infracción a la Ley 24240”\nSanta Fe, “Cuna de la Constitución Nacional”, ${data.fecha.day} de ${data.fecha.month} de ${data.fecha.year}. Vista la denuncia efectuada por el Sr. ${data.consumidorDenunciante || '[Nombre Consumidor Denunciante]'}, y resultando competente esta Dirección General de Comercio Interior y Servicios como autoridad de aplicación de la Ley 24240 en el ámbito de la Provincia de Santa Fe, se abre la instancia conciliatoria, como primer tramo del procedimiento administrativo. Téngase presente que el correo electrónico consignado en la denuncia será considerado como domicilio electrónico del consumidor y sólo en caso de resultar imposible el diligenciamiento de las notificaciones por ese medio, se procederá a la notificación en formato papel al domicilio postal.`,
        title: '', // No explicit title in the document
        header: getCommonHeader(),
        footer: 'Notifíquese.',
        clauses: [
            { id: 'asignacionConciliador', title: 'ASÍGNESE COMO CONCILIADOR', editable: false, defaultText: (data) => `Asígnese como conciliador en las presentes actuaciones a ${data.conciliadorAsignado || '[Conciliador Asignado]'}. Infórmese al consumidor y al proveedor que esta instancia tendrá por finalidad la composición de los intereses de las partes a través de un acuerdo y que se trata de una etapa confidencial y no obligatoria del trámite administrativo, que se realiza conforme lo normado en el art. 43 de la Ley 24240. A estos fines, hágase saber a la firma YYY que podrá efectuar su propuesta conciliatoria en el plazo de cinco días hábiles administrativos contados a partir de la recepción de la presente.` },
            { id: 'formatoDigital', title: 'FORMATO DIGITAL', editable: false, defaultText: 'En tal caso, deberá efectuar su ofrecimiento en formato digital, con firma electrónica o digital, enviándolo a la casilla de correo xxx@santafe.gov.ar.' },
            { id: 'constituirDomicilio', title: 'CONSTITUIR DOMICILIO', editable: false, defaultText: 'Deberá constituir domicilio electrónico en su primera presentación y acreditar la representación que se invoque mediante el instrumento legal correspondiente (acta de constitución, contrato social, acta de designación de autoridades, poder o procura, etc) debidamente digitalizado, bajo apercibimientos de ley (arts. 2, 5, ss y cc Dec. 4174/2015 y Dec. 400/2024).' },
            { id: 'noEximeCumplimiento', title: 'NO EXIME CUMPLIMIENTO', editable: false, defaultText: 'Hágase saber que el plazo otorgado para la presentación no lo exime del deber de cumplimiento oportuno de la prestación que pudiere corresponder.' },
            { id: 'aperturaSumarial', title: 'APERTURA SUMARIAL', editable: false, defaultText: 'El transcurso del plazo sin que el proveedor efectúe propuesta conciliatoria, conllevará la apertura de la instrucción sumarial para la investigación y eventual sanción de las posibles infracciones que pudieran derivarse de la denuncia que da lugar a las presentes actuaciones (arts. 45, 47, ss y cc de la Ley 24240).' }
        ]
    },
    cedulaPrimerDecreto: {
        formFields: ['seccionCedula', 'campoConsumidorDenunciante', 'campoConciliador'], // Only these fields are relevant
        intro: (data) => {
            // Reconstruct the full Providencia text based on the Primera Providencia template and current data
            const providenciaIntro = `Ref. VUF N.º ${data.expediente || '[Expediente]'} “XXX c/ YYY s/ Presunta Infracción a la Ley 24240”. Santa Fe, “Cuna de la Constitución Nacional”, ${data.fecha.day} de ${data.fecha.month} de ${data.fecha.year}. Vista la denuncia efectuada por el Sr. ${data.consumidorDenunciante || '[Nombre Consumidor Denunciante]'}, y resultando competente esta Dirección General de Comercio Interior y Servicios como autoridad de aplicación de la Ley 24240 en el ámbito de la Provincia de Santa Fe, se abre la instancia conciliatoria, como primer tramo del procedimiento administrativo. Téngase presente que el correo electrónico consignado en la denuncia será considerado como domicilio electrónico del consumidor y sólo en caso de resultar imposible el diligenciamiento de las notificaciones por ese medio, se procederá a la notificación en formato papel al domicilio postal.`;

            const providenciaClauses = documentTemplates.primeraProvidencia.clauses.map(clause => {
                let clauseText = typeof clause.defaultText === 'function' ? clause.defaultText(data) : clause.defaultText;
                // For Providencia inside Cedula, we don't need the clause titles like "ASIGNACIÓN CONCILIADOR"
                // We just need the continuous text
                return clauseText;
            }).join(' '); // Join with a space to make it continuous

            const providenciaFooter = 'Notifíquese.';

            const fullProvidenciaText = `${providenciaIntro} ${providenciaClauses} ${providenciaFooter}`;
            
            return `SEÑORES: ${data.cedulaNombre || '[Nombre]'}\nDOMICILIO: ${data.cedulaDomicilio || '[Domicilio]'}\nLOCALIDAD: ${data.cedulaLocalidad || '[Localidad]'} – CP ${data.cedulaCP || '[CP]'}\nPROVINCIA: ${data.cedulaProvincia || '[Provincia]'}\n\nSanta Fe, ${data.fecha.day} de ${data.fecha.month} de ${data.fecha.year}\n\nSe hace saber a Ud. que en el expediente VUF ${data.expediente || '[Expediente]'} “Xxx c/ Yyyy. s/ presunta infracción a la Ley 24240” en trámite por ante la Dirección General de Comercio Interior y Servicios del Ministerio Desarrollo Productivo de la Provincia de Santa Fe se ha dispuesto lo siguiente: “${fullProvidenciaText}”. Se adjunta copia del reclamo en su parte pertinente. Queda Ud. debidamente notificado. Saludo a Ud. atentamente.`;
        },
        title: 'CÉDULA',
        header: getCommonHeader(),
        footer: (data) => `
            ${data.firmanteCedula || '[Firmante Cédula]'}
            DGCIYS – SCIYS
            Ministerio de Desarrollo Productivo
            Provincia de Santa Fe
        `,
        clauses: [] // No specific "clauses" section like conciliatory agreements, content is in intro/footer
    },
    standard: { // User's new standard agreement type
        formFields: ['seccionEmpresa', 'seccionConsumidor', 'seccionClausulas'],
        intro: (data) => `En la ciudad de ${data.ciudadAcuerdo || '[Ciudad]'}, a los ${data.fecha.day} días del mes de ${data.fecha.month} de ${data.fecha.year}, entre el Sr. ${data.empresa.apoderado || '[Apoderado]'}, DNI ${data.empresa.dni || '[DNI Apoderado]'}, en su carácter de apoderado de ${data.empresa.nombre || '[Razón Social]'}, CUIT ${data.empresa.cuit || '[CUIT]'}, con domicilio en calle ${data.empresa.domicilio || '[Domicilio Empresa]'} de la ciudad de ${data.empresa.ciudad || '[Ciudad Empresa]'}, por una parte, en adelante LA EMPRESA; y por la otra, el Sr. ${data.consumidor.nombre || '[Nombre Consumidor]'}, DNI ${data.consumidor.dni || '[DNI Consumidor]'}, con domicilio en calle ${data.consumidor.domicilio || '[Domicilio Consumidor]'} de la ciudad de ${data.consumidor.ciudad || '[Ciudad Consumidor]'}, en las actuaciones caratuladas "VUF. ${data.expediente || '[Expediente]'} c/ ${data.empresa.nombre || '[Razón Social]'} s/ Presunta Infracción a la Ley 24240", convienen en celebrar el presente ACUERDO CONCILIATORIO, sujeto a las siguientes cláusulas:`,
        title: 'ACUERDO CONCILIATORIO',
        header: getCommonHeader(),
        footer: `De plena conformidad, siendo el presente fiel reflejo de la voluntad de las partes, se perfecciona el presente acuerdo en el lugar y fecha arriba indicados.`,
        clauses: [
            { id: 'primera', title: 'PRIMERA', editable: true, placeholder: 'La EMPRESA ofrece...', defaultText: (data) => data.clausulas.primera || 'La EMPRESA ofrece...' },
            { id: 'segunda', title: 'SEGUNDA', editable: true, placeholder: 'Detalles adicionales...', defaultText: (data) => data.clausulas.segunda || 'Detalles adicionales...' },
            { id: 'tercera', title: 'TERCERA', editable: false, defaultText: 'Cumplido en tiempo y forma el presente acuerdo, nada tendrán que reclamarse recíprocamente las partes por ningún concepto vinculado a lo que fuera materia de la denuncia tramitada por ante la Dirección General de Comercio Interior y Servicios, Ministerio de Desarrollo Productivo, de la Provincia de Santa Fe.' },
            { id: 'cuarta', title: 'CUARTA', editable: false, defaultText: (data) => `Las partes, de común acuerdo, solicitan a la autoridad de aplicación proceda a la homologación del presente acuerdo y, oportunamente, al archivo de las actuaciones caratuladas "VUF. ${data.expediente || '[Expediente]'} c/ ${data.empresa.nombre || '[Razón Social]'} s/ Presunta Infracción a la Ley 24240".` }
        ]
    },
    warranty: { // User's new warranty agreement type
        formFields: ['seccionEmpresa', 'seccionConsumidor', 'seccionClausulas'],
        intro: (data) => `En la ciudad de ${data.ciudadAcuerdo || '[Ciudad]'}, a los ${data.fecha.day} días del mes de ${data.fecha.month} de ${data.fecha.year}, entre la empresa ${data.empresa.nombre || '[Razón Social]'} (CUIT ${data.empresa.cuit || '[CUIT]'}) representada por su apoderado/a ${data.empresa.apoderado || '[Apoderado]'}, DNI ${data.empresa.dni || '[DNI Apoderado]'}, con domicilio en ${data.empresa.domicilio || '[Domicilio Empresa]'} de ${data.empresa.ciudad || '[Ciudad Empresa]'}, y el/la consumidor/a ${data.consumidor.nombre || '[Nombre Consumidor]'}, DNI ${data.consumidor.dni || '[DNI Consumidor]'}, con domicilio en ${data.consumidor.domicilio || '[Domicilio Consumidor]'} de ${data.consumidor.ciudad || '[Ciudad Consumidor]'}, en el marco del expediente N° VUF. ${data.expediente || '[Expediente]'}, acuerdan el siguiente CONCILIATORIO DE GARANTÍA:`,
        title: 'CONCILIATORIO DE GARANTÍA',
        header: getCommonHeader(),
        footer: `De plena conformidad, siendo el presente fiel reflejo de la voluntad de las partes, se perfecciona el presente acuerdo en el lugar y fecha arriba indicados.`,
        clauses: [
            { id: 'primera', title: 'PRIMERA', editable: true, placeholder: 'La EMPRESA se compromete a brindar una garantía extendida por...', defaultText: (data) => data.clausulas.primera || 'La EMPRESA se compromete a brindar una garantía extendida por...' },
            { id: 'segunda', title: 'SEGUNDA', editable: true, placeholder: 'Condiciones específicas de la garantía...', defaultText: (data) => data.clausulas.segunda || 'Condiciones específicas de la garantía...' },
            { id: 'tercera', title: 'TERCERA', editable: false, defaultText: 'El presente acuerdo extingue cualquier reclamo futuro relacionado con el vicio o defecto original del producto/servicio.' },
            { id: 'cuarta', title: 'CUARTA', editable: false, defaultText: (data) => `Ambas partes solicitan la homologación del presente y el archivo del expediente VUF. ${data.expediente || '[Expediente]'}.` },
            { id: 'quinta', title: 'QUINTA', editable: true, placeholder: 'Cláusula adicional específica de garantía (Ej: Plazo para hacer valer la garantía)...', defaultText: (data) => data.clausulas.quinta || 'Cláusula adicional específica de garantía (Ej: Plazo para hacer valer la garantía)...' }
        ]
    }
};

// --- Function to get all data from the form ---
function getFormData() {
    const fecha = getFormattedDate(document.getElementById('fechaAcuerdo').value);

    const clausesData = {};
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    if (template.clauses) {
        template.clauses.forEach(clause => {
            if (clause.editable) {
                const textarea = document.getElementById(`clausula${clause.id.charAt(0).toUpperCase() + clause.id.slice(1)}`);
                if (textarea) {
                    clausesData[clause.id] = textarea.value;
                }
            }
        });
    }

    return {
        ciudadAcuerdo: document.getElementById('ciudadAcuerdo').value,
        fecha: fecha,
        expediente: document.getElementById('expediente').value,
        consumidorDenunciante: document.getElementById('consumidorDenunciante').value,
        conciliadorAsignado: document.getElementById('conciliadorAsignado').value,
        empresa: {
            apoderado: document.getElementById('empresaApoderado').value,
            dni: document.getElementById('empresaDNI').value,
            nombre: document.getElementById('empresaNombre').value,
            cuit: document.getElementById('empresaCUIT').value,
            domicilio: document.getElementById('empresaDomicilio').value,
            ciudad: document.getElementById('empresaCiudad').value,
        },
        consumidor: {
            nombre: document.getElementById('consumidorNombre').value,
            dni: document.getElementById('consumidorDNI').value,
            domicilio: document.getElementById('consumidorDomicilio').value,
            ciudad: document.getElementById('consumidorCiudad').value,
        },
        cedulaNombre: document.getElementById('cedulaNombre').value,
        cedulaDomicilio: document.getElementById('cedulaDomicilio').value,
        cedulaLocalidad: document.getElementById('cedulaLocalidad').value,
        cedulaCP: document.getElementById('cedulaCP').value,
        cedulaProvincia: document.getElementById('cedulaProvincia').value,
        firmanteCedula: document.getElementById('firmanteCedula').value,
        clausulas: clausesData,
        documentType: currentDocumentType // Store the selected document type
    };
}

// --- Function to toggle form sections visibility ---
function toggleFormSections() {
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    // All possible sections and individual fields
    const allSections = [
        'seccionEmpresa',
        'seccionConsumidor',
        'seccionClausulas',
        'seccionCedula',
        'campoConsumidorDenunciante',
        'campoConciliador'
    ];

    allSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            if (template.formFields.includes(sectionId)) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        }
    });
}

// --- Function to load dynamic clauses in the form ---
function loadDynamicFormClauses() {
    const editableClausesDiv = document.getElementById('editable-clausulas');
    editableClausesDiv.innerHTML = ''; // Clear existing dynamic clauses

    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    // Only add input fields for editable clauses if the document type supports clauses
    if (template.clauses) {
        template.clauses.forEach(clause => {
            if (clause.editable) {
                const div = document.createElement('div');
                const label = document.createElement('label');
                label.htmlFor = `clausula${clause.id.charAt(0).toUpperCase() + clause.id.slice(1)}`;
                label.className = 'block text-sm font-medium text-gray-700';
                label.innerText = clause.title;

                const textarea = document.createElement('textarea');
                textarea.id = `clausula${clause.id.charAt(0).toUpperCase() + clause.id.slice(1)}`;
                textarea.rows = "3";
                textarea.className = 'mt-1 w-full p-2 border border-gray-300 rounded-md';
                textarea.placeholder = clause.placeholder || '';

                // Restore saved value if available
                const savedData = JSON.parse(localStorage.getItem('agreementFormData'));
                if (savedData && savedData.documentType === currentDocumentType && savedData.clausulas && savedData.clausulas[clause.id]) {
                    textarea.value = savedData.clausulas[clause.id];
                } else if (clause.defaultText) { // Set default text if no saved data
                    textarea.value = typeof clause.defaultText === 'function' ? clause.defaultText(getFormData()) : clause.defaultText;
                }

                div.appendChild(label);
                div.appendChild(textarea);
                editableClausesDiv.appendChild(div);
            }
        });
        document.getElementById('seccionClausulas').classList.remove('hidden');
    } else {
        document.getElementById('seccionClausulas').classList.add('hidden');
    }
    updatePreview(); // Update preview after loading new clauses
}

// --- Function to update the HTML PREVIEW ---
function updatePreview() {
    const data = getFormData();
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    // Update Header
    document.getElementById('preview-header-content').innerHTML = template.header || '';
    // Update Title
    document.getElementById('preview-title-content').innerText = template.title || '';
    // Update Intro text
    document.getElementById('preview-body-text').innerText = template.intro(data);

    // Clear existing dynamic content in preview
    const dynamicContentPreview = document.getElementById('preview-dynamic-content');
    dynamicContentPreview.innerHTML = '';

    // Render clauses or specific content based on template
    if (template.clauses && template.clauses.length > 0) {
        template.clauses.forEach(clause => {
            const div = document.createElement('div');
            div.className = 'preview-clausula';
            
            let clauseText;
            if (clause.editable) {
                clauseText = data.clausulas[clause.id] || clause.placeholder || '...';
            } else if (typeof clause.defaultText === 'function') {
                clauseText = clause.defaultText(data);
            } else {
                clauseText = clause.defaultText;
            }

            if (clauseText && clauseText.trim() !== '') { // Only render if there's content
                div.innerHTML = `
                    <span class="preview-clausula-title">${clause.title}: </span>
                    <span class="preview-clausula-text" id="preview-clausula-${clause.id}">${clauseText}</span>
                `;
                dynamicContentPreview.appendChild(div);
            }
        });
    }

    // Update Footer (can be dynamic or static)
    const footerContent = typeof template.footer === 'function' ? template.footer(data) : template.footer;
    document.getElementById('preview-footer-content').innerHTML = footerContent || '';
}

// --- Function to generate and DOWNLOAD the PDF ---
function downloadPdf() {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const data = getFormData();
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    const marginLeft = 20;
    const marginRight = 20;
    const pageContentWidth = doc.internal.pageSize.width - marginLeft - marginRight;
    let currentY = 20;

    // Header (rendered as raw HTML to extract text)
    if (template.header) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(73, 73, 99);
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = template.header;
        Array.from(headerDiv.children).forEach(child => {
            const lines = doc.splitTextToSize(child.innerText, pageContentWidth);
            doc.text(lines, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
            currentY += lines.length * 4; // Approx line height
        });
        currentY += 10;
    }

    // Title
    if (template.title) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Reset text color to black for main content
        doc.text(template.title, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
        currentY += 15;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Intro text
    const introText = template.intro(data);
    const introLines = doc.splitTextToSize(introText, pageContentWidth);
    doc.text(introLines, marginLeft, currentY, { align: 'justify', lineHeightFactor: 1.5 });
    currentY += (introLines.length * (11 * 0.352778) * 1.5) + 10;

    function renderSection(title, content) {
        if (!content || content.trim() === '' || content.trim() === '...') return;

        const estimatedLineHeight = (11 * 0.352778) * 1.5; // Estimated height for 11pt with 1.5 line height

        // Check if new section fits on current page
        if (currentY + estimatedLineHeight > doc.internal.pageSize.height - 40) { // Keep some margin at bottom
            doc.addPage();
            currentY = 20; // Reset Y for new page, add top margin
            // Re-render header/title on new page if needed for consistency (optional, depending on document style)
            if (template.header) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(73, 73, 99);
                const headerDiv = document.createElement('div');
                headerDiv.innerHTML = template.header;
                Array.from(headerDiv.children).forEach(child => {
                    const lines = doc.splitTextToSize(child.innerText, pageContentWidth);
                    doc.text(lines, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
                    currentY += lines.length * 4;
                });
                currentY += 10;
            }
            if (template.title) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(template.title, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
                currentY += 15;
            }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
        }

        doc.setFont('helvetica', 'bold');
        let sectionTitleDisplay = title ? `${title}: ` : '';
        const titleWidth = doc.getTextWidth(sectionTitleDisplay);
        
        let contentToSplit = content;
        let textX = marginLeft;
        let textWidth = pageContentWidth;

        // Special handling for the first line to align title and content
        if (sectionTitleDisplay) {
            doc.text(sectionTitleDisplay, marginLeft, currentY);
            textX = marginLeft + titleWidth;
            textWidth = pageContentWidth - titleWidth;
        }

        doc.setFont('helvetica', 'normal');
        const contentLines = doc.splitTextToSize(contentToSplit, textWidth);
        
        if (contentLines.length > 0) {
            doc.text(contentLines, textX, currentY, { align: 'justify', lineHeightFactor: 1.5 });
            currentY += (contentLines.length * estimatedLineHeight) + 5; // Add vertical spacing between clauses
        } else if (sectionTitleDisplay) {
             currentY += estimatedLineHeight + 5; // Move down even if content is empty but title was displayed
        }
    }

    // Render clauses / dynamic content
    if (template.clauses && template.clauses.length > 0) {
        template.clauses.forEach(clause => {
            let clauseText;
            if (clause.editable) {
                clauseText = data.clausulas[clause.id] || clause.placeholder || '';
            } else if (typeof clause.defaultText === 'function') {
                clauseText = clause.defaultText(data);
            } else {
                clauseText = clause.defaultText;
            }
            renderSection(clause.title, clauseText);
        });
    }

    // Footer
    const footerContent = typeof template.footer === 'function' ? template.footer(data) : template.footer;
    if (footerContent) {
        const footerLines = doc.splitTextToSize(footerContent, pageContentWidth);
        const requiredHeightFooter = (footerLines.length * (11 * 0.352778) * 1.5);
        if (currentY + requiredHeightFooter > doc.internal.pageSize.height - 50) { // More space for full footer
            doc.addPage();
            currentY = 20;
        }
        doc.text(footerLines, marginLeft, currentY, { align: 'justify', lineHeightFactor: 1.5 });
    }

    // Fixed footer (Page number, address, etc.)
    const fixedFooterY = doc.internal.pageSize.height - 30;
    doc.setLineWidth(0.5);
    doc.setDrawColor(73, 73, 99);
    doc.line(marginLeft, fixedFooterY, doc.internal.pageSize.width - marginRight, fixedFooterY);
    let fixedFooterCurrentY = fixedFooterY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('"2025 - 210 años del Congreso de los Pueblos Libres"', doc.internal.pageSize.width / 2, fixedFooterCurrentY, { align: 'center' });
    fixedFooterCurrentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text("Bv. Pellegrini 3100 - Santa Fe (CP 3000)", doc.internal.pageSize.width / 2, fixedFooterCurrentY, { align: 'center' });

    doc.save(`${currentDocumentType}_${data.expediente || 'doc'}.pdf`);
}

function saveData() {
    try {
        const data = getFormData();
        localStorage.setItem('agreementFormData', JSON.stringify(data)); // Save to localStorage
        alert('Datos guardados exitosamente en el navegador.');
    } catch (error) {
        console.error("Error al guardar los datos:", error);
        alert('Hubo un error al guardar los datos.');
    }
}

function loadData() {
    try {
        const savedData = JSON.parse(localStorage.getItem('agreementFormData'));
        if (savedData) {
            // Restore document type
            agreementTypeSelect.value = savedData.documentType || 'acuerdoConciliatorio';
            toggleFormSections(); // Ensure correct sections are visible

            // Restore general fields
            document.getElementById('ciudadAcuerdo').value = savedData.ciudadAcuerdo || 'Santa Fe';
            // Handle date separately to ensure it's set correctly
            if (savedData.fecha && savedData.fecha.year && savedData.fecha.month && savedData.fecha.day) {
                const day = String(savedData.fecha.day).padStart(2, '0');
                const monthIndex = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"].indexOf(savedData.fecha.month);
                const month = String(monthIndex + 1).padStart(2, '0'); // Convert month name to number
                const year = savedData.fecha.year;
                document.getElementById('fechaAcuerdo').value = `${year}-${month}-${day}`;
            } else {
                 document.getElementById('fechaAcuerdo').valueAsDate = new Date(); // Default to today if no saved date
            }
            
            document.getElementById('expediente').value = savedData.expediente || '';
            document.getElementById('consumidorDenunciante').value = savedData.consumidorDenunciante || '';
            document.getElementById('conciliadorAsignado').value = savedData.conciliadorAsignado || '';

            // Restore Empresa fields
            if (savedData.empresa) {
                document.getElementById('empresaApoderado').value = savedData.empresa.apoderado || '';
                document.getElementById('empresaDNI').value = savedData.empresa.dni || '';
                document.getElementById('empresaNombre').value = savedData.empresa.nombre || '';
                document.getElementById('empresaCUIT').value = savedData.empresa.cuit || '';
                document.getElementById('empresaDomicilio').value = savedData.empresa.domicilio || '';
                document.getElementById('empresaCiudad').value = savedData.empresa.ciudad || '';
            }

            // Restore Consumidor fields
            if (savedData.consumidor) {
                document.getElementById('consumidorNombre').value = savedData.consumidor.nombre || '';
                document.getElementById('consumidorDNI').value = savedData.consumidor.dni || '';
                document.getElementById('consumidorDomicilio').value = savedData.consumidor.domicilio || '';
                document.getElementById('consumidorCiudad').value = savedData.consumidor.ciudad || '';
            }

            // Restore Cedula fields
            document.getElementById('cedulaNombre').value = savedData.cedulaNombre || '';
            document.getElementById('cedulaDomicilio').value = savedData.cedulaDomicilio || '';
            document.getElementById('cedulaLocalidad').value = savedData.cedulaLocalidad || '';
            document.getElementById('cedulaCP').value = savedData.cedulaCP || '';
            document.getElementById('cedulaProvincia').value = savedData.cedulaProvincia || '';
            document.getElementById('firmanteCedula').value = savedData.firmanteCedula || '';
            
            // Reload dynamic clauses for editable textareas
            loadDynamicFormClauses();

            updatePreview(); // Update preview after loading all data
            alert('Datos cargados exitosamente desde el navegador.');
        } else {
            alert('No hay datos guardados para cargar.');
        }
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert('Hubo un error al cargar los datos.');
    }
}

// --- Event Listeners ---
form.addEventListener('input', updatePreview);
agreementTypeSelect.addEventListener('change', () => {
    toggleFormSections(); // Hide/show sections based on type
    loadDynamicFormClauses(); // Reload form clauses on type change
    updatePreview(); // Update preview
});
document.getElementById('generatePdfBtn').addEventListener('click', downloadPdf);
document.getElementById('saveDataBtn').addEventListener('click', saveData);
document.getElementById('loadDataBtn').addEventListener('click', loadData);


// Initial setup
window.addEventListener('load', () => {
    // Set default date to today
    document.getElementById('fechaAcuerdo').valueAsDate = new Date();
    loadData(); // Attempt to load saved data on page load
    toggleFormSections(); // Initial section visibility (will be called again by loadData if data exists)
    loadDynamicFormClauses(); // Load initial dynamic clauses for the default type (will be called again by loadData if data exists)
    updatePreview(); // Initial preview update (will be called again by loadData if data exists)
});