import { useEffect, useState } from "preact/hooks";

type ReadingListItem = {
	title: string;
	url: string;
};

const ReadingList = () => {
	const [listItems, setListItems] = useState<ReadingListItem[]>([]);

	useEffect(() => {
		fetchListItems();
	}, []);

	async function fetchListItems() {
		// @ts-ignore
		const items = (await chrome.readingList.query({})) as ReadingListItem[]; //until the API is available in the typedef
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
