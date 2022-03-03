export const scenario1 = async (input) => {
	const data = await fetch("http://naescobin.pythonanywhere.com/scenario1", {
		// mode: "no-cors",
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return await data.json();
};
export const scenario2 = async (input) => {
	const data = await fetch("http://naescobin.pythonanywhere.com/scenario2", {
		// mode: "no-cors",
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return await data.json();
};
export const scenario3 = async (input) => {
	const data = await fetch("http://naescobin.pythonanywhere.com/scenario3", {
		// mode: "no-cors",
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return await data.json();
};
