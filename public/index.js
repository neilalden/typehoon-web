const typhoon_reg_submit = document.getElementById("typhoon_reg_submit");
const typhoon_name_ipt = document.getElementById("typhoon_name");
const signal_number_ipt = document.getElementById("signal_number");
const will_landfall_in_ipt = document.getElementById("will_landfall_in");
const edit_typhoon = document.getElementById("edit_typhoon_reg_submit");
const edit_typhoon_name = document.getElementById("edit_typhoon_name");
const edit_signal_number = document.getElementById("edit_signal_number");
const edit_will_landfall_in = document.getElementById("edit_will_landfall_in");
const delete_typhoon_btn = document.getElementById("delete_typhoon");
const firestore = firebase.firestore();
const typhoonsRef = firestore.collection("typhoons");
const typhoons = [];
const yolanda_users = [];
const habagat_users = [];

const renderTyphoonInformation = (typhoon) => {
	edit_typhoon_name.value = typhoon.name;
	edit_signal_number.value = typhoon.signal_number;
	const date = toDatetimeLocal(new Date(typhoon.landfall));
	edit_will_landfall_in.value = date;
};
let typhoon;
import { scenario1, scenario2, scenario3 } from "./API.js";
let myChart;
const requests_from_yolanda = {
	anos: 0,
	"bagong silang": 0,
	bambang: 66,
	"batong malake": 11,
	baybayin: 2,
	bayog: 4,
	lalakay: 13,
	maahas: 5,
	malinta: 7,
	mayondon: 0,
	"san antonio": 0,
	tadlac: 11,
	timugan: 0,
	"putho-tuntungin": 0,
};
const requests_from_habagat = {
	anos: 0,
	"bagong silang": 0,
	bambang: 77,
	"batong malake": 0,
	baybayin: 15,
	bayog: 0,
	lalakay: 0,
	maahas: 0,
	malinta: 2,
	mayondon: 22,
	"san antonio": 0,
	tadlac: 8,
	timugan: 0,
	"putho-tuntungin": 0,
};
const BARANGAYS = [
	"anos",
	"bagong silang",
	"bambang",
	"batong malake",
	"baybayin",
	"bayog",
	"lalakay",
	"maahas",
	"malinta",
	"mayondon",
	"putho-tuntungin",
	"san antonio",
	"tadlac",
	"timugan",
];
delete_typhoon_btn.addEventListener("click", (e) => {
	e.preventDefault();
	if (confirm(`Delete typhoon ${typhoon.name}?`) == true) {
		firestore
			.collection("typhoons")
			.doc(typhoon.id)
			.delete()
			.then(() => location.reload())
			.catch((e) => console.log(e));
	} else {
		console.log("You canceled!");
	}
});
edit_typhoon.addEventListener("click", (event) => {
	event.preventDefault();
	if (edit_typhoon.innerText == "Update") {
		edit_typhoon_name.removeAttribute("disabled");
		edit_signal_number.removeAttribute("disabled");
		edit_will_landfall_in.removeAttribute("disabled");
		edit_typhoon.classList.remove("btn-warning");
		edit_typhoon.classList.add("btn-success");
		edit_typhoon.innerText = "Save";
	} else {
		if (
			typhoon.id &&
			(edit_typhoon_name.value != "" ||
				edit_signal_number.value != "" ||
				edit_will_landfall_in.value != "")
		) {
			try {
				document.querySelector(".added-item").remove();

				firestore
					.collection("typhoons")
					.doc(typhoon.id)
					.update({
						name: edit_typhoon_name.value,
						signal_number: edit_signal_number.value,
						landfall: new Date(edit_will_landfall_in.value),
					})
					.then(() => {
						alert(`Typhhon ${edit_typhoon_name.value} updated`);
					})
					.catch((e) => alert(e.message));
			} catch (e) {
				alert(e);
			}
		}

		edit_typhoon_name.disabled = true;
		edit_signal_number.disabled = true;
		edit_will_landfall_in.disabled = true;
		edit_typhoon.classList.add("btn-warning");
		edit_typhoon.classList.remove("btn-success");
		edit_typhoon.innerText = "Update";
	}
});
const generate_users = (typhoon_name) => {
	for (const i in BARANGAYS) {
		if (typhoon_name == "Yolanda") {
			for (let j = 0; j < requests_from_yolanda[BARANGAYS[i]]; j++) {
				const user = {
					id: `${BARANGAYS[i]}${[j]}`,
					barangay: BARANGAYS[i],
					name: `${BARANGAYS[i]}${[j]}`,
					isSenior: Math.random() < 0.046,
					livesWith: Math.random() < 5 ? Math.floor(Math.random() * 5) + 1 : 0,
				};
				yolanda_users.push(user);
			}
		} else if (typhoon_name == "Habagat") {
			for (let j = 0; j < requests_from_habagat[BARANGAYS[i]]; j++) {
				const user = {
					id: `${BARANGAYS[i]}${[j]}`,
					barangay: BARANGAYS[i],
					name: `${BARANGAYS[i]}${[j]}`,
					isSenior: Math.random() < 0.046,
					livesWith: Math.random() < 5 ? Math.floor(Math.random() * 5) + 1 : 0,
				};
				habagat_users.push(user);
			}
		}
	}
};

typhoonsRef.onSnapshot((querySnapshot) => {
	querySnapshot.forEach((doc) => {
		typhoons.push({
			id: doc.id,
			immediate_evacuation: doc.data().immediate_evacuation,
			landfall: new Date(doc.data().landfall.seconds * 1000),
			name: doc.data().name,
			signal_number: doc.data().signal_number,
			to_evacuate: doc.data().to_evacuate,
			to_immediate_evacuate: doc.data().to_immediate_evacuate,
		});
		const dropdown_btm = document.getElementById("dropdownMenuButton1");
		const dropdown_menu = document.getElementById("dropdown-menu");
		var node = document.createElement("li");
		var href = document.createElement("button");
		var textnode = document.createTextNode(doc.data().name);
		href.classList.add("dropdown-item");
		href.classList.add("added-item");
		href.appendChild(textnode);
		node.appendChild(href);
		dropdown_menu.appendChild(node);
		var elements = document.getElementsByClassName("dropdown-item");
		Array.from(elements).forEach((element) => {
			element.addEventListener("click", (event) => {
				var tableHeaderRowCount = 1;
				var table = document.getElementById("pager");
				var rowCount = table.rows.length;
				for (var i = tableHeaderRowCount; i < rowCount; i++) {
					table.deleteRow(tableHeaderRowCount);
				}

				const typhoon_name = event.target.innerText;
				dropdown_btm.innerText = typhoon_name;

				for (const i in typhoons) {
					if (typhoons[i].name == typhoon_name) {
						typhoon = typhoons[i];
					}
				}

				let requests_from = {};
				if (
					typhoon.to_immediate_evacuate.length == 0 &&
					typhoon.to_evacuate == 0
				) {
					for (const i in BARANGAYS) {
						requests_from[BARANGAYS[i]] = 0;
					}
					renderTyphoonInformation(typhoon);
					const color = generate_colors(requests_from)[0];
					myChart.destroy();
					renderChart(requests_from, color);
					renderMap(color);
				} else if (typhoon_name === "Yolanda") {
					requests_from = requests_from_yolanda;

					for (const i in yolanda_users) {
						addRow(yolanda_users[i], "NECCESSARY");
					}
					renderTyphoonInformation(typhoon);
					const color = generate_colors(requests_from)[0];
					myChart.destroy();
					renderChart(requests_from, color);
					renderMap(color);
				} else if (typhoon_name === "Habagat") {
					requests_from = requests_from_habagat;

					for (const i in habagat_users) {
						addRow(habagat_users[i], "NECCESSARY");
					}
					renderTyphoonInformation(typhoon);
					const color = generate_colors(requests_from)[0];
					myChart.destroy();
					renderChart(requests_from, color);
					renderMap(color);
				} else {
					for (const i in BARANGAYS) {
						requests_from[BARANGAYS[i]] = 0;
					}
					renderTyphoonInformation(typhoon);
					if (typhoon.signal_number >= 3) {
						firestore
							.collection("users")
							.get()
							.then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if (
										doc.data().isSenior ||
										doc.data().isPWD ||
										doc.data().isInFloodingArea ||
										doc.data().isInLandslideArea
									) {
										const adder = doc.data().livesWith
											? doc.data().livesWith
											: 0;
										requests_from[doc.data().barangay.toLowerCase()] += 1;
										addRow(doc.data(), "FORCE");
									}
								});
								const color = generate_colors(requests_from)[0];
								myChart.destroy();
								renderChart(requests_from, color);
								renderMap(color);
							});
					}
					for (const i in typhoon.to_immediate_evacuate) {
						firestore
							.collection("users")
							.doc(typhoon.to_immediate_evacuate[i])
							.get()
							.then((res) => {
								const adder = res.data().livesWith ? res.data().livesWith : 0;
								requests_from[res.data().barangay.toLowerCase()] += 1;
								addRow(res.data(), "IMMIDIATE");
								if (i == typhoon.to_immediate_evacuate.length - 1) {
									const color = generate_colors(requests_from)[0];
									myChart.destroy();
									renderChart(requests_from, color);
									renderMap(color);
									let pager = new Pager("pager", 5);
									pager.init();
									pager.showPageNav("pager", "pageNavPosition");
									pager.showPage(1);
								}
							});
					}
					for (const i in typhoon.to_evacuate) {
						firestore
							.collection("users")
							.doc(typhoon.to_evacuate[i])
							.get()
							.then((res) => {
								const adder = res.data().livesWith ? res.data().livesWith : 0;
								requests_from[res.data().barangay.toLowerCase()] += 1;

								addRow(res.data(), "NECCESSARY");
								if (i == typhoon.to_evacuate.length - 1) {
									const color = generate_colors(requests_from)[0];
									myChart.destroy();
									renderChart(requests_from, color);
									renderMap(color);
									let pager = new Pager("pager", 5);
									pager.init();
									pager.showPageNav("pager", "pageNavPosition");
									pager.showPage(1);
								}
							});
					}
				}

				let pager = new Pager("pager", 5);
				pager.init();
				pager.showPageNav("pager", "pageNavPosition");
				pager.showPage(1);
			});
		});
	});
});

// RENDER CHART
async function renderChart(requests, color) {
	var result = Object.keys(requests).map((key) => requests[key]);
	var colors = Object.keys(requests).map((key) => color[key]);
	const entries = Object.entries(requests);
	const arr = [];
	for (const i in entries) {
		arr.push(entries[i][0]);
		arr.push(entries[i][1]);
	}

	for (const i in arr) {
		if (typeof arr[i] === "string") {
			arr[i] = arr[i].replace(/\w+/g, function (w) {
				return w[0].toUpperCase() + w.slice(1).toLowerCase();
			});
		}
	}

	const ctx = document.getElementById("myChart");
	const barColors = Object.values(colors);
	myChart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: Object.keys(requests),
			datasets: [
				{
					label: "Families to evacuate",
					data: result,
					backgroundColor: barColors,
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			indexAxis: "y",
			scales: {
				y: {
					beginAtZero: true,
				},
			},
			scales: {
				x: {
					stacked: true,
				},
				y: {
					stacked: true,
				},
			},
		},
	});

	renderHistogram(await scenario1(arr), "Scenario 1");
	renderHistogram(await scenario2(arr), "Scenario 2");
	renderHistogram(await scenario3(arr), "Scenario 3");
}

const renderHistogram = (d, id) => {
	var trace = {
		x: d,
		type: "histogram",
	};
	var data = [trace];

	var layout = {
		title: `${id} results`,
		xaxis: { title: "Minutes took the evacuation to complete" },
		yaxis: { title: "Iteration" },
	};
	Plotly.newPlot(id, data, layout);
};
// RENDER MAP
function renderMap(colors) {
	var shpURL = "assets/lb_gis.shp";
	var dbfURL = "assets/lb_gis.dbf";
	var shpFile;
	var dbfFile;
	var shpLoader = new BinaryAjax(shpURL, onShpComplete, onShpFail);
	var dbfLoader = new BinaryAjax(dbfURL, onDbfComplete, onDbfFail);
	function onShpFail() {
		alert("failed to load " + shpURL);
	}
	function onDbfFail() {
		alert("failed to load " + dbfURL);
	}
	function onShpComplete(oHTTP) {
		var binFile = oHTTP.binaryResponse;
		if (window.console && window.console.log) shpFile = new ShpFile(binFile);
		if (
			shpFile.header.shapeType != ShpType.SHAPE_POLYGON &&
			shpFile.header.shapeType != ShpType.SHAPE_POLYLINE
		) {
			alert(
				"Shapefile does not contain Polygon records (found type: " +
					shpFile.header.shapeType +
					")",
			);
		}
		if (dbfFile) {
			render(shpFile.records, dbfFile.records);
		}
	}
	function onDbfComplete(oHTTP) {
		var binFile = oHTTP.binaryResponse;
		if (window.console && window.console.log) dbfFile = new DbfFile(binFile);
		if (shpFile) {
			render(shpFile.records, dbfFile.records);
		}
	}
	function render(records, data) {
		if (window.console && window.console.log)
			var canvas = document.getElementById("map");
		if (window.G_vmlCanvasManager) {
			G_vmlCanvasManager.initElement(canvas);
		}
		var t1 = new Date().getTime();
		if (window.console && window.console.log) var box;
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (
				record.shapeType == ShpType.SHAPE_POLYGON ||
				record.shapeType == ShpType.SHAPE_POLYLINE
			) {
				var shp = record.shape;
				for (var j = 0; j < shp.rings.length; j++) {
					var ring = shp.rings[j];
					for (var k = 0; k < ring.length; k++) {
						if (!box) {
							box = { x: ring[k].x, y: ring[k].y, width: 0, height: 0 };
						} else {
							var l = Math.min(box.x, ring[k].x);
							var t = Math.min(box.y, ring[k].y);
							var r = Math.max(box.x + box.width, ring[k].x);
							var b = Math.max(box.y + box.height, ring[k].y);
							box.x = l;
							box.y = t;
							box.width = r - l;
							box.height = b - t;
						}
					}
				}
			}
		}
		var t2 = new Date().getTime();
		if (window.console && window.console.log) t1 = new Date().getTime();
		if (window.console && window.console.log) var ctx = canvas.getContext("2d");
		var sc = Math.min(800 / box.width, 400 / box.height);
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, 800, 400);
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = "#ffffff";
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (
				record.shapeType == ShpType.SHAPE_POLYGON ||
				record.shapeType == ShpType.SHAPE_POLYLINE
			) {
				var shp = record.shape;
				for (var j = 0; j < shp.rings.length; j++) {
					var ring = shp.rings[j];
					if (ring.length < 1) continue;
					ctx.fillStyle = getFillRecord(data[i], i);
					ctx.beginPath();
					ctx.moveTo((ring[0].x - box.x) * sc, 400 - (ring[0].y - box.y) * sc);
					for (var k = 1; k < ring.length; k++) {
						ctx.lineTo(
							(ring[k].x - box.x) * sc,
							400 - (ring[k].y - box.y) * sc,
						);
					}
					ctx.fill();
					ctx.stroke();
				}
			}
		}
		t2 = new Date().getTime();
	}
	function getFillRecord(r, i) {
		let record = r.values.Bgy_Name.replace("(pob.)", "");
		record = record.trim();
		if (record == "putho tuntungin") {
			record = "putho-tuntungin";
		} else if (record == "tadlak") {
			record = "tadlac";
		}
		return colors[record];
	}
}
const generate_colors = (requests) => {
	let colors = {};
	let second_colors = {};
	const sorted_requests = Object.entries(requests)
		.sort(([, a], [, b]) => b - a)
		.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
	let brgysWithRequests = 0;
	let sorted_keys = Object.keys(sorted_requests);
	for (let i in Object.values(sorted_requests)) {
		if (Object.values(sorted_requests)[i] > 0) {
			brgysWithRequests++;
		}
	}
	const temp = chroma
		.scale(["#4d0000", "#ff6666"])
		.mode("lch")
		.colors(brgysWithRequests);
	const second_temp = chroma
		.scale(["#4d4d00", "#ffff99"])
		.mode("lch")
		.colors(brgysWithRequests);
	for (let i in sorted_keys) {
		if (i >= brgysWithRequests) {
			colors[sorted_keys[i]] = "#ffe6e6";
			second_colors[sorted_keys[i]] = "#ffffe6";
		} else {
			colors[sorted_keys[i]] = temp[i];
			second_colors[sorted_keys[i]] = second_temp[i];
		}
	}
	return [colors, second_colors];
};
const get_users = (typhoon_name) => {
	generate_users(typhoon_name);
	const user_names = [];
	if (typhoon_name == "Yolanda") {
		for (const i in yolanda_users) {
			user_names.push(yolanda_users[i].id);
		}
	} else {
		for (const i in habagat_users) {
			user_names.push(habagat_users[i].id);
		}
	}
	return user_names;
};
const yolanda_test_data = {
	immediate_evacuation: true,
	name: "Yolanda",
	signal_number: 3,
	landfall: new Date("Nov 3, 2013 00:00:00"),
	to_evacuate: get_users("Yolanda"),
	to_immediate_evacuate: [],
};
const habagat_test_data = {
	immediate_evacuation: true,
	name: "Habagat",
	signal_number: 3,
	landfall: new Date("Sept 26, 2013 00:00:00"),
	to_evacuate: get_users("Habagat"),
	to_immediate_evacuate: [],
};
typhoon = yolanda_test_data;
typhoons.push(yolanda_test_data);
typhoons.push(habagat_test_data);
const color = generate_colors(requests_from_yolanda)[0];
renderChart(requests_from_yolanda, color);
renderMap(color);
function toDatetimeLocal(d) {
	const date = new Date(d),
		ten = (i) => (i < 10 ? "0" : "") + i,
		YYYY = date.getFullYear(),
		MTH = ten(date.getMonth() + 1),
		DAY = ten(date.getDate()),
		HH = ten(date.getHours()),
		MM = ten(date.getMinutes()),
		SS = ten(date.getSeconds());

	return `${YYYY}-${MTH}-${DAY}T${HH}:${MM}:${SS}`;
}
renderTyphoonInformation(yolanda_test_data);
for (const i in yolanda_users) {
	addRow(yolanda_users[i], "NECCESSARY");
}

typhoon_reg_submit.addEventListener("click", function (e) {
	e.preventDefault();
	if (
		typhoon_name_ipt.value != "" ||
		signal_number_ipt.value != "" ||
		will_landfall_in_ipt.value != ""
	) {
		try {
			firestore
				.collection("typhoons")
				.add({
					name: typhoon_name_ipt.value,
					signal_number: signal_number_ipt.value,
					landfall: new Date(will_landfall_in_ipt.value),
					to_evacuate: [],
					to_immediate_evacuate: [],
				})
				.then(() => {
					typhoon_name_ipt.value = "";
					signal_number_ipt.value = "";
					will_landfall_in_ipt.value = "";
					document.querySelector(".added-item").remove();
					alert("Typhoon registered!");
				})
				.catch((e) => alert(e.message));
		} catch (e) {
			alert(e);
		}
	}
});
function addRow(user, evac_type) {
	// Get a reference to the table
	let tableRef = document.getElementById("pager");
	// Insert a row at the end of the table
	let newRow = tableRef.insertRow(-1);

	// Insert a cell in the row at index 0
	let nameCell = newRow.insertCell(0);
	let addressCell = newRow.insertCell(1);
	let familyCell = newRow.insertCell(2);
	let immediateEvacCell = newRow.insertCell(3);
	// Append a text node to the cell
	let nameText = document.createTextNode(user.name);
	nameCell.appendChild(nameText);
	let addressText = document.createTextNode(
		user.houseNumber
			? user.houseNumber + " " + user.street + " " + user.barangay.toUpperCase()
			: user.barangay.toUpperCase(),
	);
	addressCell.appendChild(addressText);
	let familyText = document.createTextNode(user.livesWith);
	familyCell.appendChild(familyText);
	let immediateEvacText = document.createTextNode(evac_type);
	immediateEvacCell.appendChild(immediateEvacText);
}
