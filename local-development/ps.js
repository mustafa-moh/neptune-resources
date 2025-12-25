var appModel;
var confirmationDialog;

function initializeApp() {
    appModel = new sap.ui.model.json.JSONModel({
        events: [],
        selectedEvent: {},
        filters: {
            searchQuery: "",
            filterDate: "",
            filterLocation: ""
        }
    });
    if (typeof App !== 'undefined') {
        App.setModel(appModel, "appModel");
    }

    loadEventsData();
    configureResponsiveTables();
}

function configureResponsiveTables() {
    if (typeof eventsTable !== "undefined") {
        eventsTable.getColumns().forEach(function(column, index) {
            switch (index) {
                case 0: // Event Name
                    column.setMinScreenWidth("Phone");
                    column.setDemandPopin(false);
                    break;
                case 1: // Date
                case 2: // Location
                    column.setMinScreenWidth("Tablet");
                    column.setDemandPopin(true);
                    column.setPopinDisplay("Inline");
                    break;
                case 3: // Capacity
                case 4: // Registered
                    column.setMinScreenWidth("Desktop");
                    column.setDemandPopin(true);
                    column.setPopinDisplay("Inline");
                    break;
                case 5: // Weather
                    column.setMinScreenWidth("Tablet");
                    column.setDemandPopin(true);
                    column.setPopinDisplay("Inline");
                    break;
                case 6: // Actions
                    column.setMinScreenWidth("Phone");
                    column.setDemandPopin(false);
                    break;
            }
        });
    }
}

function applyFilters() {
    const searchQuery = typeof eventSearchField !== 'undefined' ? eventSearchField.getValue() : '';
    const filterDate = typeof eventDateFilter !== 'undefined' ? eventDateFilter.getValue() : '';
    const filterLocation = typeof eventLocationFilter !== 'undefined' ? eventLocationFilter.getSelectedKey() : '';

    loadEventsData(searchQuery, filterDate, filterLocation);
}

function loadEventsData(searchQuery, filterDate, filterLocation) {
    sap.ui.core.BusyIndicator.show(0);

    let where = { status: "Published" };
    if (searchQuery) {
        where.title = { like: `%${searchQuery}%` };
    }
    if (filterDate) {
        where.eventdate = filterDate;
    }
    if (filterLocation) {
        where.location = filterLocation;
    }
    console.log(">>>>>>>", where);
    apieventsAPI({
        parameters: {
            where: JSON.stringify(where)
        }
    })
    .success(function(eventsData) {
        Promise.all(eventsData.map(event =>
            new Promise((resolve, reject) => {
                apieventRegCountApi({
                    parameters: {
                        where: JSON.stringify({ eventid: event.id })
                    }
                })
                .success(countObj => resolve({ event, count: (countObj && typeof countObj.count === "number") ? countObj.count : 0 }))
                .error(err => reject(err));
            })
        ))
        .then(resultsWithCount => {
            return Promise.all(resultsWithCount.map(({ event, count }) =>
                new Promise((resolve) => {
                    const q = (event.location && String(event.location).trim()) ? String(event.location).trim() : "London";
                    apiweatherApi({
                        parameters: {
                            q: q,
                            appid: vault.decrypt('weatherAPI'),
                            units: "metric"
                        }
                    })
                    .success(function(weatherData) {
                        const desc = (weatherData && weatherData.weather && weatherData.weather[0]) ? weatherData.weather[0].description : "N/A";
                        const tempC = (weatherData && weatherData.main && typeof weatherData.main.temp === "number") ? Math.round(weatherData.main.temp) : null;
                        const weatherText = tempC !== null ? `${desc}, ${tempC}°C` : desc;
                        resolve({ event, count, weather: weatherText });
                    })
                    .error(function(err) {
                        console.error("Error fetching weather for " + q, err);
                        resolve({ event, count, weather: "Not available" });
                    });
                })
            ));
        })
        .then(resultsWithWeather => {
            const processedEvents = resultsWithWeather.map(({ event, count, weather }) => ({
                ...event,
                registeredCount: count,
                registrationEnabled: count < event.capacity,
                weather: weather
            }));

            appModel.setProperty("/events", processedEvents);
            createAndBindEventTemplate();
            sap.ui.core.BusyIndicator.hide();
        })
        .catch(error => {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageBox.error("Failed to process event data. Please try again.");
            console.error("Processing Error:", error);
        });
    })
    .error(function(error) {
        sap.ui.core.BusyIndicator.hide();
        sap.m.MessageBox.error("Failed to load events. Please try again.");
        console.error("API Error:", error);
    });
}

function createAndBindEventTemplate() {
    if (typeof eventsTable !== "undefined") {
        if (eventsTable.getBinding("items")) {
            eventsTable.unbindItems();
        }
        var eventRowTemplate = new sap.m.ColumnListItem({
            type: "Active",
            press: onRegisterPress,
            cells: [
                new sap.m.Text({ text: "{appModel>title}" }),
                new sap.m.Text({ text: "{appModel>eventdate}" }),
                new sap.m.Text({ text: "{appModel>location}" }),
                new sap.m.Text({ text: "{appModel>capacity}" }),
                new sap.m.Text({ text: "{appModel>registeredCount}" }),
                new sap.m.Text({ text: "{appModel>weather}" }),
                new sap.m.Button({
                    text: "Register",
                    press: onRegisterPress,
                    enabled: "{appModel>registrationEnabled}"
                })
            ]
        });

        eventsTable.bindItems({
            path: "appModel>/events",
            template: eventRowTemplate
        });
    }
}

function onRegisterPress(oEvent) {
    const context = oEvent.getSource().getBindingContext("appModel");
    const selectedEvent = context.getObject();

    if (!selectedEvent.registrationEnabled) {
        sap.m.MessageBox.error("Sorry, this event is already full.");
        return;
    }

    appModel.setProperty("/selectedEvent", JSON.parse(JSON.stringify(selectedEvent)));

    if (typeof eventNameInput !== 'undefined') {
        eventNameInput.setValue(selectedEvent.title);
    }

    if (typeof App !== 'undefined' && typeof registrationPage !== 'undefined') {
        App.to(registrationPage);
    }
}

function showConfirmationDialog(ticketNumber) {
    if (confirmationDialog) {
        confirmationDialog.destroy();
    }

    confirmationDialog = new sap.m.Dialog({
        title: "Registration Confirmed!",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.Text({ text: "Thank you for registering!" }),
                    new sap.m.Text({ text: "Your Ticket Number is: " + ticketNumber })
                ]
            }).addStyleClass("sapUiSmallMargin")
        ],
        endButton: new sap.m.Button({
            text: "Close",
            type: "Emphasized",
            press: function() {
                confirmationDialog.close();
            }
        }),
        afterClose: function() {
            loadEventsData();
            if (typeof App !== 'undefined') {
                App.back();
            }
            confirmationDialog.destroy();
            confirmationDialog = null;
        }
    });

    if (typeof App !== 'undefined') {
        App.addDependent(confirmationDialog);
    }
    confirmationDialog.open();
}

async function handleSubmitRegistration() {
    const participantName = participantNameInput.getValue();
    const email = emailInput.getValue();

    if (!participantName || !email) {
        sap.m.MessageBox.error("Please fill in your name and email address.");
        return;
    }

    const selectedEvent = appModel.getProperty("/selectedEvent");

    if (!selectedEvent || !selectedEvent.id) {
        sap.m.MessageBox.error("No event selected. Please go back and select an event.");
        return;
    }

    sap.ui.core.BusyIndicator.show(0);
    const ticketNumber = 'TKT-' + Date.now();

	// --- START: Same logic as shshsh/pdf.js 51-56 to generate PDF ---
	const templateName = "eventsticket";
	const objectKey = String(ticketNumber);

	const genFallbackUuid = () => {
		const rnd = (len) => Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b => b.toString(16).padStart(2, "0")).join("");
		try {
			return `${rnd(4)}-${rnd(2)}-${rnd(2)}-${rnd(2)}-${rnd(6)}`;
		} catch (_) {
			return `${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
		}
	};
	const securityKey = (typeof uuid === "function") ? uuid() : genFallbackUuid();

	const pdfBody = {
		title: selectedEvent.title,
		eventDate: selectedEvent.eventdate || selectedEvent.eventDate || new Date().toISOString(),
		attendeeName: participantName,
		ticketNumber: ticketNumber
	};

	let redirectUrl = null;
	try {
		const baseUrl = (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin : "http://localhost:8080";
		// Client-side PDF generation via AJAX to /pdf/{name-of-pdf}
		await new Promise(function(resolve, reject) {
			if (typeof $ === "undefined" || !$ || typeof $.ajax !== "function") {
				reject(new Error("jQuery $.ajax is not available"));
				return;
			}
			var genUrl = "/pdf/" + encodeURIComponent(templateName)
				+ "?objectKey=" + encodeURIComponent(objectKey)
				+ "&securitykey=" + encodeURIComponent(securityKey);
			$.ajax({
				type: "POST",
				url: genUrl,
				// Send as form data; do NOT expect JSON back (endpoint returns PDF/base64)
				data: {
					// PDF interface fields
					title: pdfBody.title,
					eventDate: pdfBody.eventDate,
					attendeeName: pdfBody.attendeeName,
					ticketNumber: pdfBody.ticketNumber,
					// Include keys for archive URL construction
					objectKey: objectKey,
					securityKey: securityKey
				}
			}).done(function(_) {
				resolve();
			}).fail(function(xhr, status, err) {
				reject(err || new Error(status || "PDF request failed"));
			});
		});
		// Build the direct URL after successful generation (include security key)
		redirectUrl = `${baseUrl.replace(/\/$/, "")}/pdf/${encodeURIComponent(templateName)}/${encodeURIComponent(objectKey)}?securitykey=${encodeURIComponent(securityKey)}`;
	} catch (e) {
		console.error("PDF generation error:", e);
	}
	// --- END: Same logic as shshsh/pdf.js 51-56 ---

	const newRegistrationData = {
        eventid: selectedEvent.id,
        attendeename: participantName,
        attendeeemail: email,
        registrationdate: new Date().toISOString().slice(0, 10),
        status: "Confirmed",
		ticketnumber: ticketNumber,
		ticketPDF: redirectUrl || null
    };
    console.log(">>>>>>>", newRegistrationData);

    apieventRegApi({ data: newRegistrationData })
        .success(function(data) {
            sap.ui.core.BusyIndicator.hide();
            clearRegistrationForm();
            showConfirmationDialog(ticketNumber);
        })
        .error(function(error) {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageBox.error("Registration failed. Please try again.");
            console.error("Registration API Error:", error);
        });
}

function handleNavBack() {
    if (typeof App !== 'undefined') {
        App.back();
    }
}

function clearRegistrationForm() {
    if (typeof participantNameInput !== 'undefined') participantNameInput.setValue("");
    if (typeof emailInput !== 'undefined') emailInput.setValue("");
    if (typeof phoneInput !== 'undefined') phoneInput.setValue("");
    if (typeof eventNameInput !== 'undefined') eventNameInput.setValue("");
}

initializeApp();