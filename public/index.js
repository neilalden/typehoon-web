const firestore = firebase.firestore();
const typhoonsRef = firestore.collection("typhoons");
const typhoons = [];
const users = [];
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
const generate_users = () => {
	for (const i in BARANGAYS) {
		for (let j = 0; j < requests_from_yolanda[BARANGAYS[i]]; j++) {
			const user = {
				id: `${BARANGAYS[i]}${[j]}`,
				barangay: BARANGAYS[i],
				name: `${BARANGAYS[i]}${[j]}`,
				isSenior: Math.random() < 0.046,
			};
			users.push(user);
		}
	}
};

typhoonsRef.get().then((querySnapshot) => {
	querySnapshot.forEach((doc) => {
		typhoons.push({
			immediate_evacuation: doc.data().immediate_evacuation,
			landfall: new Date(doc.data().landfall.seconds * 1000),
			name: doc.data().name,
			signal_number: doc.data().signal_number,
			to_evacuate: doc.data().to_evacuate,
			to_immediate_evacuate: doc.data().to_immediate_evacuate,
		});
		const dropdown_btm = document.getElementById("dropdownMenuButton1");
		const dropdown_menu = document.getElementById("dropdown-menu");
		for (const i in typhoons) {
			var node = document.createElement("li");
			var href = document.createElement("button");
			var textnode = document.createTextNode(typhoons[i].name);
			href.classList.add("dropdown-item");
			href.appendChild(textnode);
			node.appendChild(href);
			dropdown_menu.appendChild(node);
		}
		var elements = document.getElementsByClassName("dropdown-item");
		Array.from(elements).forEach((element) => {
			element.addEventListener("click", (event) => {
				const typhoon_name = event.target.innerText;
				dropdown_btm.innerText = typhoon_name;
				let typhoon;

				for (const i in typhoons) {
					if (typhoons[i].name == typhoon_name) {
						typhoon = typhoons[i];
					}
				}

				let requests_from = {};
				if (typhoon_name === "yolanda_test_data") {
					requests_from = requests_from_yolanda;

					const color = generate_colors(requests_from)[0];
					myChart.destroy();
					renderChart(requests_from, color);
					renderMap(color);
				} else {
					for (const i in BARANGAYS) {
						requests_from[BARANGAYS[i]] = 0;
					}
					for (const i in typhoon.to_evacuate) {
						firestore
							.collection("users")
							.doc(typhoon.to_evacuate[i])
							.get()
							.then((res) => {
								const adder = res.data().livesWith ? res.data().livesWith : 0;
								requests_from[res.data().barangay.toLowerCase()] += 1;
								if (i == typhoon.to_evacuate.length - 1) {
									const color = generate_colors(requests_from)[0];
									myChart.destroy();
									renderChart(requests_from, color);
									renderMap(color);
								}
							});
					}
					// for (const i in typhoon.to_immediate_evacuate) {
					// 	firestore
					// 		.collection("users")
					// 		.doc(typhoon.to_immediate_evacuate[i])
					// 		.get()
					// 		.then((res) => {
					// 			const adder = res.data().livesWith ? res.data().livesWith : 0;
					// 			requests_from[res.data().barangay.toLowerCase()] += adder + 1;
					// 			if (i == typhoon.to_immediate_evacuate.length - 1) {
					// 				const color = generate_colors(requests_from)[0];
					// 				myChart.destroy();
					// 				renderChart(requests_from, color);
					// 				renderMap(color);
					// 			}
					// 		});
					// }
				}
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

	renderHistogram(await scenario1(arr), "scenario1");
	renderHistogram(await scenario2(arr), "scenario2");
	renderHistogram(await scenario3(arr), "scenario3");
}

const renderHistogram = (data, id) => {
	console.log(data);
	var trace = {
		x: data,
		type: "histogram",
	};
	var d = [trace];
	Plotly.newPlot(id, d);
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
const get_users = () => {
	generate_users();
	const user_names = [];
	for (const i in users) {
		user_names.push(users[i].id);
	}
	return user_names;
};
const yolanda_test_data = {
	immediate_evacuation: true,
	name: "yolanda_test_data",
	signal_number: 3,
	landfall: new Date(),
	to_evacuate: get_users(),
	to_immediate_evacuate: [],
};
typhoons.push(yolanda_test_data);
const color = generate_colors(requests_from_yolanda)[0];
renderChart(requests_from_yolanda, color);
renderMap(color);
