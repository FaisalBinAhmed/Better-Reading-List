import { useContext, useEffect, useState } from "preact/hooks";
const ReadingList = () => {
	const [listItems, setListItems] = useState<string[]>([]);

	useEffect(() => {
		fetchListItems();
	}, []);

	async function fetchListItems() {
		const items = await chrome.readingList.query({});
		setListItems(items);
	}

	return (
		<div>
			<h1>Reading List</h1>
			<ul>
				{listItems.map((item) => (
					<li>
						{item.title}
						{item.url}
					</li>
				))}
			</ul>
		</div>
	);
};

export default ReadingList;
