import { useEffect, useState } from "preact/hooks";

type ReadingListItem = {
	title?: string;
	url?: string;
	hasBeenRead?: boolean;
};

function getUrlDomain(url?: string) {
	if (!url) {
		return "";
	}
	const urlObj = new URL(url);
	return urlObj.hostname;
}

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
		<div className="w-[300px]">
			<div className="text-xl">Reading List</div>
			<div className="flex flex-col gap-2 m-2">
				{listItems.map((item) => (
					<div className="flex flex-row bg-black p-2 rounded">
						<img
							src={`chrome://favicon/${item.url}`}
							alt="favicon"
							className="w-6 h-6 mr-2"
						/>
						<div className="flex-1 flex flex-col gap-1">
							<div>{item.title}</div>
							<div>{getUrlDomain(item.url)}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ReadingList;
