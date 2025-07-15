const { jsPDF } = window.jspdf;
const form = document.getElementById("agreementForm");
const agreementTypeSelect = document.getElementById("agreementType");

// --- Helper function for date formatting ---
function getFormattedDate(dateInput) {
    let date = { day: " ", month: " ", year: " " };
    if (dateInput) {
        const d = new Date(dateInput + "T00:00:00");
        const meses = [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre",
            "diciembre",
        ];
        date = {
            day: d.getDate(),
            month: meses[d.getMonth()],
            year: d.getFullYear(),
        };
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
        formFields: [
            "seccionEmpresa",
            "seccionConsumidor",
            "seccionClausulas",
            "campoConsumidorDenunciante",
            "campoConciliador",
            "seccionGeneralAdicional"
        ],
        intro: (data) =>
            `En la ciudad de ${data.ciudadAcuerdo || "[Ciudad]"}, a los ${data.fecha.day
            } días del mes de ${data.fecha.month} de ${data.fecha.year
            }, entre el Sr. ${data.empresa.apoderado || "[Apoderado]"}, DNI ${data.empresa.dni || "[DNI Apoderado]"
            }, en su carácter de apoderado de ${data.empresa.nombre || "[Razón Social]"
            }, CUIT ${data.empresa.cuit || "[CUIT]"}, con domicilio en calle ${data.empresa.domicilio || "[Domicilio Empresa]"
            } de la ciudad de ${data.empresa.ciudad || "[Ciudad Empresa]"
            }, por una parte, en adelante LA EMPRESA; y por la otra, el Sr. ${data.consumidor.nombre || "[Nombre Consumidor]"
            }, DNI ${data.consumidor.dni || "[DNI Consumidor]"
            }, con domicilio en calle ${data.consumidor.domicilio || "[Domicilio Consumidor]"
            } de la ciudad de ${data.consumidor.ciudad || "[Ciudad Consumidor]"
            }, en las actuaciones caratuladas “VUF ${data.expediente || "[Expediente]"
            } “${data.consumidor.nombre || "[Nombre Consumidor]"} c/ ${data.empresa.nombre || "[Nombre Empresa]"
            } s/ Presunta Infracción a la Ley 24240”, convienen en celebrar el presente ACUERDO CONCILIATORIO, sujeto a las siguientes cláusulas:`,
        title: "ACUERDO CONCILIATORIO",
        header: getCommonHeader(),
        footer: `De plena conformidad, siendo el presente fiel reflejo de la voluntad de las partes, se perfecciona el presente acuerdo en el lugar y fecha arriba indicados.----------------------------`,
        clauses: [
            {
                id: "primera",
                title: "PRIMERA",
                editable: true,
                placeholder: "La EMPRESA ofrece, y el CONSUMIDOR acepta, ....",
                defaultText: (data) =>
                    data.clausulas.primera ||
                    "La EMPRESA ofrece, y el CONSUMIDOR acepta, ....",
            },
            {
                id: "segunda",
                title: "SEGUNDA",
                editable: true,
                placeholder: "Detalles adicionales...",
                defaultText: (data) => data.clausulas.segunda || "...",
            },
            {
                id: "tercera",
                title: "TERCERA",
                editable: false,
                defaultText:
                    "Cumplido en tiempo y forma el presente acuerdo, nada tendrán que reclamarse recíprocamente las partes por ningún concepto vinculado a lo que fuera materia de la denuncia tramitada por ante la Dirección General de Comercio Interior y Servicios, Ministerio de Desarrollo Productivo, de la Provincia de Santa Fe.-------------------------------",
            },
            {
                id: "cuarta",
                title: "CUARTA",
                editable: false,
                defaultText: (data) =>
                    `Las partes, de común acuerdo, solicitan a la autoridad de aplicación proceda a la homologación del presente acuerdo y, oportunamente, al archivo de las actuaciones caratuladas “VUF ${data.expediente || "[Expediente]"
                    } “${data.consumidor.nombre || "[Nombre Consumidor]"} c/ ${data.empresa.nombre || "[Nombre Empresa]"
                    } s/ Presunta Infracción a la Ley 24240”.-----------------`,
            },
        ],
    },
    primeraProvidencia: {
        formFields: [
            "expediente",
            "campoConsumidorDenunciante",
            "campoConciliador",
            "seccionEmpresa",
            "seccionConsumidor",
            "seccionGeneralAdicional",
        ],
        intro: (data) =>
            "Ref. VUF N.º " +
            (data.expediente || "[Expediente]") +
            " “‘" +
            (data.consumidor.nombre || "[Nombre Consumidor]") +
            " c/ " +
            (data.empresa.nombre || "[Nombre Empresa]") +
            "” s/ Presunta Infracción a la Ley 24240. Santa Fe, “Cuna de la Constitución Nacional”, " +
            data.fecha.day +
            " de " +
            data.fecha.month +
            " de " +
            data.fecha.year +
            ". " +
            "Vista la denuncia efectuada por el Sr. " +
            (data.consumidorDenunciante || "[Nombre Consumidor Denunciante]") +
            ", y resultando competente esta Dirección General de Comercio Interior y Servicios como autoridad de aplicación de la Ley 24240 en el ámbito de la Provincia de Santa Fe, " +
            "se abre la instancia conciliatoria, como primer tramo del procedimiento administrativo. " +
            "Téngase presente que el correo electrónico consignado en la denuncia será considerado como domicilio electrónico del consumidor y sólo en caso de resultar imposible el diligenciamiento de las notificaciones por ese medio, se procederá a la notificación en formato papel al domicilio postal. " +
            "Asígnese como conciliador en las presentes actuaciones a " +
            (data.conciliadorAsignado || "[Conciliador Asignado]") +
            ". " +
            "Infórmese al consumidor y al proveedor que esta instancia tendrá por finalidad la composición de los intereses de las partes a través de un acuerdo y que se trata de una etapa confidencial y no obligatoria del trámite administrativo, que se realiza conforme lo normado en el art. 43 de la Ley 24240. " +
            "A estos fines, hágase saber a la firma " +
            (data.empresa.nombre || "[Nombre Empresa]") +
            " que podrá efectuar su propuesta conciliatoria en el plazo de cinco días hábiles administrativos contados a partir de la recepción de la presente. " +
            "En tal caso, deberá efectuar su ofrecimiento en formato digital, con firma electrónica o digital, enviándolo a la casilla de correo " +
            (data.empresa.mail || "[Email Defensa Consumidor]") +
            ". " +
            "Deberá constituir domicilio electrónico en su primera presentación y acreditar la representación que se invoque mediante el instrumento legal correspondiente (acta de constitución, contrato social, acta de designación de autoridades, poder o procura, etc) debidamente digitalizado, bajo apercibimientos de ley (arts. 2, 5, ss y cc Dec. 4174/2015 y Dec. 400/2024). " +
            "Hágase saber que el plazo otorgado para la presentación no lo exime del deber de cumplimiento oportuno de la prestación que pudiere corresponder. " +
            "El transcurso del plazo sin que el proveedor efectúe propuesta conciliatoria, conllevará la apertura de la instrucción sumarial para la investigación y eventual sanción de las posibles infracciones que pudieran derivarse de la denuncia que da lugar a las presentes actuaciones (arts. 45, 47, ss y cc de la Ley 24240).",
        title: "",
        header: getCommonHeader(),
        footer: "Notifíquese.",
        clauses: [],
    },
    cedulaPrimerDecreto: {
        formFields: ["seccionCedula", "expediente", "seccionConsumidor", "seccionEmpresa"],
        intro: (data) => {
            const providenciaText =
                documentTemplates.primeraProvidencia.intro(data) + "\nNotifíquese.";

            return `SEÑORES: ${data.cedulaNombre || "[Nombre Receptor Cédula]"
                }\nDOMICILIO: ${data.cedulaDomicilio || "[Domicilio Receptor Cédula]"
                }\nLOCALIDAD: ${data.cedulaLocalidad || "[Localidad]"} – CP ${data.cedulaCP || "[CP]"
                }\nPROVINCIA: ${data.cedulaProvincia || "[Provincia]"}\n\nSanta Fe, ${data.fecha.day
                } de ${data.fecha.month} de ${data.fecha.year
                }\n\nSe hace saber a Ud. que en el expediente VUF ${data.expediente || "[Expediente]"
                } “${data.consumidor.nombre || "[Nombre Consumidor]"} c/ ${data.empresa.nombre || "[Nombre Empresa]"
                }. s/ presunta infracción a la Ley 24240” en trámite por ante la Dirección General de Comercio Interior y Servicios del Ministerio Desarrollo Productivo de la Provincia de Santa Fe se ha dispuesto lo siguiente: “${providenciaText}”. Se adjunta copia del reclamo en su parte pertinente. Queda Ud. debidamente notificado. Saludo a Ud. atentamente.`;
        },
        title: "CÉDULA",
        header: getCommonHeader(),
        footer: (data) => `
            ${data.firmanteCedula || "[Firmante Cédula]"}
            DGCIYS – SCIYS
            Ministerio de Desarrollo Productivo
            Provincia de Santa Fe
        `,
        clauses: [],
    },
    denunciadoAudiencia: {
        formFields: [
            "expediente",
            "seccionEmpresa",
            "seccionConsumidor",
            "campoConsumidorDenunciante",
            "campoConciliador",
            "seccionGeneralAdicional",
            "fechaAudiencia",
            "horaAudiencia",
        ],
        intro: (data) => {
            const providenciaText =
                documentTemplates.primeraProvidencia.intro(data) + "\nNotifíquese.";

            return `SEÑORES: ${data.empresa.nombre || "[Nombre Proveedor]"
                }\nDOMICILIO: ${data.empresa.domicilio || "[Domicilio Proveedor]"
                }\nLOCALIDAD: ${data.empresa.ciudad || "[Localidad Proveedor]"} – CP ${data.empresa.cp || "[CP]"
                }\nPROVINCIA: ${data.empresa.provincia || "[Provincia]"}\n\nSanta Fe, ${data.fecha.day
                } de ${data.fecha.month} de ${data.fecha.year
                }\n\nSe hace saber a Ud. que en el expediente VUF ${data.expediente || "[Expediente]"
                } “${data.consumidor.nombre || "[Nombre Consumidor]"} c/ ${data.empresa.nombre || "[Nombre Empresa]"
                }. s/ presunta infracción a la Ley 24240” en trámite por ante la Dirección General de Comercio Interior y Servicios del Ministerio Desarrollo Productivo de la Provincia de Santa Fe se ha dispuesto lo siguiente: “${providenciaText}”. Se ha dispuesto convocar a las partes para audiencia de conciliación, conforme lo normado en el art. 43 de la Ley 24240. La misma se celebrará de manera virtual, el día ${data.fechaAudiencia.day
                } de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year} a las ${data.horaAudiencia || "[Hora Audiencia]"
                } hs, debiendo Ud. conectarse al vínculo de la videollamada: ${data.empresa.meet || "[Enlace Meet]"
                } para comparecer a la audiencia.
Como recaudo, se transcribe la providencia que así lo ordena: “Ref. VUF N.º ${data.expediente || "[Expediente]"
                } “${data.consumidor.nombre || "[Nombre Consumidor]"} c/ ${data.empresa.nombre || "[Nombre Empresa]"
                } s/ Presunta Infracción a la Ley 24240”. Santa Fe, “Cuna de la Constitución Nacional”, ${data.fechaAudiencia.day
                } de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year
                }. Vistas constancias de las presentes actuaciones y atendiendo a razones de oportunidad y conveniencia que aconsejan la celebración de una audiencia para una mejor conciliación, fíjese fecha de audiencia para el día ${data.fechaAudiencia.day
                } de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year} a las ${data.horaAudiencia || "[Hora Audiencia]"
                } horas. La misma se celebrará de manera virtual, debiendo las partes conectarse al vínculo ${data.empresa.meet || "[Enlace Meet]"
                } Infórmese a las partes que las audiencias sólo se suspenden por caso fortuito o fuerza mayor, debiendo ser acreditado en el plazo de cinco días. Hágase saber al proveedor que su ausencia injustificada conllevará la apertura de la instrucción sumarial para la investigación de posibles infracciones que pudieran derivarse del reclamo iniciado; y al consumidor que su ausencia injustificada hará presumir su desistimiento y ulterior archivo de las presentes actuaciones. Notifíquese.” Fdo. [FIRMADO], DGCIYS – SCIYS, Ministerio de Desarrollo Productivo, Provincia de Santa Fe.
Se hace saber a Uds. que en el caso excepcional de no contar con los medios necesarios para acceder a la audiencia virtual, deberá presentar la correspondiente declaración jurada en el plazo perentorio e improrrogable de cinco (5) días hábiles administrativos.
Se notifica a Ud. que las audiencias de conciliación son confidenciales y sólo se suspenden por caso fortuito o fuerza mayor. La acreditación de esta última deberá realizarse con un plazo máximo de hasta cinco (5) días hábiles administrativos posteriores a la fecha de la audiencia.
La incomparencia injustificada conlleva la apertura de la instrucción sumarial para la investigación de posibles infracciones que pudieran derivarse del reclamo iniciado.
Queda Ud. debidamente notificado.
Saludo a Ud. atentamente.`;
        },
        title: "Cédula Denunciado Audiencia",
        header: getCommonHeader(),
        footer: (data) => `
            ${data.firmanteCedula || "[Firmante Cédula]"}
            DGCIYS – SCIYS
            Ministerio de Desarrollo Productivo
            Provincia de Santa Fe
        `,
        clauses: [],
    },
    providenciaAudiencia: {
        formFields: [
            'expediente',
            'expedienteEE',
            'seccionConsumidor',
            'seccionEmpresa',
            'seccionGeneralAdicional',
            'fechaAudiencia',
            'horaAudiencia',
        ],
        intro: (data) => {
            return `Ref. VUF N.º ${data.expediente || '…'} “${data.consumidor.nombre || 'XXX'} c/ ${data.empresa.nombre || 'YYY'} s/ Presunta Infracción a la Ley 24240”
Santa Fe, “Cuna de la Constitución Nacional”, ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}
Vistas constancias de las presentes actuaciones y atendiendo a razones de oportunidad y conveniencia que aconsejan la celebración de una audiencia para una mejor conciliación, fíjese fecha de audiencia para el día ${data.fechaAudiencia.day} a las ${data.horaAudiencia || '..'} horas.
La misma se celebrará de manera virtual, debiendo las partes conectarse al vínculo ${data.empresa.meet || 'https://meet.google.com/…'} Infórmese a las partes que las audiencias sólo se suspenden por caso fortuito o fuerza mayor, debiendo ser acreditado en el plazo de cinco días.
Hágase saber al proveedor que su ausencia injustificada conllevará la apertura de la instrucción sumarial para la investigación de posibles infracciones que pudieran derivarse del reclamo iniciado;
y al consumidor que su ausencia injustificada hará presumir su desistimiento y ulterior archivo de las presentes actuaciones. Notifíquese.`;
        },
        title: 'PROVIDENCIA',
        header: getCommonHeader(),
        footer: `Notifíquese.`,
        clauses: []
    },
    cedulaDenuncianteAudiencia: {
        formFields: [
            'expediente',
            'seccionConsumidor',
            'seccionEmpresa',
            'seccionGeneralAdicional',
            'fechaAudiencia',
            'horaAudiencia'
        ],
        intro: (data) => {
            return `SEÑORES: ${data.consumidor.nombre || '...'}\nDOMICILIO: ${data.consumidor.domicilio || '...'} – ${data.consumidor.email || 'xxx@gmail.com'}\nLOCALIDAD: ${data.consumidor.ciudad || '...'} – CP ${data.consumidor.cp || '...'}\nPROVINCIA: ${data.consumidor.provincia || '...'}\n\nSanta Fe, ${data.fecha.day} de ${data.fecha.month} de ${data.fecha.year}\n\nSe hace saber a Ud. que en el expediente VUF ${data.expediente || '...'}, “${data.consumidor.nombre || 'Xxx'} c/ ${data.empresa.nombre || 'Yyyy'} s/ presunta infracción a la Ley 24240” en trámite por ante la Dirección General de Comercio Interior y Servicios del Ministerio Desarrollo Productivo de la Provincia de Santa Fe se ha dispuesto convocar a las partes para audiencia de conciliación, conforme lo normado en el art. 43 de la Ley 24240. La misma se celebrará de manera virtual, el día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year} a las ${data.horaAudiencia || '..:00'} hs, debiendo Ud. conectarse al vínculo de la videollamada: ${data.empresa.meet || 'https://meet.google.com/...'}\n\nComo recaudo, se transcribe la providencia que así lo ordena: “Ref. VUF N.º ${data.expediente || '...'} “${data.consumidor.nombre || 'XXX'} c/ ${data.empresa.nombre || 'YYY'} s/ Presunta Infracción a la Ley 24240”. Santa Fe, “Cuna de la Constitución Nacional”, ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}. Vistas constancias de las presentes actuaciones y atendiendo a razones de oportunidad y conveniencia que aconsejan la celebración de una audiencia para una mejor conciliación, fíjese fecha de audiencia para el día ${data.fechaAudiencia.day} a las ${data.horaAudiencia || '..'} horas. La misma se celebrará de manera virtual, debiendo las partes conectarse al vínculo ${data.empresa.meet || 'https://meet.google.com/…'} Infórmese a las partes que las audiencias sólo se suspenden por caso fortuito o fuerza mayor, debiendo ser acreditado en el plazo de cinco días. Hágase saber al proveedor que su ausencia injustificada conllevará la apertura de la instrucción sumarial para la investigación de posibles infracciones que pudieran derivarse del reclamo iniciado; y al consumidor que su ausencia injustificada hará presumir su desistimiento y ulterior archivo de las presentes actuaciones. Notifíquese.” Fdo. Jklfakaaruaoiee Jioieslk, DGCIYS – SCIYS, Ministerio de Desarrollo Productivo, Provincia de Santa Fe.\n\nSe hace saber a Uds. que en el caso excepcional de no contar con los medios necesarios para acceder a la audiencia virtual, deberá presentar la correspondiente declaración jurada en el plazo perentorio e improrrogable de cinco (5) días hábiles administrativos. Se notifica a Ud. que las audiencias de conciliación son confidenciales y sólo se suspenden por caso fortuito o fuerza mayor. La acreditación de esta última deberá realizarse con un plazo máximo de hasta cinco (5) días hábiles administrativos posteriores a la fecha de la audiencia. La incomparencia hará presumir, salvo prueba en contrario, el desistimiento y ulterior archivo del reclamo y las presentes actuaciones. Queda Ud. debidamente notificado. Saludo a Ud. atentamente.`;
        },
        title: 'CÉDULA',
        header: getCommonHeader(),
        footer: (data) => `
            ${data.firmanteDenunciante || 'Jklfakaaruaoiee Jioieslk'}
            DGCIYS – SCIYS
            Ministerio de Desarrollo Productivo
            Provincia de Santa Fe
        `,
        clauses: []
    },
    providenciaHomologacion: {
        formFields: ['expediente', 'acuerdoDocNumber', 'seccionConsumidor', 'seccionEmpresa'],
        intro: (data) => {
            return `Ref. VUF N.º ${data.expediente || '…'} “${data.consumidor.nombre || 'XXX'} c/ ${data.empresa.nombre || 'YYY'} s/ Presunta Infracción a la Ley 24240”
Santa Fe, “Cuna de la Constitución Nacional”, ${data.fecha.day} de ${data.fecha.month} de ${data.fecha.year}
Habiendo arribado las partes a un acuerdo conciliatorio que compone los intereses en juego en las presentes actuaciones con sujeción al ordenamiento jurídico y sin contravenir mandas de orden público, homológase el acuerdo otorgado por las partes en DOC-2025-${data.acuerdoDocNumber || '000000-APPSF-PE#MDP'}, con los alcances establecidos en el art. 45 inc a) del Decreto 1798/1994. Oportunamente, procédase al archivo de las presentes actuaciones.`;
        },
        title: 'PROVIDENCIA',
        header: getCommonHeader(),
        footer: 'Notifíquese.',
        clauses: []
    },
    providenciaPrimerTraslado: {
        formFields: [
            'expediente',
            'seccionConsumidor',
            'seccionEmpresa',
            'campoConsumidorDenunciante',
            'campoConciliador'
        ],
        intro: (data) => {
            return `Ref. VUF N.º ${data.expediente || '…'} “${data.consumidor.nombre || 'XXX'} c/ ${data.empresa.nombre || 'YYY'} s/ Presunta Infracción a la Ley 24240”
Santa Fe, “Cuna de la Constitución Nacional”, ${data.fecha.day} de ${data.fecha.month} de ${data.fecha.year}
Atento lo manifestado por la firma ${data.empresa.nombre || 'Yyy'}, córrase traslado al denunciante por el plazo de cinco días, a los efectos de que se exprese a este respecto, pudiendo aceptar o rechazar el mismo o bien formular contrapropuesta y/o lo que estime necesario y/o conveniente.
A estos fines se reenvía la manifestación efectuada por la denunciada.
Hágase saber al denunciante que su silencio hará presumir el desistimiento de su reclamo, por lo que se procederá al oportuno archivo de las presentes actuaciones.
Notifíquese.`;
        },
        title: 'PROVIDENCIA',
        header: getCommonHeader(),
        footer: `Notifíquese.`,
        clauses: []
    },
    actaAudienciaAmbosAusentes: {
        formFields: [
            'expediente',
            'expedienteEE',
            'fechaAudiencia',
            'horaAudiencia',
            'seccionConsumidor',
            'seccionEmpresa',
            'seccionGeneralAdicional'
        ],
        intro: (data) => {
            return `En la Ciudad de ${data.ciudadAcuerdo || 'Santa Fe'}, siendo las ${data.horaAudiencia || '...'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, en los autos EE-${data.expedienteEE || '...-APPSF-PE'} “${data.consumidor.nombre || 'Xxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. s/ presunta infracción a la Ley 24240” ó VUF ${data.expediente || '…'}
“${data.consumidor.nombre || 'Xxxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. S/ presunta infracción a la Ley 24240”, habiendo sido convocadas las partes a esta Audiencia de Conciliación, (que se celebra de manera virtual a través de la plataforma de videollamada Google Meet (enlace: ${data.empresa.meet || 'https://meet.google.com...'})) no comparecen ante esta Dirección Provincial de Defensa del Consumidor ni la parte denunciante ni la parte denunciada.
- Ante lo cual, esta autoridad de aplicación dispone proceder al archivo de las presentes actuaciones, sujeto a la condición resolutoria de que los incomparecientes justifiquen los motivos de su ausencia en el término de cinco días.
No siendo para más, a las ${data.horaAudiencia || '..'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, se da por finalizado el acto, firmando el funcionario actuante de esta Dirección General de Comercio Interior y Servicios.`;
        },
        title: 'ACTA AUDIENCIA',
        header: getCommonHeader(),
        footer: `
            PROVINCIA DE SANTA FE
            Ministerio de Desarrollo Productivo
        `,
        clauses: []
    },
    actaIncomparenciaDenunciado: {
        formFields: [
            'expediente',
            'expedienteEE',
            'fechaAudiencia',
            'horaAudiencia',
            'seccionConsumidor',
            'seccionEmpresa',
            'seccionGeneralAdicional',
            'seccionAcompanante',
            'seccionDetallesTraslado',
            'seccionClausulas'
        ],
        intro: (data) => {
            const acompananteText = data.acompanante.nombre ? ` (acompañado en este acto por el Sr. ${data.acompanante.nombre}, DNI ${data.acompanante.dni})` : '';
            const ausenciaText = data.ausenciaComunicada ? `- Se deja constancia que el Sr. ${data.empresa.nombre} ha comunicado a esta autoridad de aplicación que se encuentra fuera de la ciudad, por lo que ha solicitado se fije nueva fecha de audiencia.` : '';
            const cedulaDevueltaText = data.cedulaDevuelta ? `/// Se deja constancia que la cédula dirigida a la denunciada ${data.empresa.nombre} ha sido devuelta por el Correo Argentino con la leyenda “${data.motivoDevolucion}”.` : '';

            return `En la Ciudad de ${data.ciudadAcuerdo || 'Santa Fe'}, siendo las ${data.horaAudiencia || '...'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, en los autos EE-${data.expedienteEE || '...-APPSF-PE'} “${data.consumidor.nombre || 'Xxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. s/ presunta infracción a la Ley 24240” ó VUF ${data.expediente || '…'}
“${data.consumidor.nombre || 'Xxxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. S/ presunta infracción a la Ley 24240”, habiendo sido convocadas las partes a esta Audiencia de Conciliación, (que se celebra de manera virtual a través de la plataforma de videollamada Google Meet (enlace: ${data.empresa.meet || 'https://meet.google.com...'})) comparece ante esta Dirección Provincial de Defensa del Consumidor, el Sr. ${data.consumidor.nombre || 'Xxxx'}, DNI ${data.consumidor.dni || '000'}, con domicilio electrónico en ${data.consumidor.email || 'xxx@hotmail.com'},${acompananteText}, por la parte denunciante.
Por la denunciada, nadie comparece, a pesar de encontrarse debidamente notificada.
El compareciente acepta y reconoce la confidencialidad al amparo de la cual se desarrolla la presente audiencia.
- Se deja constancia que el compareciente se encuentra en conocimiento de los alcances y características de este trámite administrativo así como también del procedimiento aplicable al mismo.
${ausenciaText}
${cedulaDevueltaText}
- Abierto el acto, el denunciante manifiesta que ratifica todos y cada uno de los términos de su denuncia, así como la documentación oportunamente aportada.
Agrega que ${data.clausulas.editableAgrega || '...'}.
- Oído lo cual, esta autoridad de aplicación dispone tener presentes los dichos de la denunciante y, ante la incomparencia de la denunciada, pasar las presentes actuaciones a su instrucción sumarial, sujeto a la condición resolutoria de que el incompareciente justifique los motivos de su ausencia en el plazo de cinco días.
Queda el compareciente debidamente notificado.
No siendo para más, a las ${data.horaAudiencia || '..'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, previa lectura y ratificación, se da por finalizado el acto, firmando el funcionario actuante de esta Dirección General de Comercio Interior y Servicios, con la plena conformidad del compareciente.`;
        },
        title: 'ACTA AUDIENCIA',
        header: getCommonHeader(),
        footer: `
            PROVINCIA DE SANTA FE
            Ministerio de Desarrollo Productivo
        `,
        clauses: [
            { id: 'editableAgrega', title: 'Agrega', editable: true, placeholder: 'Agregue aquí el contenido específico del denunciante...', defaultText: (data) => data.clausulas.editableAgrega || '...' }
        ]
    },
    actaIncomparenciaDenunciante: {
        formFields: [
            'expediente',
            'expedienteEE',
            'fechaAudiencia',
            'horaAudiencia',
            'seccionConsumidor',
            'seccionEmpresa',
            'seccionGeneralAdicional',
            'seccionAcompanante',
            'seccionDetallesTraslado',
            'seccionClausulas'
        ],
        intro: (data) => {
            return `En la Ciudad de ${data.ciudadAcuerdo || 'Santa Fe'}, siendo las ${data.horaAudiencia || '...'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, en los autos EE-${data.expedienteEE || '...-APPSF-PE'} “${data.consumidor.nombre || 'Xxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. s/ presunta infracción a la Ley 24240” ó VUF ${data.expediente || '…'}
“${data.consumidor.nombre || 'Xxxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. S/ presunta infracción a la Ley 24240”, habiendo sido convocadas las partes a esta Audiencia de Conciliación, (que se celebra de manera virtual a través de la plataforma de videollamada Google Meet (enlace: ${data.empresa.meet || 'https://meet.google.com...'})) no comparece ante esta Dirección Provincial de Defensa del Consumidor la parte denunciante.
Por la denunciada, ${data.empresa.nombre || 'Yyyy'}, comparece el Sr. ${data.representante.nombre || '…'}, DNI ${data.representante.dni || '000'}, con domicilio electrónico en ${data.representante.email || 'yyy@gmail.com'}.
El compareciente acepta y reconoce la confidencialidad al amparo de la cual se desarrolla la presente audiencia.
- Se deja constancia que el compareciente se encuentra en conocimiento de los alcances y características de este trámite administrativo así como también del procedimiento aplicable al mismo.
- Abierto el acto, el Sr. ${data.representante.nombre || '...'} manifiesta que ${data.clausulas.representanteManifiesta || '...'}.
- Oído lo cual, esta autoridad de aplicación dispone tener presente el domicilio electrónico del denunciado, así como sus dichos y, ante la incomparencia de la parte denunciante, proceder al archivo de las presentes actuaciones, sujeto a la condición resolutoria de que el incompareciente justifique los motivos de su ausencia en el término de cinco días.
Queda el compareciente debidamente notificado.
No siendo para más, a las ${data.horaAudiencia || '..'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, previa lectura y ratificación, se da por finalizado el acto, firmando el funcionario actuante de esta Dirección General de Comercio Interior y Servicios, con la plena conformidad del compareciente.`;
        },
        title: 'ACTA AUDIENCIA',
        header: getCommonHeader(),
        footer: `
        PROVINCIA DE SANTA FE
        Ministerio de Desarrollo Productivo
    `,
        clauses: [
            { id: 'representanteManifiesta', title: 'Manifiesta', editable: true, placeholder: 'Agregue aquí lo que manifiesta el representante...', defaultText: (data) => data.clausulas.representanteManifiesta || '...' }
        ]
    },
    actaPresentesAcuerdo: {
        formFields: [
            'expediente',
            'expedienteEE',
            'fechaAudiencia',
            'horaAudiencia',
            'seccionConsumidor',
            'seccionEmpresa',
            'seccionGeneralAdicional',
            'seccionAcompanante',
            'seccionDetallesTraslado',
            'seccionClausulas'
        ],
        intro: (data) => {
            const acompananteText = data.acompanante.nombre ? ` (acompañado en este acto por el Sr. ${data.acompanante.nombre}, DNI ${data.acompanante.dni})` : '';
            return `En la Ciudad de ${data.ciudadAcuerdo || 'Santa Fe'}, siendo las ${data.horaAudiencia || '...'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, en los autos EE-${data.expedienteEE || '...-APPSF-PE'} “${data.consumidor.nombre || 'Xxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. s/ presunta infracción a la Ley 24240” ó VUF ${data.expediente || '…'}
“${data.consumidor.nombre || 'Xxxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. S/ presunta infracción a la Ley 24240”, habiendo sido convocadas las partes a esta Audiencia de Conciliación, (que se celebra de manera virtual a través de la plataforma de videollamada Google Meet (enlace: ${data.empresa.meet || 'https://meet.google.com...'})) comparece ante esta Dirección Provincial de Defensa del Consumidor, el Sr. ${data.consumidor.nombre || 'Xxxx'}, DNI ${data.consumidor.dni || '000'}, con domicilio electrónico en ${data.consumidor.email || 'xxx@hotmail.com'},${acompananteText}, por la parte denunciante.
Por la denunciada, comparece el Sr. ${data.representante.nombre || 'Ddd'}, DNI ${data.representante.dni || '0000'}, con domicilio electrónico en ${data.representante.email || 'ddd@hotmail.com'}.
Los comparecientes aceptan y reconocen la confidencialidad al amparo de la cual se desarrolla la presente audiencia.
- Se deja constancia que las partes se encuentran en conocimiento de los alcances y características de este trámite administrativo así como también del procedimiento aplicable al mismo.
- Abierto el acto, el denunciante manifiesta que ratifica todos y cada uno de los términos de su denuncia, así como la documentación oportunamente aportada.
Agrega que ${data.clausulas.editableAgrega || '...'}.
- A continuación, toma la palabra el Sr. ${data.representante.nombre || 'Ddd'}, quien manifiesta que ${data.clausulas.representanteManifiesta || '...'}.
- Oído lo cual, esta autoridad de aplicación dispone tener presente el domicilio electrónico de la denunciada y los dichos de las partes.
Y, habiendo las partes arribado a un acuerdo conciliatorio que compone los intereses de las partes con sujeción al ordenamiento jurídico y sin contravenir mandas de orden público, homológase el acuerdo celebrado por las partes.
Procédase al archivo de las presentes actuaciones. Quedan los comparecientes debidamente notificados.
No siendo para más, a las ${data.horaAudiencia || '..'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, previa lectura y ratificación, se da por finalizado el acto, firmando el funcionario actuante de esta Dirección General de Comercio Interior y Servicios, con la plena conformidad de los comparecientes.`;
        },
        title: 'ACTA AUDIENCIA',
        header: getCommonHeader(),
        footer: `
        PROVINCIA DE SANTA FE
        Ministerio de Desarrollo Productivo
    `,
        clauses: [
            { id: 'editableAgrega', title: 'Agrega', editable: true, placeholder: 'Agregue aquí lo que agrega el denunciante...', defaultText: (data) => data.clausulas.editableAgrega || '...' },
            { id: 'representanteManifiesta', title: 'Manifiesta', editable: true, placeholder: 'Agregue aquí lo que manifiesta el representante...', defaultText: (data) => data.clausulas.representanteManifiesta || '...' }
        ]
    },
    actaPaseASumario: {
        formFields: [
            'expediente',
            'expedienteEE',
            'fechaAudiencia',
            'horaAudiencia',
            'seccionConsumidor',
            'seccionEmpresa',
            'seccionGeneralAdicional',
            'seccionAcompanante',
            'seccionDetallesTraslado',
            'seccionClausulas'
        ],
        intro: (data) => {
            const acompananteText = data.acompanante.nombre ? ` (acompañado en este acto por el Sr. ${data.acompanante.nombre}, DNI ${data.acompanante.dni})` : '';
            return `En la Ciudad de ${data.ciudadAcuerdo || 'Santa Fe'}, siendo las ${data.horaAudiencia || '...'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, en los autos EE-${data.expedienteEE || '...-APPSF-PE'} “${data.consumidor.nombre || 'Xxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. s/ presunta infracción a la Ley 24240” ó VUF ${data.expediente || '…'} [cite: 51]
“${data.consumidor.nombre || 'Xxxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. S/ presunta infracción a la Ley 24240”, habiendo sido convocadas las partes a esta Audiencia de Conciliación, (que se celebra de manera virtual a través de la plataforma de videollamada Google Meet (enlace: ${data.empresa.meet || 'https://meet.google.com...'})) comparece ante esta Dirección Provincial de Defensa del Consumidor, el Sr. ${data.consumidor.nombre || 'Xxxx'}, DNI ${data.consumidor.dni || '000'}, con domicilio electrónico en ${data.consumidor.email || 'xxx@hotmail.com'},${acompananteText}, por la parte denunciante. [cite: 52]
Por la denunciada, comparece el Sr. ${data.representante.nombre || 'Ddd'}, DNI ${data.representante.dni || '0000'}, con domicilio electrónico en ${data.representante.email || 'ddd@hotmail.com'}. [cite: 53]
Los comparecientes aceptan y reconocen la confidencialidad al amparo de la cual se desarrolla la presente audiencia. [cite: 54]
- Se deja constancia que las partes se encuentran en conocimiento de los alcances y características de este trámite administrativo así como también del procedimiento aplicable al mismo. [cite: 55]
- Abierto el acto, el denunciante manifiesta que ratifica todos y cada uno de los términos de su denuncia, así como la documentación oportunamente aportada. [cite: 56]
Agrega que ${data.clausulas.editableAgrega || '...'}. [cite: 57]
- A continuación, toma la palabra el Sr. ${data.representante.nombre || 'Ddd'}, quien manifiesta que ${data.clausulas.representanteManifiesta || '...'}. [cite: 58]
- Oído lo cual, esta autoridad de aplicación dispone tener presente el domicilio electrónico de la denunciada y los dichos de las partes. [cite: 59]
Y, ante la imposibilidad de arribar a un acuerdo conciliatorio, esta autoridad de aplicación dispone pasar las presentes actuaciones a su instrucción sumarial. 
Quedan los comparecientes debidamente notificados. [cite: 61]
No siendo para más, a las ${data.horaAudiencia || '..'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, previa lectura y ratificación, se da por finalizado el acto, firmando el funcionario actuante de esta Dirección General de Comercio Interior y Servicios, con la plena conformidad de los comparecientes. [cite: 62]`;
        },
        title: 'ACTA AUDIENCIA',
        header: getCommonHeader(),
        footer: `
        PROVINCIA DE SANTA FE
        Ministerio de Desarrollo Productivo
    `,
        clauses: [
            { id: 'editableAgrega', title: 'Agrega', editable: true, placeholder: 'Agregue aquí lo que agrega el denunciante...', defaultText: (data) => data.clausulas.editableAgrega || '...' },
            { id: 'representanteManifiesta', title: 'Manifiesta', editable: true, placeholder: 'Agregue aquí lo que manifiesta el representante...', defaultText: (data) => data.clausulas.representanteManifiesta || '...' }
        ]
    },
actaIncomparenciaPorFaltaDeDomicilio: {
    formFields: [
        'expediente',
        'expedienteEE',
        'fechaAudiencia',
        'horaAudiencia',
        'seccionConsumidor',
        'seccionEmpresa',
        'seccionGeneralAdicional',
        'seccionAcompanante',
        'seccionDetallesTraslado',
        'seccionClausulas',
        'nuevaFechaAudiencia',
        'nuevaHoraAudiencia'
    ],
    intro: (data) => {
        const acompananteText = data.acompanante.nombre ? ` (acompañado en este acto por el Sr. ${data.acompanante.nombre}, DNI ${data.acompanante.dni})` : '';
        const cedulaDevueltaText = data.cedulaDevuelta ? `- Se deja constancia que la cédula dirigida a la denunciada ${data.empresa.nombre} ha sido devuelta por el Correo Argentino con la leyenda “${data.motivoDevolucion}”, por lo que se procede a la búsqueda del domicilio de la denunciada, resultando de la página web de la misma ${data.empresaWeb || 'www…..com.ar'} que el mismo es el sito en calle ${data.nuevoDomicilioEmpresa || '…'} de la ciudad de ${data.empresa.ciudad || '…'}, CP ${data.empresa.cp || '…'}.` : '';
        
        return `En la Ciudad de ${data.ciudadAcuerdo || 'Santa Fe'}, siendo las ${data.horaAudiencia || '...'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, en los autos EE-${data.expedienteEE || '...-APPSF-PE'} “${data.consumidor.nombre || 'Xxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. s/ presunta infracción a la Ley 24240” ó VUF ${data.expediente || '…'}
“${data.consumidor.nombre || 'Xxxx'} c/ ${data.empresa.nombre || 'Dddd'} y/u ots. S/ presunta infracción a la Ley 24240”, habiendo sido convocadas las partes a esta Audiencia de Conciliación, (que se celebra de manera virtual a través de la plataforma de videollamada Google Meet (enlace: ${data.empresa.meet || 'https://meet.google.com...'})) comparece ante esta Dirección Provincial de Defensa del Consumidor, el Sr. ${data.consumidor.nombre || 'Xxxx'}, DNI ${data.consumidor.dni || '000'}, con domicilio electrónico en ${data.consumidor.email || 'xxx@hotmail.com'},${acompananteText}, por la parte denunciante.
Por la denunciada, nadie comparece. El compareciente acepta y reconoce la confidencialidad al amparo de la cual se desarrolla la presente audiencia.
- Se deja constancia que el compareciente se encuentra en conocimiento de los alcances y características de este trámite administrativo así como también del procedimiento aplicable al mismo.
${cedulaDevueltaText}
- Abierto el acto, el denunciante manifiesta que ratifica todos y cada uno de los términos de su denuncia, así como la documentación oportunamente aportada.
Agrega que ${data.clausulas.editableAgrega || '...'}.
- Oído lo cual, esta autoridad de aplicación dispone tener presentes los dichos de la denunciante y, ante la frustración de la notificación de esta audiencia a la denunciada, fijar nuevo día y hora de audiencia de conciliación para el próximo ${data.nuevaFechaAudiencia.day} de ${data.nuevaFechaAudiencia.month} de ${data.nuevaFechaAudiencia.year}, a las ${data.nuevaHoraAudiencia || '000'} horas.
(La misma se celebrará de manera virtual, debiendo las partes conectarse al vínculo ${data.empresa.meet || 'https://meet.google.com...'} para comparecer a la audiencia).
Queda el compareciente debidamente notificado.
No siendo para más, a las ${data.horaAudiencia || '..'} horas del día ${data.fechaAudiencia.day} de ${data.fechaAudiencia.month} de ${data.fechaAudiencia.year}, previa lectura y ratificación, se da por finalizado el acto, firmando el funcionario actuante de esta Dirección General de Comercio Interior y Servicios, con la plena conformidad del compareciente.`;
    },
    title: 'ACTA AUDIENCIA',
    header: getCommonHeader(),
    footer: `
        PROVINCIA DE SANTA FE
        Ministerio de Desarrollo Productivo
    `,
    clauses: [
        { id: 'editableAgrega', title: 'Agrega', editable: true, placeholder: 'Agregue aquí lo que agrega el denunciante...', defaultText: (data) => data.clausulas.editableAgrega || '...' }
    ]
}
};

// --- Function to get all data from the form ---
function getFormData() {
    const fecha = getFormattedDate(document.getElementById("fechaAcuerdo").value);
    const fechaAudiencia = getFormattedDate(document.getElementById("fechaAudiencia").value);
    const nuevaFechaAudiencia = getFormattedDate(document.getElementById("nuevaFechaAudiencia").value);

    // Get clauses data before building the main object
    const clausesData = {};
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];
    if (template.clauses) {
        template.clauses.forEach((clause) => {
            if (clause.editable) {
                const textarea = document.getElementById(`clausula${clause.id.charAt(0).toUpperCase() + clause.id.slice(1)}`);
                if (textarea) {
                    clausesData[clause.id] = textarea.value;
                }
            }
        });
    }

    const data = {
        ciudadAcuerdo: document.getElementById("ciudadAcuerdo").value,
        fecha: fecha,
        fechaAudiencia: fechaAudiencia,
        expediente: document.getElementById("expediente").value,
        expedienteEE: document.getElementById("expedienteEE").value,
        acuerdoDocNumber: document.getElementById("acuerdoDocNumber").value,
        consumidorDenunciante: document.getElementById("consumidorDenunciante").value,
        conciliadorAsignado: document.getElementById("conciliadorAsignado").value,
        horaAudiencia: document.getElementById("horaAudiencia")
            ? document.getElementById("horaAudiencia").value
            : "",
        acompanante: {
            nombre: document.getElementById('acompananteNombre').value,
            dni: document.getElementById('acompananteDNI').value,
        },
        representante: {
            nombre: document.getElementById("representanteNombre").value,
            dni: document.getElementById("representanteDNI").value,
            email: document.getElementById("representanteEmail").value,
        },
        ausenciaComunicada: document.getElementById('ausenciaComunicada').checked,
        cedulaDevuelta: document.getElementById('cedulaDevuelta').checked,
        motivoDevolucion: document.getElementById('motivoDevolucion').value,
        empresaWeb: document.getElementById('empresaWeb').value,
        nuevoDomicilioEmpresa: document.getElementById('nuevoDomicilioEmpresa').value,
        nuevaFechaAudiencia: nuevaFechaAudiencia,
        nuevaHoraAudiencia: document.getElementById('nuevaHoraAudiencia').value,
        empresa: {
            apoderado: document.getElementById("empresaApoderado").value,
            dni: document.getElementById("empresaDNI").value,
            nombre: document.getElementById("empresaNombre").value || "",
            cuit: document.getElementById("empresaCUIT").value,
            domicilio: document.getElementById("empresaDomicilio").value,
            ciudad: document.getElementById("empresaCiudad").value,
            provincia: document.getElementById("empresaProvincia").value || "",
            cp: document.getElementById("empresaCP").value || "",
            mail: document.getElementById("empresaMail").value || "",
            meet: document.getElementById("empresaMeet").value || "",
        },
        consumidor: {
            nombre: document.getElementById("consumidorNombre").value || "",
            dni: document.getElementById("consumidorDNI").value || "",
            domicilio: document.getElementById("consumidorDomicilio").value || "",
            ciudad: document.getElementById("consumidorCiudad").value || "",
            email: document.getElementById("consumidorEmail").value || "",
            cp: document.getElementById("consumidorCP").value || "",
            provincia: document.getElementById("consumidorProvincia").value || "",
        },
        cedulaNombre: document.getElementById("cedulaNombre").value || "",
        cedulaDomicilio: document.getElementById("cedulaDomicilio").value || "",
        cedulaLocalidad: document.getElementById("cedulaLocalidad").value || "",
        cedulaCP: document.getElementById("cedulaCP").value || "",
        cedulaProvincia: document.getElementById("cedulaProvincia").value || "",
        firmanteCedula: document.getElementById("firmanteCedula").value || "",
        firmanteDenunciante: document.getElementById("firmanteDenunciante").value || "",
        clausulas: clausesData,
        documentType: agreementTypeSelect.value,
    };
    return data;
}

// --- Function to toggle form sections visibility ---
function toggleFormSections() {
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    const allSections = [
        "seccionEmpresa",
        "seccionConsumidor",
        "seccionClausulas",
        "seccionCedula",
        "seccionAcompanante",
        "seccionDetallesTraslado",
        "campoConsumidorDenunciante",
        "campoConciliador",
        "seccionGeneralAdicional",
        "acuerdoDocNumberDiv"
    ];

    allSections.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = template.formFields.includes(sectionId) ? 'block' : 'none';
        }
    });

    // Handle "seccionClausulas" visibility for the clauses themselves
    const seccionClausulas = document.getElementById("seccionClausulas");
    if (seccionClausulas) {
        seccionClausulas.style.display = (template.clauses && template.clauses.length > 0) ? 'block' : 'none';
    }
}

// --- Function to load dynamic clauses in the form ---
function loadDynamicFormClauses() {
    const editableClausesDiv = document.getElementById("editable-clausulas");
    editableClausesDiv.innerHTML = "";
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    if (template.clauses) {
        template.clauses.forEach((clause) => {
            if (clause.editable) {
                const div = document.createElement("div");
                div.className = "mb-3";

                const label = document.createElement("label");
                label.setAttribute(
                    "for",
                    `clausula${clause.id.charAt(0).toUpperCase() + clause.id.slice(1)}`
                );
                label.className = "form-label";
                label.innerText = clause.title;

                const textarea = document.createElement("textarea");
                textarea.id = `clausula${clause.id.charAt(0).toUpperCase() + clause.id.slice(1)
                    }`;
                textarea.rows = "3";
                textarea.className = "form-control";
                textarea.placeholder = clause.placeholder || "";

                // Restore saved value if available
                const savedData = JSON.parse(localStorage.getItem('agreementFormData'));
                if (savedData && savedData.documentType === currentDocumentType && savedData.clausulas && savedData.clausulas[clause.id]) {
                    textarea.value = savedData.clausulas[clause.id];
                } else if (clause.defaultText) {
                    textarea.value = typeof clause.defaultText === 'function' ? clause.defaultText(getFormData()) : clause.defaultText;
                }

                div.appendChild(label);
                div.appendChild(textarea);
                editableClausesDiv.appendChild(div);
            }
        });
    }
}

// --- Function to update the HTML PREVIEW ---
function updatePreview() {
    const data = getFormData();
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    document.getElementById("preview-header-content").innerHTML =
        template.header || "";
    document.getElementById("preview-title-content").innerText =
        template.title || "";

    // Use innerHTML for intro text to handle line breaks
    document.getElementById("preview-body-text").innerHTML = (
        template.intro(data) || ""
    ).replace(/\n/g, "<br>");

    const dynamicContentPreview = document.getElementById(
        "preview-dynamic-content"
    );
    dynamicContentPreview.innerHTML = "";

    if (template.clauses && template.clauses.length > 0) {
        template.clauses.forEach((clause) => {
            const div = document.createElement("div");
            div.className = "preview-clausula mb-2";

            let clauseText;
            if (clause.editable) {
                clauseText = data.clausulas[clause.id] || clause.placeholder || "";
            } else if (typeof clause.defaultText === "function") {
                clauseText = clause.defaultText(data);
            } else {
                clauseText = clause.defaultText;
            }

            if (clauseText && clauseText.trim() !== "") {
                const titleSpan = document.createElement("span");
                titleSpan.className = "preview-clausula-title fw-bold me-1";
                titleSpan.innerText = `${clause.title}:`;

                const textSpan = document.createElement("span");
                textSpan.className = "preview-clausula-text";
                textSpan.innerHTML = clauseText.replace(/\n/g, "<br>");

                div.appendChild(titleSpan);
                div.appendChild(textSpan);
                dynamicContentPreview.appendChild(div);
            }
        });
    }

    const footerContent =
        typeof template.footer === "function"
            ? template.footer(data)
            : template.footer;
    document.getElementById("preview-footer-content").innerHTML = (
        footerContent || ""
    ).replace(/\n/g, "<br>");
}

function downloadPdf() {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const data = getFormData();
    const currentDocumentType = agreementTypeSelect.value;
    const template = documentTemplates[currentDocumentType];

    const marginLeft = 20;
    const marginRight = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const maxWidth = pageWidth - marginLeft - marginRight;
    let currentY = 20;

    const addPageIfNeeded = () => {
        if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = 20;
        }
    };

    // Header
    if (template.header) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(73, 73, 99);
        const headerText = template.header.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const headerLines = doc.splitTextToSize(headerText, maxWidth);
        headerLines.forEach((line) => {
            addPageIfNeeded();
            doc.text(line, pageWidth / 2, currentY, { align: "center" });
            currentY += 6;
        });
        currentY += 6;
    }

    // Title
    if (template.title) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        addPageIfNeeded();
        doc.text(template.title, pageWidth / 2, currentY, { align: "center" });
        currentY += 12;
    }

    // Intro text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const introText = template.intro(data);
    const introLines = doc.splitTextToSize(introText, maxWidth);
    introLines.forEach((line) => {
        addPageIfNeeded();
        doc.text(line, marginLeft, currentY, { align: "left" });
        currentY += 6;
    });
    currentY += 6;

    // Render clauses
    if (template.clauses && template.clauses.length > 0) {
        template.clauses.forEach((clause) => {
            let clauseText = "";
            if (clause.editable) {
                clauseText = data.clausulas[clause.id] || "";
            } else if (typeof clause.defaultText === "function") {
                clauseText = clause.defaultText(data) || "";
            } else {
                clauseText = clause.defaultText || "";
            }
            if (!clauseText.trim()) {
                return;
            }

            const clauseTitle = clause.title ? clause.title.toUpperCase() + ":" : "";
            const fullText = clauseTitle
                ? clauseTitle + " " + clauseText
                : clauseText;

            const lines = doc.splitTextToSize(fullText, maxWidth);
            lines.forEach((line) => {
                addPageIfNeeded();
                doc.text(line, marginLeft, currentY, { align: "left" });
                currentY += 6;
            });
            currentY += 6;
        });
    }

    // Footer
    const footerContent =
        typeof template.footer === "function"
            ? template.footer(data)
            : template.footer;
    if (footerContent) {
        const footerLines = doc.splitTextToSize(footerContent, maxWidth);
        footerLines.forEach((line) => {
            addPageIfNeeded();
            doc.text(line, marginLeft, currentY, { align: "left" });
            currentY += 6;
        });
        currentY += 6;
    }

    // Fixed footer with line and text
    const fixedFooterY = pageHeight - 20;
    doc.setDrawColor(73, 73, 99);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, fixedFooterY, pageWidth - marginRight, fixedFooterY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
        '"2025 - 210 años del Congreso de los Pueblos Libres"',
        pageWidth / 2,
        fixedFooterY + 6,
        { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.text(
        "Bv. Pellegrini 3100 - Santa Fe (CP 3000)",
        pageWidth / 2,
        fixedFooterY + 12,
        { align: "center" }
    );

    doc.save(`${currentDocumentType}_${data.expediente || "doc"}.pdf`);
}

function saveData() {
    try {
        const data = getFormData();
        localStorage.setItem("agreementFormData", JSON.stringify(data));
        alert("Datos guardados exitosamente en el navegador.");
    } catch (error) {
        console.error("Error al guardar los datos:", error);
        alert("Hubo un error al guardar los datos.");
    }
}

function loadData() {
    try {
        const savedData = JSON.parse(localStorage.getItem("agreementFormData"));
        if (savedData) {
            agreementTypeSelect.value =
                savedData.documentType || "acuerdoConciliatorio";

            document.getElementById("ciudadAcuerdo").value =
                savedData.ciudadAcuerdo || "Santa Fe";

            // Restore general date
            if (savedData.fecha && savedData.fecha.year && savedData.fecha.month && savedData.fecha.day) {
                const year = savedData.fecha.year;
                const day = String(savedData.fecha.day).padStart(2, "0");
                const monthIndex = [
                    "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
                ].indexOf(savedData.fecha.month);
                const month = String(monthIndex + 1).padStart(2, "0");
                document.getElementById("fechaAcuerdo").value = `${year}-${month}-${day}`;
            } else {
                document.getElementById("fechaAcuerdo").valueAsDate = new Date();
            }

            // Restore hearing date
            if (savedData.fechaAudiencia && savedData.fechaAudiencia.year && savedData.fechaAudiencia.month && savedData.fechaAudiencia.day) {
                const year = savedData.fechaAudiencia.year;
                const day = String(savedData.fechaAudiencia.day).padStart(2, "0");
                const monthIndex = [
                    "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
                ].indexOf(savedData.fechaAudiencia.month);
                const month = String(monthIndex + 1).padStart(2, "0");
                document.getElementById("fechaAudiencia").value = `${year}-${month}-${day}`;
            }
            if (document.getElementById("horaAudiencia")) {
                document.getElementById("horaAudiencia").value = savedData.horaAudiencia || "";
            }

            // Restore general fields
            document.getElementById("expediente").value = savedData.expediente || "";
            if (document.getElementById("expedienteEE")) {
                document.getElementById("expedienteEE").value = savedData.expedienteEE || "";
            }
            if (document.getElementById("acuerdoDocNumber")) {
                document.getElementById("acuerdoDocNumber").value = savedData.acuerdoDocNumber || "";
            }
            document.getElementById("consumidorDenunciante").value =
                savedData.consumidorDenunciante || "";
            document.getElementById("conciliadorAsignado").value =
                savedData.conciliadorAsignado || "";

            // Restore optional fields
            if (document.getElementById("acompananteNombre") && savedData.acompanante) {
                document.getElementById("acompananteNombre").value = savedData.acompanante.nombre || '';
                document.getElementById("acompananteDNI").value = savedData.acompanante.dni || '';
            }
            if (document.getElementById("ausenciaComunicada")) {
                document.getElementById("ausenciaComunicada").checked = savedData.ausenciaComunicada;
            }
            if (document.getElementById("cedulaDevuelta")) {
                document.getElementById("cedulaDevuelta").checked = savedData.cedulaDevuelta;
            }
            if (document.getElementById("motivoDevolucion")) {
                document.getElementById("motivoDevolucion").value = savedData.motivoDevolucion || '';
            }


            // Restore Empresa fields
            if (savedData.empresa) {
                document.getElementById("empresaApoderado").value =
                    savedData.empresa.apoderado || "";
                document.getElementById("empresaDNI").value =
                    savedData.empresa.dni || "";
                document.getElementById("empresaNombre").value =
                    savedData.empresa.nombre || "";
                document.getElementById("empresaCUIT").value =
                    savedData.empresa.cuit || "";
                document.getElementById("empresaDomicilio").value =
                    savedData.empresa.domicilio || "";
                document.getElementById("empresaCiudad").value =
                    savedData.empresa.ciudad || "";
                document.getElementById("empresaProvincia").value =
                    savedData.empresa.provincia || "";
                document.getElementById("empresaCP").value = savedData.empresa.cp || "";
                document.getElementById("empresaMail").value =
                    savedData.empresa.mail || "";
                document.getElementById("empresaMeet").value =
                    savedData.empresa.meet || "";
            }

            // Restore Consumidor fields
            if (savedData.consumidor) {
                document.getElementById("consumidorNombre").value =
                    savedData.consumidor.nombre || "";
                document.getElementById("consumidorDNI").value =
                    savedData.consumidor.dni || "";
                document.getElementById("consumidorDomicilio").value =
                    savedData.consumidor.domicilio || "";
                document.getElementById("consumidorCiudad").value =
                    savedData.consumidor.ciudad || "";
                if (document.getElementById("consumidorEmail")) {
                    document.getElementById("consumidorEmail").value = savedData.consumidor.email || '';
                }
                if (document.getElementById("consumidorCP")) {
                    document.getElementById("consumidorCP").value = savedData.consumidor.cp || '';
                }
                if (document.getElementById("consumidorProvincia")) {
                    document.getElementById("consumidorProvincia").value = savedData.consumidor.provincia || '';
                }
            }

            // Restore Cedula fields
            if (document.getElementById("cedulaNombre")) {
                document.getElementById("cedulaNombre").value =
                    savedData.cedulaNombre || "";
                document.getElementById("cedulaDomicilio").value =
                    savedData.cedulaDomicilio || "";
                document.getElementById("cedulaLocalidad").value =
                    savedData.cedulaLocalidad || "";
                document.getElementById("cedulaCP").value = savedData.cedulaCP || "";
                document.getElementById("cedulaProvincia").value =
                    savedData.cedulaProvincia || "";
                document.getElementById("firmanteCedula").value =
                    savedData.firmanteCedula || "";
            }
            if (document.getElementById("firmanteDenunciante")) {
                document.getElementById("firmanteDenunciante").value = savedData.firmanteDenunciante || "";
            }

            // Reload dynamic clauses for editable textareas
            loadDynamicFormClauses();

            updatePreview();
        } else {
            // alert("No hay datos guardados para cargar.");
        }
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        // alert('Hubo un error al cargar los datos.');
    }
}

// --- Event Listeners ---
form.addEventListener("input", updatePreview);
agreementTypeSelect.addEventListener("change", () => {
    toggleFormSections();
    loadDynamicFormClauses();
    updatePreview();
});

// Event listener for optional sections
document.getElementById('cedulaDevuelta').addEventListener('change', (e) => {
    document.getElementById('motivoDevolucionDiv').style.display = e.target.checked ? 'block' : 'none';
    updatePreview();
});

document
    .getElementById("generatePdfBtn")
    .addEventListener("click", downloadPdf);
document.getElementById("saveDataBtn").addEventListener("click", saveData);

// Initial setup
window.addEventListener("load", () => {
    document.getElementById("fechaAcuerdo").valueAsDate = new Date();
    document.getElementById("fechaAudiencia").valueAsDate = new Date(); // New field default value
    loadData();
    toggleFormSections();
    loadDynamicFormClauses();
    updatePreview();
    document.getElementById('cedulaDevuelta').dispatchEvent(new Event('change'));
});