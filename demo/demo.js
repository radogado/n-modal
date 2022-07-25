fetch(`package.json`).then((response) => response.json()).then((text) => {
	document.querySelectorAll(".headline-version").forEach(el => el.dataset.version = text.version.split(".")[0] + "." + text.version.split(".")[1]);
});

function copyButton(el, target, echo) {
	el.addEventListener("click", (event) => {
		window.getSelection().removeAllRanges(); // Clear previous clipboard
		var range = document.createRange();
		range.selectNode(target);
		window.getSelection().addRange(range);
		try {
			document.execCommand("copy");
		} catch (err) {}
	});
}
document.querySelectorAll(".code").forEach(function(el) {
	el.insertAdjacentHTML("beforeend", "<button class='n-btn' type='button'>Copy</button>");
	copyButton(el.querySelector("button"), el.querySelector("pre"));
});
["css", "js"].forEach((extension) => {
	fetch(`n-modal.min.${extension}.size`).then((response) => response.text()).then((text) => {
		document.querySelectorAll(`[href="n-modal.min.${extension}"]`).forEach(el => {
			el.dataset.size = `${parseFloat(text / 1024).toFixed(1)} KB`
		})
	});
});
document.querySelectorAll(".component-options input").forEach((el) => {
	el.onchange = (e) => {
		let el = e.target;
		let component = el.closest('section').querySelector(".n-modal");
		let snippet = false;
		[...el.closest('section').querySelectorAll("code .attr-value")].forEach((el) => {
			if (!snippet && el.childNodes[2].textContent.match(/n-modal/) && el.previousElementSibling.textContent.match(/class/)) {
				snippet = el.childNodes[2];
			}
		});
		if (el.checked) {
			component.classList.add(el.dataset.class);
			snippet.textContent += ` ${el.dataset.class}`;
		} else {
			component.classList.remove(el.dataset.class);
			snippet.textContent = snippet.textContent.replace(` ${el.dataset.class}`, "").trim();
		}
	};
});