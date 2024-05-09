import { useEffect, useState } from "preact/hooks";
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
			<div className="text-xs text-neutral-100 border-b">Reading List</div>
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
