export const scrollToElement = (id: string) => {
	const element = document.getElementById(id);
	if (element) {
		element.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
		const topPos = element.offsetTop;
		window.scrollTo({
			top: topPos,
			behavior: "smooth",
		});
	}
	return true;
};
